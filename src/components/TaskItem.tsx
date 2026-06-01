'use client';

import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { Task } from '@/types';

const COLOR_PALETTE = ['#bfdbfe', '#bbf7d0', '#fef08a', '#fed7aa', '#fecaca', '#e9d5ff'];
const TIME_PATTERN = /(\d{1,2}:\d{2}\s*[—–-]\s*\d{1,2}:\d{2})/;

interface Props {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

function TaskText({ text }: { text: string }) {
  const parts = text.split(TIME_PATTERN);
  if (parts.length === 1) return <span>{text}</span>;
  return (
    <>
      {parts.map((part, i) =>
        TIME_PATTERN.test(part) ? (
          <span key={i} className="text-gray-400 text-xs ml-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function TaskItem({ task, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleToggleComplete = () => onUpdate(task.id, { isCompleted: !task.isCompleted });

  const handleToggleRecurring = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(task.id, { isRecurring: !task.isRecurring });
  };

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

  const handleColorSelect = (color: string) => {
    onUpdate(task.id, { color });
    setShowColorPicker(false);
  };

  if (task.isSection) {
    return (
      <div className="group flex items-center py-1 px-2 mt-2 mb-0.5 bg-gray-100 -mx-1">
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

  const bgStyle = task.color ? { backgroundColor: task.color } : {};

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={bgStyle}
      className={`group relative flex items-start py-1.5 px-1 transition-colors duration-100 cursor-grab active:cursor-grabbing border-b border-gray-100 ${
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
            <TaskText text={task.text} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 ml-1 flex-shrink-0 mt-0.5">
        <button
          onClick={handleToggleRecurring}
          className={`transition-all ${
            task.isRecurring
              ? 'text-gray-500 opacity-100'
              : 'opacity-0 group-hover:opacity-100 text-gray-200 hover:text-gray-500'
          }`}
          title="Toggle recurring"
        >
          <RefreshCw size={10} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          title="Set color"
        >
          <div
            className="w-2.5 h-2.5 rounded-full border border-gray-300"
            style={task.color ? { backgroundColor: task.color } : {}}
          />
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity"
        >
          <X size={12} />
        </button>
      </div>

      {showColorPicker && (
        <>
          <div
            className="fixed inset-0 z-[5]"
            onClick={() => setShowColorPicker(false)}
          />
          <div className="absolute right-0 top-full z-10 bg-white border border-gray-200 p-1.5 flex gap-1 shadow-sm">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-4 h-4 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              onClick={() => handleColorSelect('')}
              className="w-4 h-4 rounded-full border border-gray-300 hover:scale-110 transition-transform bg-white flex items-center justify-center"
              title="Remove color"
            >
              <X size={8} className="text-gray-400" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
