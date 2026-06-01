'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TaskListWithLines from './TaskListWithLines';
import type { Task } from '@/types';

interface Props {
  listId: string;
  title: string;
  tasks: Task[];
  onAddTask: (text: string, listId: string, options?: { isSection?: boolean }) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onDropTask: (taskId: string, newListId: string) => void;
  onDeleteRequest: (listId: string) => void;
  onUpdateList: (listId: string, title: string) => void;
}

export default function CustomListColumn({
  listId,
  title,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDropTask,
  onDeleteRequest,
  onUpdateList,
}: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleText, setEditTitleText] = useState(title);

  useEffect(() => {
    setEditTitleText(title);
  }, [title]);

  const handleTitleSave = () => {
    if (editTitleText.trim() && editTitleText !== title) {
      onUpdateList(listId, editTitleText);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  return (
    <div className="flex flex-col min-w-[220px] w-full md:w-1/4 lg:w-1/5 snap-center">
      <div className="border-t border-gray-200 py-2 mb-1 flex justify-between items-center group/header">
        <div className="flex-1 mr-2">
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent outline-none text-[11px] font-bold uppercase tracking-widest text-gray-700 border-b border-gray-400"
              value={editTitleText}
              onChange={(e) => setEditTitleText(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <h3
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 cursor-pointer hover:text-gray-800 transition-colors truncate"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
            >
              {title}
            </h3>
          )}
        </div>

        <button
          onClick={() => onDeleteRequest(listId)}
          className="opacity-0 group-hover/header:opacity-100 text-gray-300 hover:text-gray-500 transition-opacity flex-shrink-0"
          title="Delete List"
        >
          <X size={12} />
        </button>
      </div>

      <TaskListWithLines
        listId={listId}
        tasks={tasks}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onDropTask={onDropTask}
        minLines={4}
      />
    </div>
  );
}
