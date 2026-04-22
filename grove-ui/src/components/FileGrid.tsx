import { useState, useRef, useCallback, useEffect } from 'react';
import type { FileMeta } from '../types';
import { formatBytes, formatDate } from '../format';
import { fileUrl } from '../urls';
import { setDragFileIds } from '../dnd';
import { GRID_STYLE } from '../styles';
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
  onOpenViewer?: (id: string) => void;
}

interface MarqueeRect { x: number; y: number; width: number; height: number }

export default function FileGrid({
  files, activeId, selectedIds, onSelect, onToggleSelect, onRangeSelect, onBatchSelect,
  onToggleStar, onShare, onDelete, onOpenViewer,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null);
  const marqueeCleanupRef = useRef<(() => void) | null>(null);
  const onBatchSelectRef = useRef(onBatchSelect);
  onBatchSelectRef.current = onBatchSelect;

  useEffect(() => setFocusIndex(-1), [files]);
  useEffect(() => () => marqueeCleanupRef.current?.(), []);

  const getColumnCount = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || grid.children.length < 2) return 1;
    const firstTop = (grid.children[0] as HTMLElement).offsetTop;
    let cols = 1;
    for (let i = 1; i < grid.children.length; i++) {
      if ((grid.children[i] as HTMLElement).offsetTop === firstTop) cols++;
      else break;
    }
    return cols;
  }, []);

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

    const cols = getColumnCount();
    let delta = 0;
    switch (e.key) {
      case 'ArrowUp': delta = -cols; break;
      case 'ArrowDown': delta = cols; break;
      case 'ArrowLeft': delta = -1; break;
      case 'ArrowRight': delta = 1; break;
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
    (gridRef.current?.children[next] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
  }, [files, focusIndex, getColumnCount, onSelect, onToggleSelect, onRangeSelect, onBatchSelect]);

  const handleCardClick = useCallback((id: string, idx: number, e: React.MouseEvent) => {
    setFocusIndex(idx);
    if (e.shiftKey) onRangeSelect(id);
    else if (e.metaKey || e.ctrlKey) onToggleSelect(id);
    else onSelect(id);
  }, [onSelect, onToggleSelect, onRangeSelect]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if ((e.target as HTMLElement).closest('[data-file-id]')) return;

    e.preventDefault();
    containerRef.current?.focus();
    const container = containerRef.current!;
    const grid = gridRef.current!;
    const cRect = container.getBoundingClientRect();
    const startX = e.clientX - cRect.left;
    const startY = e.clientY - cRect.top + container.scrollTop;
    const prevSelected = e.shiftKey ? new Set(selectedIds) : new Set<string>();

    setMarquee({ x: startX, y: startY, width: 0, height: 0 });

    const onMove = (me: MouseEvent) => {
      const cr = container.getBoundingClientRect();
      const curX = me.clientX - cr.left;
      const curY = me.clientY - cr.top + container.scrollTop;
      const mx = Math.min(startX, curX);
      const my = Math.min(startY, curY);
      const mw = Math.abs(curX - startX);
      const mh = Math.abs(curY - startY);
      setMarquee({ x: mx, y: my, width: mw, height: mh });

      const ids = new Set(prevSelected);
      const st = container.scrollTop;
      grid.querySelectorAll('[data-file-id]').forEach((card) => {
        const r = card.getBoundingClientRect();
        const cLeft = r.left - cr.left;
        const cRight = r.right - cr.left;
        const cTop = r.top - cr.top + st;
        const cBottom = r.bottom - cr.top + st;
        if (mx < cRight && mx + mw > cLeft && my < cBottom && my + mh > cTop) {
          ids.add(card.getAttribute('data-file-id')!);
        }
      });
      onBatchSelectRef.current(ids);
    };

    const onUp = () => {
      setMarquee(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      marqueeCleanupRef.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    marqueeCleanupRef.current = onUp;
  }, [selectedIds]);

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-faint text-sm">
        No files here. Drop files to upload.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 relative outline-none ${marquee ? 'select-none' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    >
      <div ref={gridRef} className="grid gap-4" style={GRID_STYLE}>
        {files.map((f, i) => (
          <Card
            key={f.id}
            file={f}
            active={activeId === f.id}
            selected={selectedIds.has(f.id)}
            focused={focusIndex === i}
            onClick={(e) => handleCardClick(f.id, i, e)}
            onOpenViewer={onOpenViewer ? () => onOpenViewer(f.id) : undefined}
            onToggleSelect={() => { setFocusIndex(i); onToggleSelect(f.id); }}
            onToggleStar={() => onToggleStar(f.id)}
            onShare={() => onShare(f.id)}
            onDelete={() => onDelete(f.id)}
            onDragStart={(e) => {
              const ids = selectedIds.has(f.id) ? Array.from(selectedIds) : [f.id];
              setDragFileIds(e, ids);
            }}
          />
        ))}
      </div>
      {marquee && marquee.width + marquee.height > 4 && (
        <div
          className="absolute border border-accent bg-accent/10 pointer-events-none z-10 rounded-sm"
          style={{ left: marquee.x, top: marquee.y, width: marquee.width, height: marquee.height }}
        />
      )}
    </div>
  );
}

function Card({ file, active, selected, focused, onClick, onOpenViewer, onToggleSelect, onToggleStar, onShare, onDelete, onDragStart }: {
  file: FileMeta; active: boolean; selected: boolean; focused: boolean;
  onClick: (e: React.MouseEvent) => void; onOpenViewer?: () => void; onToggleSelect: () => void;
  onToggleStar: () => void; onShare: () => void; onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  return (
    <div
      data-file-id={file.id}
      draggable
      onDragStart={onDragStart}
      className={`group relative rounded-lg border bg-surface cursor-pointer overflow-hidden ${
        selected ? 'border-accent ring-2 ring-accent/30'
        : active ? 'border-accent ring-2 ring-accent-soft'
        : focused ? 'border-accent/50 ring-1 ring-accent/20'
        : 'border-border hover:border-ink/20'
      }`}
    >
      <div
        className="aspect-square bg-bg flex items-center justify-center overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenViewer) onOpenViewer();
          else onClick(e);
        }}
      >
        <Thumb mark={file.fileMark} src={fileUrl(file.id)} size="fill" />
      </div>
      <div className="p-2" onClick={onClick}>
        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
            onClick={(e) => e.stopPropagation()}
            className="w-3.5 h-3.5 accent-accent shrink-0"
          />
          <div className="text-sm truncate" title={file.name}>{file.name}</div>
        </div>
        <div className="text-xs text-muted flex justify-between mt-0.5">
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
      <div className="absolute top-2 right-2 flex gap-1 md:opacity-0 md:group-hover:opacity-100">
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
