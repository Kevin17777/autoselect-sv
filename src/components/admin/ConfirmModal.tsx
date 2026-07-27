import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
};

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'default' }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmClass = variant === 'danger'
    ? 'bg-sport text-white hover:bg-sport/80'
    : 'bg-sport text-white hover:bg-sport/80';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative glass-panel p-6 w-full max-w-sm rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="border border-white/20 text-white/60 hover:bg-white/5 px-5 py-2.5 rounded-xl text-sm transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm}
            className={`${confirmClass} px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
