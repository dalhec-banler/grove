import { useEffect, useRef } from 'react';

export default function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    // Focus the dialog for keyboard/AT users — but don't steal focus from an
    // element inside that already grabbed it (e.g. an autoFocus input).
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) el.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 md:p-0 outline-none"
    >
      {children}
    </div>
  );
}
