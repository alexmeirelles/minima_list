import { supabase } from '@/lib/supabase';
import type { TodoItem, SomedayList } from '@/store/useTodoStore';

export interface CloudUserData {
  todos: Record<string, TodoItem[]>;
  somedayLists: SomedayList[];
  preferences: {
    workspaceName?: string;
    darkMode?: boolean;
    gridColumnSize?: number;
    accentColor?: string;
    textSize?: 'S' | 'M' | 'L';
    spacing?: 'S' | 'M' | 'L';
    showCompleted?: boolean;
    showLines?: boolean;
    bulletStyle?: 'none' | 'square' | 'dot' | 'arrow';
    rolloverEnabled?: boolean;
    language?: 'pt' | 'en';
  };
}

export async function fetchUserCloudData(userId: string): Promise<CloudUserData> {
  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // 2. Fetch someday lists
  const { data: lists } = await supabase
    .from('someday_lists')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  // 3. Fetch todos
  const { data: dbTodos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true });

  const todosByDate: Record<string, TodoItem[]> = {};
  const somedayMap: Record<string, TodoItem[]> = {};

  if (lists) {
    for (const l of lists) {
      somedayMap[l.id] = [];
    }
  }

  if (dbTodos) {
    for (const t of dbTodos) {
      const item: TodoItem = {
        id: t.id,
        text: t.text,
        done: t.done,
        notes: t.notes || '',
        createdAt: new Date(t.created_at).getTime(),
      };

      if (t.date_key) {
        if (!todosByDate[t.date_key]) todosByDate[t.date_key] = [];
        todosByDate[t.date_key].push(item);
      } else if (t.list_id && somedayMap[t.list_id]) {
        somedayMap[t.list_id].push(item);
      }
    }
  }

  const somedayLists: SomedayList[] = (lists || []).map((l) => ({
    id: l.id,
    name: l.name,
    items: somedayMap[l.id] || [],
  }));

  return {
    todos: todosByDate,
    somedayLists,
    preferences: {
      workspaceName: profile?.workspace_name,
      darkMode: profile?.dark_mode,
      gridColumnSize: profile?.grid_column_size,
      accentColor: profile?.accent_color,
      textSize: profile?.text_size,
      spacing: profile?.spacing,
      showCompleted: profile?.show_completed,
      showLines: profile?.show_lines,
      bulletStyle: profile?.bullet_style,
      rolloverEnabled: profile?.rollover_enabled,
      language: profile?.language,
    },
  };
}

export async function upsertCloudTodo(
  userId: string,
  todo: TodoItem,
  dateKey?: string,
  listId?: string,
  orderIndex: number = 0
) {
  return supabase.from('todos').upsert({
    id: todo.id,
    user_id: userId,
    date_key: dateKey || null,
    list_id: listId || null,
    text: todo.text,
    done: todo.done,
    notes: todo.notes || '',
    order_index: orderIndex,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteCloudTodo(userId: string, todoId: string) {
  return supabase.from('todos').delete().eq('id', todoId).eq('user_id', userId);
}

export async function upsertCloudSomedayList(
  userId: string,
  list: SomedayList,
  orderIndex: number
) {
  return supabase.from('someday_lists').upsert({
    id: list.id,
    user_id: userId,
    name: list.name,
    order_index: orderIndex,
  });
}

export async function deleteCloudSomedayList(userId: string, listId: string) {
  return supabase
    .from('someday_lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', userId);
}

export async function updateCloudPreferences(
  userId: string,
  updates: Record<string, any>
) {
  return supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function syncLocalStateToCloud(
  userId: string,
  todos: Record<string, TodoItem[]>,
  somedayLists: SomedayList[]
) {
  // Sync all someday lists
  for (let i = 0; i < somedayLists.length; i++) {
    const list = somedayLists[i];
    await upsertCloudSomedayList(userId, list, i);
    for (let j = 0; j < list.items.length; j++) {
      await upsertCloudTodo(userId, list.items[j], undefined, list.id, j);
    }
  }

  // Sync all calendar date todos
  for (const [dateKey, items] of Object.entries(todos)) {
    for (let i = 0; i < items.length; i++) {
      await upsertCloudTodo(userId, items[i], dateKey, undefined, i);
    }
  }
}
