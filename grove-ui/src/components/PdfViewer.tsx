import { useState, useEffect, lazy, Suspense } from 'react';
import type { FileMeta } from '../types';
import { fileUrl } from '../urls';
import { formatBytes } from '../format';

const LazyDocument = lazy(() =>
  import('react-pdf').then((mod) => {
    mod.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    return { default: mod.Document };
  })
);

const LazyPage = lazy(() =>
  import('react-pdf').then((mod) => ({ default: mod.Page }))
);

interface Props {
  file: FileMeta;
  onClose: () => void;
}

export default function PdfViewer({ file, onClose }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex items-center justify-between px-4 py-2 text-white/70 text-sm shrink-0">
        <span className="truncate">{file.name}</span>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs">{formatBytes(file.size)}</span>
          {numPages && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-xs">{currentPage} / {numPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="text-xs px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
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
        className="flex-1 flex items-center justify-center min-h-0 overflow-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {error ? (
          <div className="text-white/60 text-sm">
            Could not load PDF.{' '}
            <a href={fileUrl(file.id)} download={file.name} className="text-accent hover:underline">Download instead</a>
          </div>
        ) : (
          <Suspense fallback={<div className="text-white/40 text-sm">Loading PDF viewer...</div>}>
            <LazyDocument
              file={fileUrl(file.id)}
              onLoadSuccess={({ numPages: n }: { numPages: number }) => setNumPages(n)}
              onLoadError={() => setError(true)}
              className="flex justify-center"
            >
              <LazyPage
                pageNumber={currentPage}
                className="shadow-2xl"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </LazyDocument>
          </Suspense>
        )}
      </div>
    </div>
  );
}
