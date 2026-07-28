import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'outline' | 'warning' | 'secondary' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel',
  variant = 'danger', isLoading = false, onConfirm, onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="space-y-5">
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>{cancelText}</Button>
          <Button type="button" variant={variant} isLoading={isLoading} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  );
};
