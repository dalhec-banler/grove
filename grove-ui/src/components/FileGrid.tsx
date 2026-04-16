import type { FileMeta } from '../types';
import { formatBytes, formatDate, IMAGE_MARKS } from '../format';
import { fileUrl } from '../urls';
import { GRID_STYLE } from '../styles';
import FileIcon from './FileIcon';

interface Props {
  files: FileMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileGrid({ files, activeId, onSelect, onToggleStar, onShare, onDelete }: Props) {
  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-faint text-sm">
        No files here. Drop files to upload.
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-4" style={GRID_STYLE}>
        {files.map((f) => (
          <Card
            key={f.id}
            file={f}
            active={activeId === f.id}
            onSelect={() => onSelect(f.id)}
            onToggleStar={() => onToggleStar(f.id)}
            onShare={() => onShare(f.id)}
            onDelete={() => onDelete(f.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ file, active, onSelect, onToggleStar, onShare, onDelete }: {
  file: FileMeta; active: boolean; onSelect: () => void;
  onToggleStar: () => void; onShare: () => void; onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-lg border bg-surface cursor-pointer overflow-hidden ${active ? 'border-accent ring-2 ring-accent-soft' : 'border-border hover:border-ink/20'}`}
    >
      <div className="aspect-square bg-bg flex items-center justify-center overflow-hidden">
        {IMAGE_MARKS.has(file.fileMark.toLowerCase()) ? (
          <img src={fileUrl(file.id)} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <FileIcon mark={file.fileMark} className="w-16 h-16" />
        )}
      </div>
      <div className="p-2">
        <div className="text-sm truncate" title={file.name}>{file.name}</div>
        <div className="text-xs text-muted flex justify-between">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.modified)}</span>
        </div>
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {file.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] px-1 rounded bg-bg border border-border text-muted">{t}</span>
            ))}
            {file.tags.length > 2 && <span className="text-[10px] text-faint">+{file.tags.length - 2}</span>}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
        className={`absolute top-2 left-2 text-base ${file.starred ? 'text-amber-500' : 'text-white/80 hover:text-amber-500 drop-shadow'}`}
      >
        {file.starred ? '★' : '☆'}
      </button>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
        <a
          href={fileUrl(file.id)}
          download={file.name}
          onClick={(e) => e.stopPropagation()}
          className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-black/80"
          title="Download"
        >↓</a>
        <button
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-black/80"
        >Share</button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-xs px-1.5 py-0.5 rounded bg-black/60 text-white hover:bg-red-600"
        >×</button>
      </div>
    </div>
  );
}
