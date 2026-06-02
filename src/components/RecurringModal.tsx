'use client';

import React, { useState } from 'react';
import { useTodoStore, type RecurringTemplate } from '@/store/useTodoStore';
import { useTranslations } from '@/hooks/useTranslations';
import { XIcon, PlusIcon } from './Icons';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecurringModal({ isOpen, onClose }: RecurringModalProps) {
  const { recurringTemplates, addRecurringTemplate, deleteRecurringTemplate } = useTodoStore();
  const t = useTranslations();
  const [newText, setNewText] = useState('');
  const [pattern, setPattern] = useState<RecurringTemplate['pattern']>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday default

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    addRecurringTemplate(trimmed, pattern, pattern === 'weekly' ? dayOfWeek : undefined);
    setNewText('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-[var(--app-background)] rounded-xl shadow-2xl border border-[var(--todo-border-color)] max-w-lg w-full mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <header className="px-5 py-4 border-b border-[var(--todo-border-color)] flex items-center justify-between bg-[var(--someday-list-background)]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--todo-header-text-color)]">
            {t.recurringModalTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--timer-bg)] text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors"
            type="button"
          >
            <XIcon size={14} />
          </button>
        </header>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Add Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)]">
              {t.createTemplate}
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t.whatRepeats}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1 px-3 py-2 border border-[var(--todo-border-color)] rounded bg-[var(--someday-list-background)] text-sm text-[var(--todo-text-color)] outline-none focus:border-[var(--custom-color)]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <label htmlFor="pattern-select" className="text-xs text-[var(--todo-past-text-color)] font-medium">
                {t.repeatLabel}
              </label>
              <select
                id="pattern-select"
                value={pattern}
                onChange={(e) => setPattern(e.target.value as RecurringTemplate['pattern'])}
                className="px-2.5 py-1.5 border border-[var(--todo-border-color)] rounded bg-[var(--app-background)] text-xs text-[var(--todo-text-color)] outline-none"
              >
                <option value="daily">{t.patternDaily}</option>
                <option value="weekdays">{t.patternWeekdays}</option>
                <option value="weekly">{t.patternWeekly}</option>
              </select>

              {pattern === 'weekly' && (
                <>
                  <label htmlFor="day-select" className="text-xs text-[var(--todo-past-text-color)] font-medium">
                    {t.onLabel}
                  </label>
                  <select
                    id="day-select"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="px-2.5 py-1.5 border border-[var(--todo-border-color)] rounded bg-[var(--app-background)] text-xs text-[var(--todo-text-color)] outline-none"
                  >
                    {t.weekdays_long.map((label, idx) => (
                      <option key={idx} value={idx}>
                        {label}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <button
                type="submit"
                className="ml-auto px-4 py-1.5 bg-[var(--custom-color)] text-white text-xs font-bold uppercase tracking-wider rounded hover:opacity-90 transition-all flex items-center gap-1 shadow-sm"
              >
                <PlusIcon size={12} /> {t.addBtn}
              </button>
            </div>
          </form>

          {/* Active List */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--todo-past-text-color)]">
              {t.activeTemplates}
            </h4>

            {recurringTemplates.length === 0 ? (
              <p className="text-xs text-[var(--todo-past-text-color)] italic bg-[var(--someday-list-background)] p-4 rounded-lg border border-[var(--todo-border-color)] text-center leading-relaxed">
                {t.noTemplates}
              </p>
            ) : (
              <div className="flex flex-col border border-[var(--todo-border-color)] rounded-lg overflow-hidden divide-y divide-[var(--todo-border-color)]">
                {recurringTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="px-4 py-3 flex items-center justify-between bg-[var(--app-background)] hover:bg-[var(--someday-list-background)] transition-all"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-[var(--todo-text-color)] leading-snug">
                        {template.text}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-[var(--custom-color)] tracking-wider">
                        {template.pattern === 'daily' ? t.patternDaily : template.pattern === 'weekdays' ? t.patternWeekdays : t.patternWeekly}
                        {template.pattern === 'weekly' && template.dayOfWeek !== undefined
                          ? ` (${t.everyLabel(t.weekdays_long[template.dayOfWeek])})`
                          : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteRecurringTemplate(template.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors"
                      title={t.deleteTemplate}
                      type="button"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
