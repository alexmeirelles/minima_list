'use client';

interface Props {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-md shadow-xl border border-gray-200 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold mb-2 text-gray-800 font-[Space_Grotesk] uppercase">
          Confirmar
        </h3>
        <p className="text-gray-600 mb-6 text-sm font-medium">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm?.()}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#967259] rounded-sm hover:bg-[#7a5c48] transition-colors shadow-sm"
          >
            Apagar
          </button>
        </div>
      </div>
    </div>
  );
}
