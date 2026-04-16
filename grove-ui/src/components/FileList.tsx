import type { FileMeta } from '../types';
import { formatBytes, formatDate } from '../format';
import { fileUrl } from '../urls';
import Thumb from './Thumb';

interface Props {
  files: FileMeta[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileList({ files, activeId, onSelect, onToggleStar, onShare, onDelete }: Props) {
  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-faint text-sm">
        No files here. Drop one above to upload.
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted uppercase tracking-wider bg-bg sticky top-0">
          <tr>
            <th className="w-8"></th>
            <th className="text-left font-normal px-3 py-2">Name</th>
            <th className="text-left font-normal px-3 py-2 w-48">Tags</th>
            <th className="text-right font-normal px-3 py-2 w-24">Size</th>
            <th className="text-right font-normal px-3 py-2 w-36">Modified</th>
            <th className="w-28"></th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr
              key={f.id}
              onClick={() => onSelect(f.id)}
              className={`border-b border-border cursor-pointer group ${activeId === f.id ? 'bg-accent-soft' : 'hover:bg-bg'}`}
            >
              <td className="pl-4 pr-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleStar(f.id); }}
                  className={`text-base ${f.starred ? 'text-amber-500' : 'text-faint hover:text-amber-500'}`}
                  title={f.starred ? 'Unstar' : 'Star'}
                >
                  {f.starred ? '★' : '☆'}
                </button>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Thumb mark={f.fileMark} src={fileUrl(f.id)} size="sm" />
                  <span className="truncate">{f.name}</span>
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {f.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-bg border border-border text-muted">{t}</span>
                  ))}
                  {f.tags.length > 3 && <span className="text-xs text-faint">+{f.tags.length - 3}</span>}
                </div>
              </td>
              <td className="px-3 py-2 text-right text-muted">{formatBytes(f.size)}</td>
              <td className="px-3 py-2 text-right text-muted">{formatDate(f.modified)}</td>
              <td className="pr-4">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                  <a
                    href={fileUrl(f.id)}
                    download={f.name}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-muted hover:text-accent"
                  >Download</a>
                  <button
                    className="text-xs text-muted hover:text-accent"
                    onClick={(e) => { e.stopPropagation(); onShare(f.id); }}
                  >Share</button>
                  <button
                    className="text-xs text-muted hover:text-red-600"
                    onClick={(e) => { e.stopPropagation(); onDelete(f.id); }}
                  >Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
