import { IMAGE_MARKS } from '../format';

export default function PreviewPane({ src, name, mark, onClose }: {
  src: string; name: string; mark: string; onClose: () => void;
}) {
  const isImage = IMAGE_MARKS.has(mark.toLowerCase());

  return (
    <div className="mt-3 border-t border-border pt-3">
      {isImage ? (
        <img src={src} alt={name} className="max-h-96 mx-auto rounded" />
      ) : (
        <div className="text-xs text-muted">Preview not supported. Use Download.</div>
      )}
      <button onClick={onClose} className="mt-2 text-xs text-muted hover:text-red-600">
        Close & drop cache
      </button>
    </div>
  );
}
