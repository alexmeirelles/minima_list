'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleToggleComplete = () => onUpdate(task.id, { isCompleted: !task.isCompleted });

  const handleSave = () => {
    if (editText.trim()) onUpdate(task.id, { text: editText });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (task.isSection) {
    return (
      <div className="group flex items-center py-1 px-1 mt-2 mb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex-1">
          {task.text}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity"
        >
          <X size={10} />
        </button>
      </div>
    );
  }

  const bgStyle = task.color
    ? { backgroundColor: task.color }
    : {};

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={bgStyle}
      className={`group flex items-start py-1.5 px-1 transition-colors duration-100 cursor-grab active:cursor-grabbing border-b border-gray-100 ${
        task.color ? 'rounded-sm' : 'hover:bg-gray-50'
      } ${task.isCompleted ? 'opacity-40' : ''}`}
    >
      <div
        className="mt-0.5 mr-2 cursor-pointer flex-shrink-0"
        onClick={handleToggleComplete}
      >
        {task.isCompleted ? (
          <div className="w-3.5 h-3.5 border border-gray-300 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </div>
        ) : (
          <div className="w-3.5 h-3.5 border border-gray-300 hover:border-gray-500 transition-colors" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent outline-none border-b border-gray-400 text-sm text-gray-800"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={`text-sm text-gray-800 cursor-text leading-snug ${
              task.isCompleted ? 'line-through text-gray-400' : ''
            } ${task.color ? 'font-medium' : ''}`}
          >
            {task.text}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity ml-1 flex-shrink-0 mt-0.5"
      >
        <X size={12} />
      </button>
    </div>
  );
}
