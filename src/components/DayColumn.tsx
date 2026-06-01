'use client';

import TaskListWithLines from './TaskListWithLines';
import { formatDateKey, formatDateFull, formatDayName } from '@/lib/dateUtils';
import type { Task } from '@/types';

interface Props {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  onAddTask: (text: string, listId: string, options?: { isSection?: boolean }) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onDropTask: (taskId: string, newListId: string) => void;
}

export default function DayColumn({
  date,
  tasks,
  isToday,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDropTask,
}: Props) {
  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <div className={`border-t py-2 mb-1 ${isToday ? 'border-gray-800' : 'border-gray-200'}`}>
        <p className="text-[10px] font-medium text-gray-400 tracking-wide mb-0.5">
          {formatDateFull(date)}
        </p>
        <h3 className={`text-sm font-bold uppercase tracking-wider leading-none ${
          isToday ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {formatDayName(date)}
        </h3>
      </div>

      <TaskListWithLines
        listId={formatDateKey(date)}
        tasks={tasks}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
      />
    </div>
  );
}
