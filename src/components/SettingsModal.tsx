'use client';

import React from 'react';
import { useTodoStore } from '@/store/useTodoStore';
import { useTranslations } from '@/hooks/useTranslations';
import { XIcon, RotateCcwIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetConfirm: () => void;
}

const PRESET_COLORS = [
  { name: 'Purple', hex: '#852CE6' },
  { name: 'Swiss Red', hex: '#ED0C00' },
  { name: 'Sky Blue', hex: '#2563EB' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Emerald', hex: '#16A34A' },
  { name: 'Tangerine', hex: '#EA580C' },
  { name: 'Charcoal', hex: '#27272A' },
];

export default function SettingsModal({ isOpen, onClose, onResetConfirm }: SettingsModalProps) {
  const {
    accentColor,
    setAccentColor,
    rolloverEnabled,
    setRolloverEnabled,
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    workspaceName,
    setWorkspaceName,
  } = useTodoStore();

  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card max-w-md w-full" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--todo-border-color)]">
          <h3 className="modal-title font-bold text-base m-0 text-[var(--todo-text-color)]">
            {t.settingsTitle}
          </h3>
          <button
            type="button"
            className="modal-close text-[var(--todo-past-text-color)] hover:text-[var(--todo-text-color)] transition-colors p-1"
            onClick={onClose}
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-5 py-4 text-sm text-[var(--todo-text-color)]">
          {/* Accent Color Palette */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-xs uppercase tracking-wider text-[var(--todo-past-text-color)]">
              {t.themeColor}
            </label>
            <p className="text-xs text-[var(--todo-past-text-color)] -mt-1">
              {t.themeColorDesc}
            </p>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              {PRESET_COLORS.map((c) => {
                const isActive = accentColor.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccentColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center text-white ${
                      isActive ? 'ring-2 ring-offset-2 ring-[var(--todo-text-color)] scale-110 shadow-md' : 'hover:scale-105 opacity-90'
                    }`}
                  >
                    {isActive && <span className="text-xs font-bold">✓</span>}
                  </button>
                );
              })}
              {/* Custom Color Input */}
              <label
                className="relative w-7 h-7 rounded-full border-2 border-dashed border-[var(--todo-past-text-color)] flex items-center justify-center cursor-pointer hover:border-[var(--custom-color)] transition-colors overflow-hidden"
                title={t.customColor}
              >
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-xs font-bold leading-none text-[var(--todo-past-text-color)]">+</span>
              </label>
            </div>
          </div>

          {/* Flying Rollover Setting */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--someday-list-background)] border border-[var(--todo-border-color)]">
            <div className="flex flex-col gap-0.5 pr-3">
              <span className="font-semibold text-xs tracking-wide">
                {t.flyingRollover}
              </span>
              <span className="text-[11px] text-[var(--todo-past-text-color)] leading-snug">
                {t.flyingRolloverDesc}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={rolloverEnabled}
                onChange={(e) => setRolloverEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--custom-color)]" />
            </label>
          </div>

          {/* Dark Mode & Language Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--someday-list-background)] border border-[var(--todo-border-color)]">
              <span className="font-semibold text-xs tracking-wide">{t.toggleDarkMode}</span>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="px-2.5 py-1 text-xs font-bold rounded bg-[var(--timer-bg)] hover:bg-[var(--custom-color)] hover:text-white transition-colors"
              >
                {darkMode ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--someday-list-background)] border border-[var(--todo-border-color)]">
              <span className="font-semibold text-xs tracking-wide">Idioma</span>
              <button
                type="button"
                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                className="px-2.5 py-1 text-xs font-bold rounded bg-[var(--timer-bg)] hover:bg-[var(--custom-color)] hover:text-white transition-colors"
              >
                {language === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
              </button>
            </div>
          </div>

          {/* Workspace Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-xs uppercase tracking-wider text-[var(--todo-past-text-color)]">
              Workspace
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder={t.workspacePlaceholder}
              className="modal-input w-full text-xs"
            />
          </div>

          {/* Danger zone / Reset */}
          <div className="pt-2 border-t border-[var(--todo-border-color)] flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onResetConfirm();
              }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors font-medium"
            >
              <RotateCcwIcon size={14} />
              {t.resetData}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn--primary px-4 py-1 text-xs font-bold"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
