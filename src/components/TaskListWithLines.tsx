'use client';

import { useState } from 'react';
import TaskItem from './TaskItem';
import type { Task } from '@/types';

interface Props {
  listId: string;
  tasks: Task[];
  onAddTask: (text: string, listId: string, options?: { isSection?: boolean }) => void;
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
  placeholder = 'Add task...',
}: Props) {
  const [newTaskText, setNewTaskText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = newTaskText.trim();
    if (!raw) return;

    if (raw.startsWith('---')) {
      const label = raw.slice(3).trim();
      if (label) onAddTask(label, listId, { isSection: true });
    } else {
      onAddTask(raw, listId);
    }
    setNewTaskText('');
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

  const nonSectionTasks = tasks.filter((t) => !t.isSection);
  const emptyLinesCount = Math.max(0, minLines - nonSectionTasks.length);

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

      <form onSubmit={handleSubmit} className="border-b border-gray-100">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder-gray-200 text-sm text-gray-700 py-1.5 px-1 hover:placeholder-gray-300 focus:placeholder-gray-300 transition-colors"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
      </form>

      {Array.from({ length: emptyLinesCount }).map((_, i) => (
        <div key={`line-${i}`} className="h-[33px] border-b border-gray-100 w-full" />
      ))}
    </div>
  );
}
