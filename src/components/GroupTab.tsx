'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Group } from '@/types';

interface Props {
  group: Group;
  isActive: boolean;
  taskCount: number;
  onClick: () => void;
  onUpdate: (groupId: string, title: string) => void;
  onDeleteRequest: (groupId: string) => void;
}

export default function GroupTab({ group, isActive, taskCount, onClick, onUpdate, onDeleteRequest }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(group.title);

  useEffect(() => {
    setEditTitle(group.title);
  }, [group.title]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== group.title) {
      onUpdate(group.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type="text"
        className="text-[11px] font-bold uppercase tracking-widest px-2 py-1.5 outline-none border-b border-gray-400 w-24 text-gray-800 bg-transparent"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <div className="relative group/tab flex items-center">
      <button
        onClick={onClick}
        onDoubleClick={() => setIsEditing(true)}
        title="Double click to rename"
        className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 transition-colors ${
          isActive ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'
        }`}
      >
        {group.title}
        {taskCount > 0 && (
          <span className={`ml-1.5 ${isActive ? 'text-gray-400' : 'text-gray-300'}`}>
            {taskCount}
          </span>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(group.id);
        }}
        className="ml-0.5 opacity-0 group-hover/tab:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity p-0.5"
        title="Delete Group"
      >
        <X size={9} />
      </button>
    </div>
  );
}
