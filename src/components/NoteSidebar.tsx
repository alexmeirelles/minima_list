'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTodoStore, type TodoItem } from '@/store/useTodoStore';
import { useTranslations } from '@/hooks/useTranslations';
import { XIcon, ClockIcon } from './Icons';

export default function NoteSidebar() {
  const {
    selectedTodo,
    setSelectedTodo,
    todos,
    somedayLists,
    updateTodoNotes,
    addRecurringTemplate,
    recurringTemplates,
    deleteRecurringTemplate,
  } = useTodoStore();

  const t = useTranslations();
  const [notesText, setNotesText] = useState('');
  const [todoItem, setTodoItem] = useState<TodoItem | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve current active todo from store
  useEffect(() => {
    if (!selectedTodo) {
      setTodoItem(null);
      setNotesText('');
      return;
    }

    let foundItem: TodoItem | undefined;

    if (selectedTodo.isSomeday) {
      const list = somedayLists.find((l) => l.id === selectedTodo.dateOrListId);
      foundItem = list?.items.find((item) => item.id === selectedTodo.id);
    } else {
      const dayTodos = todos[selectedTodo.dateOrListId] || [];
      foundItem = dayTodos.find((item) => item.id === selectedTodo.id);
    }

    if (foundItem) {
      setTodoItem(foundItem);
      setNotesText(foundItem.notes || '');
    } else {
      // Item was deleted or not found, close sidebar
      setSelectedTodo(null);
    }
  }, [selectedTodo, todos, somedayLists, setSelectedTodo]);

  // Debounced notes autosave
  const handleNotesChange = (text: string) => {
    setNotesText(text);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (selectedTodo) {
      saveTimeoutRef.current = setTimeout(() => {
        updateTodoNotes(selectedTodo.dateOrListId, selectedTodo.id, selectedTodo.isSomeday, text);
      }, 500); // 500ms delay
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedTodo || !todoItem) return null;

  // Check if this todo has an associated recurring template
  const activeTemplate = todoItem.recurringTemplateId
    ? recurringTemplates.find((t) => t.id === todoItem.recurringTemplateId)
    : null;

  const handleMakeRecurring = (pattern: 'daily' | 'weekdays' | 'weekly') => {
    // Determine day of week if pattern is weekly
    let dayOfWeek: number | undefined;
    if (pattern === 'weekly') {
      // If it's a calendar todo, get day of week. Else default to today's day of week
      if (!selectedTodo.isSomeday) {
        const date = new Date(selectedTodo.dateOrListId + 'T00:00:00');
        dayOfWeek = date.getDay();
      } else {
        dayOfWeek = new Date().getDay();
      }
    }

    addRecurringTemplate(todoItem.text, pattern, dayOfWeek);
    alert(t.recurringCreated(todoItem.text, pattern));
  };

  const handleRemoveRecurring = () => {
    if (activeTemplate) {
      deleteRecurringTemplate(activeTemplate.id);
      alert(t.recurringRemoved);
    }
  };

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[380px] bg-[var(--app-background)] border-l border-[var(--todo-border-color)] shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <header className="h-[44px] px-4 border-b border-[var(--todo-border-color)] flex items-center justify-between bg-[var(--someday-list-background)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)]">
          {t.todoDetails}
        </span>
        <button
          onClick={() => setSelectedTodo(null)}
          className="p-1.5 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
          type="button"
        >
          <XIcon size={14} />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {/* Title */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)] mb-2">
            {t.taskName}
          </h4>
          <p className="text-sm font-semibold text-[var(--todo-text-color)] break-words leading-relaxed">
            {todoItem.text}
          </p>
        </div>

        {/* Notes editor */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <label
            htmlFor="sidebar-notes"
            className="text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)] mb-2"
          >
            {t.notesDescription}
          </label>
          <textarea
            id="sidebar-notes"
            value={notesText}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={t.addDetails}
            className="flex-1 w-full bg-[var(--someday-list-background)] border border-[var(--todo-border-color)] rounded-lg p-3 text-sm text-[var(--todo-text-color)] placeholder-[var(--todo-past-text-color)] outline-none resize-none focus:border-[var(--custom-color)] focus:ring-1 focus:ring-[var(--custom-color)] transition-all font-mono"
          />
          <div className="text-[10px] text-[var(--todo-past-text-color)] mt-1.5 text-right font-medium">
            {t.autosaved}
          </div>
        </div>

        {/* Recurring Tasks setup */}
        <div className="border-t border-[var(--todo-border-color)] pt-4 mt-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)] mb-3 flex items-center gap-1.5">
            <ClockIcon size={13} /> {t.recurringSettings}
          </h4>

          {activeTemplate ? (
            <div className="bg-[var(--custom-color-light)] border border-[var(--custom-color)]/20 p-3 rounded-lg flex flex-col gap-2">
              <p className="text-xs text-[var(--todo-text-color)] font-medium">
                {t.activeTemplate} <span className="font-bold uppercase">{activeTemplate.pattern}</span>
              </p>
              <button
                onClick={handleRemoveRecurring}
                className="text-xs text-red-500 font-bold uppercase hover:underline text-left mt-1"
                type="button"
              >
                {t.disableRecurring}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--todo-past-text-color)] mb-1 leading-normal">
                {t.makeRecurringDesc}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleMakeRecurring('daily')}
                  className="px-2 py-1.5 border border-[var(--todo-border-color)] rounded text-xs font-semibold hover:border-[var(--custom-color)] hover:text-[var(--custom-color)] transition-all bg-[var(--app-background)]"
                  type="button"
                >
                  {t.daily}
                </button>
                <button
                  onClick={() => handleMakeRecurring('weekdays')}
                  className="px-2 py-1.5 border border-[var(--todo-border-color)] rounded text-xs font-semibold hover:border-[var(--custom-color)] hover:text-[var(--custom-color)] transition-all bg-[var(--app-background)]"
                  type="button"
                >
                  {t.weekdays}
                </button>
                <button
                  onClick={() => handleMakeRecurring('weekly')}
                  className="px-2 py-1.5 border border-[var(--todo-border-color)] rounded text-xs font-semibold hover:border-[var(--custom-color)] hover:text-[var(--custom-color)] transition-all bg-[var(--app-background)]"
                  type="button"
                >
                  {t.weekly}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
