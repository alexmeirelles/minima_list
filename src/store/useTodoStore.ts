'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/lib/i18n';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  notes?: string;
  recurringTemplateId?: string;
  createdAt: number;
}

export interface SomedayList {
  id: string;
  name: string;
  items: TodoItem[];
}

export interface RecurringTemplate {
  id: string;
  text: string;
  pattern: 'daily' | 'weekly' | 'weekdays' | 'monthly';
  dayOfWeek?: number; // 0 (Sunday) to 6 (Saturday)
}

interface TodoState {
  todos: Record<string, TodoItem[]>;
  somedayLists: SomedayList[];
  recurringTemplates: RecurringTemplate[];
  darkMode: boolean;
  gridColumnSize: number;
  inFocusMode: boolean;
  workspaceName: string;
  selectedTodo: { id: string; dateOrListId: string; isSomeday: boolean } | null;
  activeSomedayListId: string | null;
  accentColor: string;
  rolloverEnabled: boolean;
  language: Language;
  hasSeeded: boolean;
  showLines: boolean;
  bulletStyle: 'none' | 'square' | 'dot' | 'arrow';
  textSize: 'S' | 'M' | 'L';
  spacing: 'S' | 'M' | 'L';
  showCompleted: boolean;
  isPreferencesOpen: boolean;

  // Actions
  addTodo: (dateOrListId: string, text: string, isSomeday: boolean) => string;
  toggleTodo: (dateOrListId: string, todoId: string, isSomeday: boolean) => void;
  updateTodoText: (dateOrListId: string, todoId: string, isSomeday: boolean, text: string) => void;
  updateTodoNotes: (dateOrListId: string, todoId: string, isSomeday: boolean, notes: string) => void;
  deleteTodo: (dateOrListId: string, todoId: string, isSomeday: boolean) => void;
  reorderTodos: (dateOrListId: string, items: TodoItem[], isSomeday: boolean) => void;
  moveTodo: (
    fromId: string,
    toId: string,
    todoId: string,
    fromSomeday: boolean,
    toSomeday: boolean,
    targetIndex?: number
  ) => void;
  
  // Someday List Actions
  addSomedayList: (name: string) => string;
  renameSomedayList: (listId: string, name: string) => void;
  deleteSomedayList: (listId: string) => void;
  reorderSomedayLists: (sourceId: string, targetId: string) => void;
  setActiveSomedayListId: (listId: string | null) => void;
  
  // Settings Actions
  setDarkMode: (dark: boolean) => void;
  setGridColumnSize: (size: number) => void;
  setInFocusMode: (focus: boolean) => void;
  setWorkspaceName: (name: string) => void;
  setSelectedTodo: (todo: { id: string; dateOrListId: string; isSomeday: boolean } | null) => void;
  setLanguage: (lang: Language) => void;
  setAccentColor: (color: string) => void;
  setRolloverEnabled: (enabled: boolean) => void;
  rolloverPastTodos: (todayKey: string) => number;
  setShowLines: (show: boolean) => void;
  setBulletStyle: (style: 'none' | 'square' | 'dot' | 'arrow') => void;
  setTextSize: (size: 'S' | 'M' | 'L') => void;
  setSpacing: (spacing: 'S' | 'M' | 'L') => void;
  setShowCompleted: (show: boolean) => void;
  setIsPreferencesOpen: (open: boolean) => void;

  // Recurring Actions
  addRecurringTemplate: (text: string, pattern: RecurringTemplate['pattern'], dayOfWeek?: number) => void;
  deleteRecurringTemplate: (id: string) => void;
  instantiateRecurringTodos: (dates: string[]) => void;

  // Onboarding
  seedOnboarding: (todayKey: string) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: {},
      somedayLists: [
        { id: 'someday-default', name: 'Someday', items: [] }
      ],
      recurringTemplates: [],
      darkMode: false,
      gridColumnSize: 7,
      inFocusMode: false,
      workspaceName: '',
      selectedTodo: null,
      activeSomedayListId: 'someday-default',
      accentColor: '#852CE6',
      rolloverEnabled: true,
      language: 'pt' as Language,
      hasSeeded: false,
      showLines: true,
      bulletStyle: 'none',
      textSize: 'M',
      spacing: 'M',
      showCompleted: true,
      isPreferencesOpen: false,

      addTodo: (dateOrListId, text, isSomeday) => {
        const id = crypto.randomUUID();
        const newItem: TodoItem = {
          id,
          text,
          done: false,
          notes: '',
          createdAt: Date.now(),
        };

        if (isSomeday) {
          set((state) => {
            const listIndex = state.somedayLists.findIndex((l) => l.id === dateOrListId);
            if (listIndex === -1) return {};
            const updatedLists = [...state.somedayLists];
            updatedLists[listIndex] = {
              ...updatedLists[listIndex],
              items: [...updatedLists[listIndex].items, newItem],
            };
            return { somedayLists: updatedLists };
          });
        } else {
          set((state) => {
            const currentList = state.todos[dateOrListId] || [];
            return {
              todos: {
                ...state.todos,
                [dateOrListId]: [...currentList, newItem],
              },
            };
          });
        }
        return id;
      },

      toggleTodo: (dateOrListId, todoId, isSomeday) => {
        if (isSomeday) {
          set((state) => {
            const listIndex = state.somedayLists.findIndex((l) => l.id === dateOrListId);
            if (listIndex === -1) return {};
            const updatedLists = [...state.somedayLists];
            const items = updatedLists[listIndex].items.map((item) =>
              item.id === todoId ? { ...item, done: !item.done } : item
            );
            updatedLists[listIndex] = { ...updatedLists[listIndex], items };
            return { somedayLists: updatedLists };
          });
        } else {
          set((state) => {
            const items = (state.todos[dateOrListId] || []).map((item) =>
              item.id === todoId ? { ...item, done: !item.done } : item
            );
            return {
              todos: {
                ...state.todos,
                [dateOrListId]: items,
              },
            };
          });
        }
      },

      updateTodoText: (dateOrListId, todoId, isSomeday, text) => {
        if (isSomeday) {
          set((state) => {
            const listIndex = state.somedayLists.findIndex((l) => l.id === dateOrListId);
            if (listIndex === -1) return {};
            const updatedLists = [...state.somedayLists];
            const items = updatedLists[listIndex].items.map((item) =>
              item.id === todoId ? { ...item, text } : item
            );
            updatedLists[listIndex] = { ...updatedLists[listIndex], items };
            return { somedayLists: updatedLists };
          });
        } else {
          set((state) => {
            const items = (state.todos[dateOrListId] || []).map((item) =>
              item.id === todoId ? { ...item, text } : item
            );
            return {
              todos: {
                ...state.todos,
                [dateOrListId]: items,
              },
            };
          });
        }
      },

      updateTodoNotes: (dateOrListId, todoId, isSomeday, notes) => {
        if (isSomeday) {
          set((state) => {
            const listIndex = state.somedayLists.findIndex((l) => l.id === dateOrListId);
            if (listIndex === -1) return {};
            const updatedLists = [...state.somedayLists];
            const items = updatedLists[listIndex].items.map((item) =>
              item.id === todoId ? { ...item, notes } : item
            );
            updatedLists[listIndex] = { ...updatedLists[listIndex], items };
            return { somedayLists: updatedLists };
          });
        } else {
          set((state) => {
            const items = (state.todos[dateOrListId] || []).map((item) =>
              item.id === todoId ? { ...item, notes } : item
            );
            return {
              todos: {
                ...state.todos,
                [dateOrListId]: items,
              },
            };
          });
        }
      },

      deleteTodo: (dateOrListId, todoId, isSomeday) => {
        set((state) => {
          let selectedTodo = state.selectedTodo;
          if (selectedTodo?.id === todoId) {
            selectedTodo = null;
          }

          if (isSomeday) {
            const listIndex = state.somedayLists.findIndex((l) => l.id === dateOrListId);
            if (listIndex === -1) return {};
            const updatedLists = [...state.somedayLists];
            const items = updatedLists[listIndex].items.filter((item) => item.id !== todoId);
            updatedLists[listIndex] = { ...updatedLists[listIndex], items };
            return { somedayLists: updatedLists, selectedTodo };
          } else {
            const items = (state.todos[dateOrListId] || []).filter((item) => item.id !== todoId);
            return {
              todos: {
                ...state.todos,
                [dateOrListId]: items,
              },
              selectedTodo,
            };
          }
        });
      },

      reorderTodos: (dateOrListId, items, isSomeday) => {
        if (isSomeday) {
          set((state) => {
            const listIndex = state.somedayLists.findIndex((l) => l.id === dateOrListId);
            if (listIndex === -1) return {};
            const updatedLists = [...state.somedayLists];
            updatedLists[listIndex] = { ...updatedLists[listIndex], items };
            return { somedayLists: updatedLists };
          });
        } else {
          set((state) => ({
            todos: {
              ...state.todos,
              [dateOrListId]: items,
            },
          }));
        }
      },

      moveTodo: (fromId, toId, todoId, fromSomeday, toSomeday, targetIndex) => {
        set((state) => {
          let itemToMove: TodoItem | null = null;

          // Find and remove item from source
          let updatedTodos = { ...state.todos };
          let updatedSomedayLists = [...state.somedayLists];

          if (fromSomeday) {
            const fromListIndex = updatedSomedayLists.findIndex((l) => l.id === fromId);
            if (fromListIndex !== -1) {
              const list = updatedSomedayLists[fromListIndex];
              const item = list.items.find((i) => i.id === todoId);
              if (item) {
                itemToMove = item;
                updatedSomedayLists[fromListIndex] = {
                  ...list,
                  items: list.items.filter((i) => i.id !== todoId),
                };
              }
            }
          } else {
            const items = updatedTodos[fromId] || [];
            const item = items.find((i) => i.id === todoId);
            if (item) {
              itemToMove = item;
              updatedTodos[fromId] = items.filter((i) => i.id !== todoId);
            }
          }

          if (!itemToMove) return {};

          // Add item to target
          if (toSomeday) {
            const toListIndex = updatedSomedayLists.findIndex((l) => l.id === toId);
            if (toListIndex !== -1) {
              const list = updatedSomedayLists[toListIndex];
              const items = [...list.items];
              if (targetIndex !== undefined) {
                items.splice(targetIndex, 0, itemToMove);
              } else {
                items.push(itemToMove);
              }
              updatedSomedayLists[toListIndex] = { ...list, items };
            }
          } else {
            const items = [...(updatedTodos[toId] || [])];
            if (targetIndex !== undefined) {
              items.splice(targetIndex, 0, itemToMove);
            } else {
              items.push(itemToMove);
            }
            updatedTodos[toId] = items;
          }

          // If the item being moved is selected, update its path
          let selectedTodo = state.selectedTodo;
          if (selectedTodo?.id === todoId) {
            selectedTodo = {
              id: todoId,
              dateOrListId: toId,
              isSomeday: toSomeday,
            };
          }

          return {
            todos: updatedTodos,
            somedayLists: updatedSomedayLists,
            selectedTodo,
          };
        });
      },

      addSomedayList: (name) => {
        const id = crypto.randomUUID();
        set((state) => ({
          somedayLists: [
            ...state.somedayLists,
            { id, name, items: [] },
          ],
        }));
        return id;
      },

      renameSomedayList: (listId, name) => {
        set((state) => {
          const listIndex = state.somedayLists.findIndex((l) => l.id === listId);
          if (listIndex === -1) return {};
          const updatedLists = [...state.somedayLists];
          updatedLists[listIndex] = { ...updatedLists[listIndex], name };
          return { somedayLists: updatedLists };
        });
      },

      deleteSomedayList: (listId) => {
        set((state) => {
          const filtered = state.somedayLists.filter((l) => l.id !== listId);
          const activeId = state.activeSomedayListId === listId ? (filtered[0]?.id || null) : state.activeSomedayListId;
          
          let selectedTodo = state.selectedTodo;
          if (selectedTodo?.dateOrListId === listId && selectedTodo.isSomeday) {
            selectedTodo = null;
          }

          return {
            somedayLists: filtered,
            activeSomedayListId: activeId,
            selectedTodo,
          };
        });
      },

      reorderSomedayLists: (sourceId, targetId) => {
        set((state) => {
          const fromIdx = state.somedayLists.findIndex((l) => l.id === sourceId);
          const toIdx = state.somedayLists.findIndex((l) => l.id === targetId);
          if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return {};
          const updated = [...state.somedayLists];
          const [moved] = updated.splice(fromIdx, 1);
          updated.splice(toIdx, 0, moved);
          return { somedayLists: updated };
        });
      },

      setActiveSomedayListId: (listId) => {
        set({ activeSomedayListId: listId });
      },

      setDarkMode: (dark) => {
        set({ darkMode: dark });
        localStorage.setItem('darkMode', String(dark));
      },

      setGridColumnSize: (size) => {
        set({ gridColumnSize: size });
        localStorage.setItem('gridColumnSize', String(size));
      },

      setInFocusMode: (focus) => {
        set({ inFocusMode: focus });
        localStorage.setItem('inFocusMode', String(focus));
      },

      setWorkspaceName: (name) => {
        set({ workspaceName: name });
      },

      setSelectedTodo: (todo) => {
        set({ selectedTodo: todo });
      },

      setLanguage: (lang) => {
        set({ language: lang });
      },

      setAccentColor: (color) => {
        set({ accentColor: color });
      },

      setRolloverEnabled: (enabled) => {
        set({ rolloverEnabled: enabled });
      },

      setShowLines: (show) => {
        set({ showLines: show });
      },

      setBulletStyle: (style) => {
        set({ bulletStyle: style });
      },

      setTextSize: (size) => {
        set({ textSize: size });
      },

      setSpacing: (spacing) => {
        set({ spacing: spacing });
      },

      setShowCompleted: (show) => {
        set({ showCompleted: show });
      },

      setIsPreferencesOpen: (open) => {
        set({ isPreferencesOpen: open });
      },

      rolloverPastTodos: (todayKey) => {
        let count = 0;
        set((state) => {
          if (!state.rolloverEnabled) return {};

          const todayTodos = [...(state.todos[todayKey] || [])];
          const updatedTodos = { ...state.todos };
          let changed = false;

          Object.entries(state.todos).forEach(([dateKey, list]) => {
            if (dateKey < todayKey && Array.isArray(list) && list.length > 0) {
              const unfinished = list.filter((item) => !item.done);
              const finished = list.filter((item) => item.done);

              if (unfinished.length > 0) {
                count += unfinished.length;
                changed = true;
                updatedTodos[dateKey] = finished;
                unfinished.forEach((item) => {
                  if (!todayTodos.some((t) => t.id === item.id)) {
                    todayTodos.push(item);
                  }
                });
              }
            }
          });

          if (changed) {
            updatedTodos[todayKey] = todayTodos;
            return { todos: updatedTodos };
          }
          return {};
        });
        return count;
      },

      addRecurringTemplate: (text, pattern, dayOfWeek) => {
        const id = crypto.randomUUID();
        set((state) => ({
          recurringTemplates: [
            ...state.recurringTemplates,
            { id, text, pattern, dayOfWeek },
          ],
        }));
      },

      deleteRecurringTemplate: (id) => {
        set((state) => ({
          recurringTemplates: state.recurringTemplates.filter((t) => t.id !== id),
        }));
      },

      instantiateRecurringTodos: (dates) => {
        set((state) => {
          const updatedTodos = { ...state.todos };
          let changed = false;

          dates.forEach((dateStr) => {
            const date = new Date(dateStr + 'T00:00:00');
            const dayOfWeek = date.getDay(); // 0-6
            const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
            
            const dayTemplates = state.recurringTemplates.filter((temp) => {
              if (temp.pattern === 'daily') return true;
              if (temp.pattern === 'weekdays' && isWeekday) return true;
              if (temp.pattern === 'weekly' && temp.dayOfWeek === dayOfWeek) return true;
              // Simple monthly implementation: match day of month (e.g. day of month of current date relative to template creation date,
              // or let's just make it simpler: runs on day of month. For now, daily/weekly/weekdays are the most important).
              return false;
            });

            if (dayTemplates.length === 0) return;

            const existingTodos = updatedTodos[dateStr] || [];

            dayTemplates.forEach((temp) => {
              // Check if a todo for this recurring template already exists in this day
              const alreadyExists = existingTodos.some((item) => item.recurringTemplateId === temp.id);
              if (!alreadyExists) {
                const newItem: TodoItem = {
                  id: crypto.randomUUID(),
                  text: temp.text,
                  done: false,
                  notes: '',
                  recurringTemplateId: temp.id,
                  createdAt: Date.now(),
                };
                existingTodos.push(newItem);
                changed = true;
              }
            });

            if (dayTemplates.length > 0) {
              updatedTodos[dateStr] = existingTodos;
            }
          });

          return changed ? { todos: updatedTodos } : {};
        });
      },

      seedOnboarding: (todayKey) => {
        set((state) => {
          if (state.hasSeeded) return { hasSeeded: true };

          const mk = (text: string): TodoItem => ({
            id: crypto.randomUUID(),
            text,
            done: false,
            notes: '',
            createdAt: Date.now(),
          });

          const tips = [
            'Toque para marcar como concluída',
            'Segure e arraste para mover para cima ou para baixo',
            'Clique para editar uma tarefa',
            '# Formate suas tarefas com markdown:',
            'Crie subtítulos escrevendo # + texto',
            'Edite **esta** tarefa para ver como usar *itálico*, [links](https://exemplo.com) e **negrito**',
            'Adicione uma tarefa usando o campo abaixo',
          ].map(mk);

          const updates: Partial<TodoState> = { hasSeeded: true };

          // Only seed today's tips if today is empty (never clobber real data)
          const todayEmpty = !state.todos[todayKey] || state.todos[todayKey].length === 0;
          if (todayEmpty) {
            updates.todos = { ...state.todos, [todayKey]: tips };
          }

          // Only replace someday lists if user still has the untouched default list
          const isPristineLists =
            state.somedayLists.length === 1 &&
            state.somedayLists[0].id === 'someday-default' &&
            state.somedayLists[0].items.length === 0;
          if (isPristineLists) {
            updates.somedayLists = [
              { id: 'someday-default', name: 'Someday', items: [] },
              { id: crypto.randomUUID(), name: 'Lista de compras', items: [] },
              { id: crypto.randomUUID(), name: 'Filmes para assistir', items: [] },
              { id: crypto.randomUUID(), name: 'Livros para ler', items: [] },
              { id: crypto.randomUUID(), name: 'Ideias', items: [] },
            ];
          }

          return updates;
        });
      },
    }),
    {
      name: 'teuxdeux-clone-storage',
      partialize: (state) => ({
        todos: state.todos,
        somedayLists: state.somedayLists,
        recurringTemplates: state.recurringTemplates,
        darkMode: state.darkMode,
        gridColumnSize: state.gridColumnSize,
        inFocusMode: state.inFocusMode,
        workspaceName: state.workspaceName,
        accentColor: state.accentColor,
        rolloverEnabled: state.rolloverEnabled,
        language: state.language,
        hasSeeded: state.hasSeeded,
      }),
    }
  )
);
