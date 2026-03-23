'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Group } from '@/types';

interface Props {
  group: Group;
  isActive: boolean;
  onClick: () => void;
  onUpdate: (groupId: string, title: string) => void;
  onDeleteRequest: (groupId: string) => void;
}

export default function GroupTab({ group, isActive, onClick, onUpdate, onDeleteRequest }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(group.title);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setEditTitle(group.title);
  }, [group.title]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
        className="bg-[#967259]/10 text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-sm outline-none border-b border-[#967259] w-24 text-gray-800"
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
        className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors ${
          isActive ? 'text-[#967259] bg-[#967259]/10' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {group.title}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest(group.id);
        }}
        className="ml-1 opacity-0 group-hover/tab:opacity-100 text-gray-300 hover:text-red-500 transition-opacity p-0.5"
        title="Delete Group"
      >
        <X size={10} />
      </button>
    </div>
  );
}
