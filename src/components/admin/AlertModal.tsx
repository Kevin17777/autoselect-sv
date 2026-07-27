import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
};

export default function AlertModal({ isOpen, title, message, onClose, buttonText = 'OK' }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative glass-panel p-6 w-full max-w-sm rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
        <p className="text-white/60 text-sm mb-6 leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button onClick={onClose}
            className="bg-sport text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-sport/80">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
