'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTodoStore } from '@/store/useTodoStore';
import { formatDateKey } from '@/lib/dateUtils';
import { useTranslations } from '@/hooks/useTranslations';
import DayColumn from './DayColumn';
import { XIcon, PlayIcon, PauseIcon, RotateCcwIcon, ImageIcon } from './Icons';

const PRESETS = [15, 25, 30, 45]; // minutes

const WALLPAPERS = [
  'none',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
];

interface FocusModeProps {
  date: Date;
  onExit: () => void;
}

export default function FocusMode({ date, onExit }: FocusModeProps) {
  const t = useTranslations();
  const todos = useTodoStore((s) => s.todos);
  const dateKey = formatDateKey(date);
  const tasks = todos[dateKey] || [];

  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Exit on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onExit]);

  // Countdown interval
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const selectPreset = useCallback((mins: number) => {
    setMinutes(mins);
    setRemaining(mins * 60);
    setRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setRemaining(minutes * 60);
    setRunning(false);
  }, [minutes]);

  const cycleWallpaper = useCallback(() => {
    setWallpaperIndex((i) => (i + 1) % WALLPAPERS.length);
  }, []);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const wallpaper = WALLPAPERS[wallpaperIndex];
  const hasWallpaper = wallpaper !== 'none';

  return (
    <div
      className="focus-overlay"
      style={hasWallpaper ? { background: wallpaper } : undefined}
    >
      {/* Exit button */}
      <button className="focus-exit" onClick={onExit} type="button" title={t.focusExit}>
        <XIcon size={16} />
        <span>ESC</span>
      </button>

      {/* Wallpaper toggle */}
      <button
        className="focus-wallpaper-btn"
        onClick={cycleWallpaper}
        type="button"
        title={t.focusWallpaper}
      >
        <ImageIcon size={16} />
      </button>

      <div className="focus-card">
        {/* Pomodoro timer */}
        <div className="focus-timer">
          <div className="focus-timer__display">
            {mm}:{ss}
          </div>
          <div className="focus-timer__presets">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => selectPreset(p)}
                className={`focus-preset ${minutes === p ? 'active' : ''}`}
                type="button"
              >
                {p}:00
              </button>
            ))}
          </div>
          <div className="focus-timer__controls">
            <button
              onClick={() => setRunning((r) => !r)}
              className="focus-ctrl focus-ctrl--primary"
              type="button"
            >
              {running ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
              {running ? t.focusPause : t.focusStart}
            </button>
            <button onClick={resetTimer} className="focus-ctrl" type="button">
              <RotateCcwIcon size={14} />
              {t.focusReset}
            </button>
          </div>
        </div>

        {/* The single focused day */}
        <div className="focus-day">
          <DayColumn date={date} tasks={tasks} />
        </div>

        <p className="focus-hint">{t.focusExitHint}</p>
      </div>
    </div>
  );
}
