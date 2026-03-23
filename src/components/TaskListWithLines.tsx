'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import type { Task } from '@/types';

interface Props {
  listId: string;
  tasks: Task[];
  onAddTask: (text: string, listId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onDropTask: (taskId: string, newListId: string) => void;
  minLines?: number;
  placeholder?: string;
}

export default function TaskListWithLines({
  listId,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDropTask,
  minLines = 5,
  placeholder = 'Add a task...',
}: Props) {
  const [newTaskText, setNewTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(newTaskText, listId);
      setNewTaskText('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onDropTask(taskId, listId);
  };

  const emptyLinesCount = Math.max(0, minLines - tasks.length);

  return (
    <div className="flex-1" onDragOver={handleDragOver} onDrop={handleDrop}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      ))}

      <form onSubmit={handleSubmit} className="mt-1 group border-b border-gray-100">
        <div className="flex items-center text-gray-400 focus-within:text-[#967259] py-1.5 px-1">
          <Plus size={14} className="mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-transparent outline-none placeholder-gray-300 text-sm font-medium text-gray-800"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
          />
        </div>
      </form>

      {Array.from({ length: emptyLinesCount }).map((_, i) => (
        <div key={`line-${i}`} className="h-[33px] border-b border-gray-100 w-full" />
      ))}
    </div>
  );
}
