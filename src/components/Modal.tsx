'use client';

import React, { useState, useRef, useEffect } from 'react';
import { XIcon } from './Icons';

interface ModalShellProps {
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}

/** Base overlay: closes on backdrop click and Esc. */
function ModalShell({ onClose, children, labelledBy }: ModalShellProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}

interface InputModalProps {
  title: string;
  placeholder?: string;
  confirmLabel: string;
  cancelLabel: string;
  initialValue?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function InputModal({
  title,
  placeholder,
  confirmLabel,
  cancelLabel,
  initialValue = '',
  onConfirm,
  onClose,
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onConfirm(trimmed);
      onClose();
    }
  };

  return (
    <ModalShell onClose={onClose} labelledBy="modal-title">
      <h3 id="modal-title" className="modal-title">
        {title}
      </h3>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder={placeholder}
        className="modal-input"
      />
      <div className="modal-actions">
        <button type="button" className="modal-btn modal-btn--ghost" onClick={onClose}>
          {cancelLabel}
        </button>
        <button type="button" className="modal-btn modal-btn--primary" onClick={submit}>
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <ModalShell onClose={onClose} labelledBy="modal-title">
      <h3 id="modal-title" className="modal-title">
        {title}
      </h3>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button type="button" className="modal-btn modal-btn--ghost" onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`modal-btn ${destructive ? 'modal-btn--danger' : 'modal-btn--primary'}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

interface InfoModalProps {
  title: string;
  items: readonly string[];
  closeLabel: string;
  onClose: () => void;
}

/** Simple informational modal used for the Help panel. */
export function InfoModal({ title, items, closeLabel, onClose }: InfoModalProps) {
  return (
    <ModalShell onClose={onClose} labelledBy="modal-title">
      <div className="flex items-center justify-between mb-3">
        <h3 id="modal-title" className="modal-title" style={{ marginBottom: 0 }}>
          {title}
        </h3>
        <button type="button" className="modal-close" onClick={onClose} aria-label={closeLabel}>
          <XIcon size={16} />
        </button>
      </div>
      <ul className="modal-help-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="modal-actions">
        <button type="button" className="modal-btn modal-btn--primary" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </ModalShell>
  );
}
