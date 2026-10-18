'use client';

import React from 'react';
import { useTodoStore } from '@/store/useTodoStore';
import { useTranslations } from '@/hooks/useTranslations';
import {
  HeartIcon,
  LightModeIcon,
  DarkModeIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronLeftDouble,
} from './Icons';

const COLOR_PRESETS = [
  { hex: '#852CE6', name: 'Purple' },
  { hex: '#ED0C00', name: 'Red' },
  { hex: '#E10061', name: 'Pink' },
  { hex: '#FFCC00', name: 'Yellow', darkIcon: true },
  { hex: '#00CF58', name: 'Green' },
  { hex: '#00D2A3', name: 'Teal' },
  { hex: '#65C7FF', name: 'Sky Blue', darkIcon: true },
  { hex: '#007AFF', name: 'Blue' },
  { hex: '#141414', name: 'Black' },
];

export const PreferencesDrawer: React.FC = () => {
  const t = useTranslations();
  const {
    isPreferencesOpen,
    setIsPreferencesOpen,
    accentColor,
    setAccentColor,
    gridColumnSize,
    setGridColumnSize,
    textSize,
    setTextSize,
    spacing,
    setSpacing,
    showCompleted,
    setShowCompleted,
    bulletStyle,
    setBulletStyle,
    showLines,
    setShowLines,
    darkMode,
    setDarkMode,
  } = useTodoStore();

  if (!isPreferencesOpen) return null;

  return (
    <aside
      className="w-[280px] sm:w-[300px] h-full flex flex-col justify-between bg-[#141414] text-[#ececee] border-r border-[#26262b] select-none z-50 flex-shrink-0 transition-all duration-200"
      aria-label="Preferences"
    >
      {/* Scrollable preferences content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <h2 className="text-base font-medium tracking-tight text-white mb-6">
          Preferences
        </h2>

        {/* 1. Accent Color Palette */}
        <div>
          <ul className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((color) => {
              const isSelected = accentColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <li key={color.hex}>
                  <button
                    type="button"
                    onClick={() => setAccentColor(color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
                    title={color.name}
                  >
                    {isSelected && (
                      <HeartIcon
                        size={12}
                        className={color.darkIcon ? 'text-black' : 'text-white'}
                      />
                    )}
                  </button>
                </li>
              );
            })}
            {/* Rainbow / custom indicator */}
            <li>
              <div
                className="w-7 h-7 rounded-full transition-transform hover:scale-105 shadow-sm cursor-pointer"
                style={{
                  background:
                    'conic-gradient(#e6df04, #99ca0f, #00d2a3, #00cf58, #65c7ff, #852ce6, #e10061, #ed0c00, #ffcc00)',
                }}
                title="Color wheel"
              />
            </li>
          </ul>
        </div>

        {/* 2. Columns */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Columns</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            {[1, 3, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setGridColumnSize(num)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  gridColumnSize === num
                    ? 'bg-[#3b3b44] text-white font-semibold'
                    : 'text-[#9c9ca3] hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Text size */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Text size</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            {(['S', 'M', 'L'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setTextSize(sz)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  textSize === sz
                    ? 'bg-[#3b3b44] text-white font-semibold'
                    : 'text-[#9c9ca3] hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Spacing */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Spacing</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            {(['S', 'M', 'L'] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpacing(sp)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  spacing === sp
                    ? 'bg-[#3b3b44] text-white font-semibold'
                    : 'text-[#9c9ca3] hover:text-white'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Completed todo's */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Completed todo&apos;s</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            <button
              type="button"
              onClick={() => setShowCompleted(true)}
              className={`p-1.5 rounded transition-colors ${
                showCompleted ? 'bg-[#3b3b44] text-white' : 'text-[#7d7d85] hover:text-white'
              }`}
              title="Show completed"
            >
              <EyeIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowCompleted(false)}
              className={`p-1.5 rounded transition-colors ${
                !showCompleted ? 'bg-[#3b3b44] text-white' : 'text-[#7d7d85] hover:text-white'
              }`}
              title="Hide completed"
            >
              <EyeOffIcon size={14} />
            </button>
          </div>
        </div>

        {/* 6. Bullet style */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Bullet style</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a] gap-0.5">
            {[
              { id: 'none', label: '⊘' },
              { id: 'square', label: '■' },
              { id: 'dot', label: '●' },
              { id: 'arrow', label: '→' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBulletStyle(b.id as any)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  bulletStyle === b.id
                    ? 'bg-[#3b3b44] text-white font-bold'
                    : 'text-[#7d7d85] hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Start on */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Start on</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            <button
              type="button"
              className="px-2.5 py-1 text-xs rounded bg-[#3b3b44] text-white font-semibold"
            >
              Today
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-xs rounded text-[#7d7d85] hover:text-white"
            >
              Yesterday
            </button>
          </div>
        </div>

        {/* 8. Lines */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Lines</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            <button
              type="button"
              onClick={() => setShowLines(true)}
              className={`p-1.5 rounded transition-colors ${
                showLines ? 'bg-[#3b3b44] text-white' : 'text-[#7d7d85] hover:text-white'
              }`}
              title="Show lines"
            >
              <EyeIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowLines(false)}
              className={`p-1.5 rounded transition-colors ${
                !showLines ? 'bg-[#3b3b44] text-white' : 'text-[#7d7d85] hover:text-white'
              }`}
              title="Hide lines"
            >
              <EyeOffIcon size={14} />
            </button>
          </div>
        </div>

        {/* 9. Display (Light / Dark) */}
        <div className="flex items-center justify-between text-xs text-[#a6a6a7]">
          <span>Display</span>
          <div className="flex bg-[#232328] rounded p-0.5 border border-[#33333a]">
            <button
              type="button"
              onClick={() => setDarkMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                !darkMode ? 'bg-[#3b3b44] text-white font-semibold' : 'text-[#7d7d85] hover:text-white'
              }`}
            >
              <LightModeIcon size={12} />
              Light
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
                darkMode ? 'bg-[#3b3b44] text-white font-semibold' : 'text-[#7d7d85] hover:text-white'
              }`}
            >
              <DarkModeIcon size={12} />
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Footer of Sidebar with << collapse button */}
      <div className="px-6 py-3 border-t border-[#26262b] flex items-center justify-start">
        <button
          type="button"
          onClick={() => setIsPreferencesOpen(false)}
          className="text-[#8e8e93] hover:text-white p-1 rounded hover:bg-[#232328] transition-colors"
          title="Collapse preferences"
        >
          <ChevronLeftDouble size={16} />
        </button>
      </div>
    </aside>
  );
};
