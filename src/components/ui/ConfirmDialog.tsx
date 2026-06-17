"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  loading,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
