import { useRef } from 'react';

interface Props {
  busy: boolean;
  progress: { done: number; total: number } | null;
  onFiles: (files: FileList | File[]) => void;
}

export default function UploadZone({ busy, progress, onFiles }: Props) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      {progress && (
        <span className="text-xs text-muted">
          Uploading {progress.done}/{progress.total}…
        </span>
      )}
      <input
        ref={input}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ''; }}
      />
      <button
        onClick={() => input.current?.click()}
        disabled={busy}
        className="text-sm px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-60"
      >
        Upload
      </button>
    </div>
  );
}
