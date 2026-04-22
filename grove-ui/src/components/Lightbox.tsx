import { useEffect, useCallback, useRef } from 'react';
import type { FileMeta } from '../types';
import { fileUrl } from '../urls';
import { formatBytes } from '../format';

interface Props {
  file: FileMeta;
  files: FileMeta[];
  onNavigate: (file: FileMeta) => void;
  onClose: () => void;
}

export default function Lightbox({ file, files, onNavigate, onClose }: Props) {
  const idx = files.findIndex((f) => f.id === file.id);

  const goPrev = useCallback(() => {
    if (idx > 0) onNavigate(files[idx - 1]);
  }, [idx, files, onNavigate]);

  const goNext = useCallback(() => {
    if (idx < files.length - 1) onNavigate(files[idx + 1]);
  }, [idx, files, onNavigate]);

  const touchStartX = useRef(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': goPrev(); break;
        case 'ArrowRight': goNext(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex items-center justify-between px-4 py-2 text-white/70 text-sm">
        <span className="truncate">{file.name}</span>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs">{formatBytes(file.size)}</span>
          <span className="text-xs">{idx + 1} / {files.length}</span>
          <a
            href={fileUrl(file.id)}
            download={file.name}
            className="text-xs hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >Download</a>
          <button onClick={onClose} className="text-lg hover:text-white leading-none">&times;</button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center min-h-0 px-4 md:px-12"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (delta > 60) goPrev();
          else if (delta < -60) goNext();
        }}
      >
        {idx > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
          >
            ‹
          </button>
        )}

        <img
          key={file.id}
          src={fileUrl(file.id)}
          alt={file.name}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />

        {idx < files.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
