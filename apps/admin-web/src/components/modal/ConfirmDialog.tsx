'use client';

import React from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 rounded text-white ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
