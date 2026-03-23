'use client';

import TaskListWithLines from './TaskListWithLines';
import { formatDateKey, formatDayName, formatDisplayDate } from '@/lib/dateUtils';
import type { Task } from '@/types';

interface Props {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  onAddTask: (text: string, listId: string) => void;
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
      <div className={`border-t-4 py-2 mb-2 ${isToday ? 'border-[#967259]' : 'border-black'}`}>
        <h3 className={`text-lg font-bold leading-none ${isToday ? 'text-[#967259]' : 'text-gray-900'}`}>
          {formatDayName(date)}
        </h3>
        <span className="text-gray-400 text-sm font-medium">{formatDisplayDate(date)}</span>
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
