'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTodoStore, type TodoItem } from '@/store/useTodoStore';
import { parseTodoText } from '@/lib/markdown';
import { NoteIcon, XIcon } from './Icons';

interface TaskItemProps {
  task: TodoItem;
  dateOrListId: string;
  isSomeday: boolean;
}

export default function TaskItem({ task, dateOrListId, isSomeday }: TaskItemProps) {
  const { toggleTodo, updateTodoText, deleteTodo, setSelectedTodo, selectedTodo } = useTodoStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  // Swipe for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);

  const parsed = parseTodoText(task.text);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : undefined,
    touchAction: 'none',
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) {
      updateTodoText(dateOrListId, task.id, isSomeday, trimmed);
    } else if (!trimmed) {
      deleteTodo(dateOrListId, task.id, isSomeday);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTodo(dateOrListId, task.id, isSomeday);
  };

  const handleOpenDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTodo({
      id: task.id,
      dateOrListId,
      isSomeday,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTodo(dateOrListId, task.id, isSomeday);
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    const diff = currentTouch - touchStart;
    if (diff < 0 && diff > -100) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const diff = touchEnd - touchStart;
    
    if (diff < -50) {
      setIsSwiped(true);
      setSwipeOffset(-70); // Keep open to show edit/delete buttons
    } else {
      setIsSwiped(false);
      setSwipeOffset(0);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const resetSwipe = () => {
    setIsSwiped(false);
    setSwipeOffset(0);
  };

  const isSelected = selectedTodo?.id === task.id;

  if (parsed.isHeading) {
    return (
      <li
        ref={setNodeRef}
        style={style}
        className="todo__list-item is-heading group"
        onDoubleClick={handleDoubleClick}
        {...attributes}
        {...listeners}
      >
        <div className="todo-content">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="todo__input font-bold"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <>
              <h5 className="select-none flex-1 font-bold text-[10px] tracking-wider uppercase text-[var(--todo-header-text-color)] py-1">
                {parsed.cleanText}
              </h5>
              <div className="todo-buttons group-hover:opacity-100 opacity-0 transition-opacity ml-2">
                <button
                  className="todo-buttons__button"
                  title="Delete heading"
                  onClick={handleDelete}
                  type="button"
                >
                  <XIcon size={12} />
                </button>
              </div>
            </>
          )}
        </div>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={{
        ...style,
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        left: swipeOffset,
      }}
      className={`todo__list-item group relative select-none flex items-center transition-all duration-150 ${
        isSelected ? 'bg-[var(--custom-color-light)]' : ''
      }`}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...attributes}
      {...listeners}
    >
      <div className="todo-content flex items-center w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="todo__input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <>
            <div className="todo__checkbox-wrapper mr-2 flex items-center justify-center">
              <label htmlFor={`check-${task.id}`} className="sr-only">
                Complete Todo
              </label>
              <input
                id={`check-${task.id}`}
                type="checkbox"
                checked={task.done}
                onChange={() => {}}
                onClick={handleCheckboxClick}
                className="todo__checkbox"
              />
            </div>

            <div className="todo__label flex-shrink-0" />

            <div
              className={`todo-content__text flex-1 ${
                task.done ? 'is-done text-[var(--todo-checkbox-done-color)] line-through' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: parsed.html }}
            />

            {/* Note details indicator */}
            {task.notes && (
              <span className="text-xs text-[var(--custom-color)] opacity-70 mr-1.5 flex-shrink-0">
                📝
              </span>
            )}

            {/* Hover buttons */}
            <div className="todo-buttons flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                className="todo-buttons__button ui-button--details"
                title="Notes / Details"
                onClick={handleOpenDetails}
                type="button"
              >
                <NoteIcon size={12} />
              </button>
              <button
                className="todo-buttons__button ui-button--delete"
                title="Delete Todo"
                onClick={handleDelete}
                type="button"
              >
                <XIcon size={12} />
              </button>
            </div>

            {/* Mobile swipe-revealed edit/delete buttons */}
            {isSwiped && (
              <div
                className="absolute right-[-70px] top-0 bottom-0 flex items-center justify-center bg-red-500 text-white w-[70px] cursor-pointer"
                onClick={handleDelete}
              >
                <XIcon size={16} />
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
