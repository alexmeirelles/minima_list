'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTodoStore, type TodoItem } from '@/store/useTodoStore';
import { formatDateKey } from '@/lib/dateUtils';
import TaskItem from './TaskItem';

interface DayColumnProps {
  date: Date;
  tasks: TodoItem[];
}

export default function DayColumn({ date, tasks }: DayColumnProps) {
  const { addTodo } = useTodoStore();
  const [newText, setNewText] = useState('');
  const dateKey = formatDateKey(date);

  const { setNodeRef } = useDroppable({
    id: dateKey,
  });

  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isPast = date < new Date(today.setHours(0, 0, 0, 0));

  // Date styling
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = date.getDate();
  const year = date.getFullYear();
  const dateString = `${month} ${dayNum}, ${year}`;
  const dayName = date.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (trimmed) {
      addTodo(dateKey, trimmed, false);
      setNewText('');
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
    <div className={columnClass}>
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

        {/* Empty area filler so you can drop items onto it */}
        <div className="flex-1 min-h-[40px]" />

        {/* Create Todo Item Row */}
        <form onSubmit={handleAdd} className="mt-auto px-5 mb-4">
          <div className="todo-content todo-content--create">
            <div className="todo__label w-full">
              <span className="sr-only">Type in your todo</span>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                className="todo__input"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
