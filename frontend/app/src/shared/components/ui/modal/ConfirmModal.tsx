import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "تایید",
  cancelText = "انصراف",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-[400px] p-6">
      <div className="flex flex-col gap-4 text-left">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-5">
          {message}
        </p>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            size="sm"
            variant={isDestructive ? "primary" : "primary"} // Assuming primary can be styled, or we can use raw class for destructive
            className={
              isDestructive
                ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                : ""
            }
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "در حال انجام..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
