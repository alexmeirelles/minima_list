'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTodoStore, type TodoItem } from '@/store/useTodoStore';
import { useTranslations } from '@/hooks/useTranslations';
import TaskItem from './TaskItem';
import { VerticalDotsIcon } from './Icons';
import { ConfirmModal } from './Modal';

interface CustomListColumnProps {
  listId: string;
  name: string;
  items: TodoItem[];
}

export default function CustomListColumn({ listId, name, items }: CustomListColumnProps) {
  const { addTodo, renameSomedayList, deleteSomedayList } = useTodoStore();
  const t = useTranslations();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(name);
  const [newText, setNewText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const newTodoInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({
    id: listId,
  });

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 210);
    const y = Math.min(e.clientY, window.innerHeight - 150);
    setContextMenu({ x, y });
  };

  // Handle double-click anywhere on column to start typing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.tagName === 'A') {
      return;
    }
    newTodoInputRef.current?.focus();
  };

  // Close context menu on outside click or Esc
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    setTitleText(name);
  }, [name]);

  // Click outside to close list actions menu
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleRenameSave = () => {
    const trimmed = titleText.trim();
    if (trimmed && trimmed !== name) {
      renameSomedayList(listId, trimmed);
    } else {
      setTitleText(name);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSave();
    if (e.key === 'Escape') {
      setTitleText(name);
      setIsEditingTitle(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (trimmed) {
      addTodo(listId, trimmed, true);
      setNewText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setNewText('');
      e.currentTarget.blur();
    }
  };

  const handleDeleteListClick = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <div
      className="todo todo--secondary"
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <header className="todo__header flex items-center justify-between relative group/header select-none">
        <div className="flex-1 min-w-0 pr-2">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleRenameSave}
              onKeyDown={handleTitleKeyDown}
              className="todo__title w-full bg-transparent border-b border-[var(--custom-color)] outline-none text-left"
            />
          ) : (
            <h2
              className="todo__title truncate cursor-pointer text-left hover:text-[var(--custom-color)] transition-colors"
              onClick={() => setIsEditingTitle(true)}
              title={t.clickToRename}
            >
              {name}
            </h2>
          )}
        </div>

        {/* Options dots menu button */}
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] opacity-0 group-hover/header:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--timer-bg)]"
            type="button"
          >
            <VerticalDotsIcon size={14} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--app-background)] border border-[var(--todo-border-color)] shadow-lg rounded-md py-1 z-50 text-left">
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--todo-text-color)] hover:bg-[var(--timer-bg)]"
                type="button"
              >
                {t.renameList}
              </button>
              <button
                onClick={() => {
                  handleDeleteListClick();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-[var(--timer-bg)] font-medium"
                type="button"
              >
                {t.deleteList}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Droppable sortable list items area */}
      <div ref={setNodeRef} className="todo__list flex-1 flex flex-col justify-start">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-0">
            {items.map((item) => (
              <TaskItem
                key={item.id}
                task={item}
                dateOrListId={listId}
                isSomeday={true}
              />
            ))}
          </ul>
        </SortableContext>

        {/* Empty area filler so you can drop items onto it */}
        <div className="flex-1 min-h-[40px]" />

        {/* Create Todo Item Row */}
        <form onSubmit={handleAdd} className="mt-auto px-5 mb-4">
          <div className="todo-content todo-content--create">
            <span className="todo-content--create__plus">+</span>
            <input
              ref={newTodoInputRef}
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.addTodoPlaceholder}
              className="todo__input"
            />
          </div>
        </form>
      </div>

      {/* Floating Context Menu on Right Click */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--app-background)] border border-[var(--todo-border-color)] shadow-2xl rounded-lg py-1.5 min-w-[190px] text-xs font-medium select-none"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full text-left px-3.5 py-2 hover:bg-[var(--someday-list-background)] hover:text-[var(--custom-color)] flex items-center gap-2 transition-colors text-[var(--todo-text-color)]"
            onClick={() => {
              setContextMenu(null);
              setTimeout(() => newTodoInputRef.current?.focus(), 50);
            }}
          >
            <span className="text-base font-bold leading-none text-[var(--custom-color)]">+</span>
            {t.addTodoAction}
          </button>
          <button
            type="button"
            className="w-full text-left px-3.5 py-2 hover:bg-[var(--someday-list-background)] hover:text-[var(--custom-color)] flex items-center gap-2 transition-colors text-[var(--todo-text-color)]"
            onClick={() => {
              setContextMenu(null);
              setIsEditingTitle(true);
            }}
          >
            <span className="text-sm">✏️</span>
            {t.renameList}
          </button>
          <button
            type="button"
            className="w-full text-left px-3.5 py-2 hover:bg-[var(--someday-list-background)] hover:text-red-500 flex items-center gap-2 transition-colors text-red-500 font-medium border-t border-[var(--todo-border-color)] mt-1 pt-2"
            onClick={() => {
              setContextMenu(null);
              setShowDeleteConfirm(true);
            }}
          >
            <span className="text-sm">🗑️</span>
            {t.deleteList}
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title={t.deleteListTitle}
          message={t.confirmDeleteList(name)}
          confirmLabel={t.deleteConfirm}
          cancelLabel={t.cancelBtn}
          onConfirm={() => deleteSomedayList(listId)}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
