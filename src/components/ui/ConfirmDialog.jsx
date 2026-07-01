"use client";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-500",
    confirmVariant: "danger",
    title: "Confirm Action",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-amber-500",
    confirmVariant: "primary",
    title: "Warning",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    confirmVariant: "primary",
    title: "Information",
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || config.title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            size="md"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
          <Icon size={24} />
        </div>
        <p className="m-0 text-sm text-[var(--text-secondary)] leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
