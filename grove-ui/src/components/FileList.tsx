import { useState, useRef, useCallback, useEffect } from 'react';
import type { FileMeta } from '../types';
import { formatBytes, formatDate } from '../format';
import { fileUrl } from '../urls';
import { setDragFileIds } from '../dnd';
import Thumb from './Thumb';

interface Props {
  files: FileMeta[];
  activeId: string | null;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onRangeSelect: (id: string) => void;
  onBatchSelect: (ids: Set<string>) => void;
  onToggleStar: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileList({
  files, activeId, selectedIds, onSelect, onToggleSelect, onRangeSelect, onBatchSelect,
  onToggleStar, onShare, onDelete,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);

  useEffect(() => setFocusIndex(-1), [files]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (files.length === 0) return;
    if (e.key === 'Escape') {
      onBatchSelect(new Set());
      setFocusIndex(-1);
      return;
    }
    if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onBatchSelect(new Set(files.map((f) => f.id)));
      return;
    }

    let delta = 0;
    switch (e.key) {
      case 'ArrowUp': delta = -1; break;
      case 'ArrowDown': delta = 1; break;
      case ' ':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < files.length) onToggleSelect(files[focusIndex].id);
        return;
      case 'Enter':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < files.length) onSelect(files[focusIndex].id);
        return;
      default: return;
    }
    e.preventDefault();
    const cur = focusIndex < 0 ? 0 : focusIndex;
    const next = Math.max(0, Math.min(files.length - 1, cur + delta));
    setFocusIndex(next);
    if (e.shiftKey) onRangeSelect(files[next].id);
    const rows = containerRef.current?.querySelectorAll('tbody tr');
    (rows?.[next] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
  }, [files, focusIndex, onSelect, onToggleSelect, onRangeSelect, onBatchSelect]);

  const handleRowClick = useCallback((id: string, idx: number, e: React.MouseEvent) => {
    setFocusIndex(idx);
    if (e.shiftKey) onRangeSelect(id);
    else if (e.metaKey || e.ctrlKey) onToggleSelect(id);
    else onSelect(id);
  }, [onSelect, onToggleSelect, onRangeSelect]);

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-faint text-sm">
        No files here. Drop one above to upload.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <table className="w-full text-sm">
        <thead className="text-xs text-muted uppercase tracking-wider bg-bg sticky top-0">
          <tr>
            <th className="w-8 pl-3"></th>
            <th className="w-8"></th>
            <th className="text-left font-normal px-3 py-2">Name</th>
            <th className="text-left font-normal px-3 py-2 w-48">Tags</th>
            <th className="text-right font-normal px-3 py-2 w-24">Size</th>
            <th className="text-right font-normal px-3 py-2 w-36">Modified</th>
            <th className="w-28"></th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, i) => {
            const selected = selectedIds.has(f.id);
            const focused = focusIndex === i;
            return (
              <tr
                key={f.id}
                draggable
                onDragStart={(e) => {
                  const ids = selectedIds.has(f.id) ? Array.from(selectedIds) : [f.id];
                  setDragFileIds(e, ids);
                }}
                onClick={(e) => handleRowClick(f.id, i, e)}
                className={`border-b border-border cursor-pointer group ${
                  selected ? 'bg-accent-soft'
                  : activeId === f.id ? 'bg-accent-soft'
                  : focused ? 'bg-accent-soft/50'
                  : 'hover:bg-bg'
                }`}
              >
                <td className="pl-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => { e.stopPropagation(); setFocusIndex(i); onToggleSelect(f.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 accent-accent"
                  />
                </td>
                <td className="pl-1 pr-1">
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
