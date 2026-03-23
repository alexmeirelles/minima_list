'use client';

import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
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

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`group flex items-start py-1.5 px-1 hover:bg-gray-50 transition-colors duration-150 cursor-grab active:cursor-grabbing border-b border-gray-100 ${
        task.isCompleted ? 'opacity-50' : ''
      }`}
    >
      <div
        className="mt-1 mr-2 cursor-pointer text-gray-400 transition-colors flex-shrink-0"
        onClick={handleToggleComplete}
      >
        {task.isCompleted ? (
          <Check size={16} className="text-[#967259]" />
        ) : (
          <div className="w-4 h-4 border-2 border-gray-300 rounded-sm hover:border-[#967259]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent outline-none border-b border-[#967259]/50 text-sm font-medium text-gray-800"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={`truncate text-sm font-medium text-gray-800 cursor-text ${
              task.isCompleted ? 'line-through text-gray-400' : ''
            }`}
          >
            {task.text}
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-[#967259] transition-opacity ml-1 flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
