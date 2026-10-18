'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTodoStore, type TodoItem } from '@/store/useTodoStore';
import { formatDateKey } from '@/lib/dateUtils';
import { useTranslations } from '@/hooks/useTranslations';
import TaskItem from './TaskItem';

interface DayColumnProps {
  date: Date;
  tasks: TodoItem[];
}

export default function DayColumn({ date, tasks }: DayColumnProps) {
  const { addTodo, setInFocusMode } = useTodoStore();
  const t = useTranslations();
  const [newText, setNewText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const dateKey = formatDateKey(date);

  const { setNodeRef } = useDroppable({
    id: dateKey,
  });

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 210);
    const y = Math.min(e.clientY, window.innerHeight - 130);
    setContextMenu({ x, y });
  };

  // Handle double-click anywhere on column to start typing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.tagName === 'A') {
      return;
    }
    inputRef.current?.focus();
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

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isPast = date < new Date(today.setHours(0, 0, 0, 0));

  // Date styling
  const month = t.months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  const dateString = t.formatSmallDate(dayNum, month, year);
  const dayName = t.daysLong[date.getDay()];

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (trimmed) {
      addTodo(dateKey, trimmed, false);
      setNewText('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setNewText('');
      e.currentTarget.blur();
    }
  };

  let columnClass = 'todo';
  if (isToday) columnClass += ' todo--current';
  else if (isPast) columnClass += ' todo--past';

  return (
    <div
      className={columnClass}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <header className="todo__header select-none">
        <p className="todo__date">{dateString}</p>
        <h2 className="todo__title">{dayName}</h2>
      </header>

      {/* Sortable Task List Area */}
      <div ref={setNodeRef} className="todo__list flex-1 flex flex-col justify-start">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-0">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                dateOrListId={dateKey}
                isSomeday={false}
              />
            ))}
          </ul>
        </SortableContext>

        {/* Create Todo Item Row right after tasks */}
        <form onSubmit={handleAdd} className="px-5">
          <div className="todo-content todo-content--create h-[34px]">
            <span className="todo-content--create__plus">+</span>
            <input
              ref={inputRef}
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
              setTimeout(() => inputRef.current?.focus(), 50);
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
              setInFocusMode(true);
            }}
          >
            <span className="text-sm">🎯</span>
            {t.focusDayAction}
          </button>
        </div>
      )}
    </div>
  );
}
