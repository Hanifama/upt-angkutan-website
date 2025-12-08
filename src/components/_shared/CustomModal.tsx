import React from "react";

interface CustomModalProps {
  visible: boolean;
  title: string;
  content: string;
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  content,
  onOk,
  onCancel,
  okText = "Ya",
  cancelText = "Tidak",
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className="mb-6">{content}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={onOk}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
