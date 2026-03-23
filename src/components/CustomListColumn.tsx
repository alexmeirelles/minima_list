'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import TaskListWithLines from './TaskListWithLines';
import type { Task } from '@/types';

interface Props {
  listId: string;
  title: string;
  tasks: Task[];
  onAddTask: (text: string, listId: string) => void;
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
    <div className="flex flex-col min-w-[280px] w-full md:w-1/3 lg:w-1/5 snap-center">
      <div className="border-t-4 border-gray-300 py-2 mb-2 flex justify-between items-start group/header hover:border-red-200 transition-colors">
        <div className="flex-1 mr-2">
          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent outline-none text-lg font-bold text-gray-700 leading-none border-b border-[#967259]"
              value={editTitleText}
              onChange={(e) => setEditTitleText(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
            />
          ) : (
            <div
              className="flex items-center gap-2 group/title cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              <h3
                className="text-lg font-bold text-gray-500 leading-none truncate group-hover/title:text-gray-700"
                title="Click to rename"
              >
                {title}
              </h3>
              <Edit2
                size={12}
                className="text-gray-300 opacity-0 group-hover/title:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>

        <button
          onClick={() => onDeleteRequest(listId)}
          className="opacity-0 group-hover/header:opacity-100 text-gray-300 hover:text-[#967259] transition-opacity"
          title="Delete List"
        >
          <Trash2 size={14} />
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
