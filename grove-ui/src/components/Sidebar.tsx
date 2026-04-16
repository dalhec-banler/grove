import { useState } from 'react';
import type { Selection, View } from '../types';

interface Props {
  views: View[];
  tagCounts: Array<[string, number]>;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onNewView: () => void;
  onEditView: (v: View) => void;
  onDeleteView: (v: View) => void;
  counts: { all: number; starred: number; inbox: number; inboxPending: number; canopy: number };
  connected: boolean;
  shipName: string;
  canopyPeers: string[];
  onUnsubscribeCanopy: (ship: string) => void;
}

function shortShip(ship: string): string {
  const s = ship.replace(/^~/, '');
  const parts = s.split('-');
  if (parts.length >= 8) return '~' + parts.slice(0, 2).join('-');
  return '~' + s;
}

export default function Sidebar(p: Props) {
  const sel = p.selection;
  const [viewsOpen, setViewsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [canopyOpen, setCanopyOpen] = useState(true);
  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = p.tagCounts.filter(([t]) =>
    !tagFilter || t.toLowerCase().includes(tagFilter.toLowerCase())
  );

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white text-sm font-medium">G</div>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight">Grove</div>
          <div className="text-[10px] text-faint font-mono truncate leading-tight">{shortShip(p.shipName)}</div>
        </div>
        <span className={`w-2 h-2 rounded-full ${p.connected ? 'bg-green-500' : 'bg-faint'}`} title={p.connected ? 'connected' : 'connecting…'} />
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <SidebarItem
          label="All files"
          count={p.counts.all}
          active={sel.kind === 'all'}
          onClick={() => p.onSelect({ kind: 'all' })}
        />
        <SidebarItem
          label="Starred"
          count={p.counts.starred}
          active={sel.kind === 'starred'}
          onClick={() => p.onSelect({ kind: 'starred' })}
        />
        <button
          onClick={() => p.onSelect({ kind: 'inbox' })}
          className={`w-full px-4 py-1.5 flex items-center justify-between text-sm ${sel.kind === 'inbox' ? 'bg-accent-soft text-accent font-medium' : 'text-ink hover:bg-bg'}`}
        >
          <span className="truncate">Shared with me</span>
          <span className="flex items-center gap-1.5 ml-2">
            {p.counts.inboxPending > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">{p.counts.inboxPending}</span>
            )}
            <span className="text-xs text-faint">{p.counts.inbox}</span>
          </span>
        </button>

        <SectionHeader
          label="Canopy"
          open={canopyOpen}
          onToggle={() => setCanopyOpen(!canopyOpen)}
        />
        {canopyOpen && (
          <div className="mt-1">
            <SidebarItem
              label="My canopy"
              count={p.counts.canopy}
              active={sel.kind === 'canopy-mine'}
              onClick={() => p.onSelect({ kind: 'canopy-mine' })}
            />
            <button
              onClick={() => p.onSelect({ kind: 'canopy-browse' })}
              className={`w-full px-4 py-1.5 flex items-center text-sm ${sel.kind === 'canopy-browse' ? 'bg-accent-soft text-accent font-medium' : 'text-ink hover:bg-bg'}`}
            >
              <span className="truncate">Browse</span>
            </button>
            {p.canopyPeers.length > 0 && (
              <div className="mt-1 mb-1 px-4 text-[10px] uppercase tracking-wider text-faint">Subscriptions</div>
            )}
            {p.canopyPeers.map((ship) => (
              <PeerItem
                key={ship}
                ship={ship}
                active={sel.kind === 'canopy-peer' && sel.ship === ship}
                onClick={() => p.onSelect({ kind: 'canopy-peer', ship })}
                onUnsubscribe={() => { if (confirm(`Unsubscribe from ${ship}?`)) p.onUnsubscribeCanopy(ship); }}
              />
            ))}
          </div>
        )}

        <SectionHeader
          label="Views"
          open={viewsOpen}
          onToggle={() => setViewsOpen(!viewsOpen)}
          onAdd={p.onNewView}
          addTitle="New view"
        />
        {viewsOpen && (
          <div className="mt-1">
            {p.views.length === 0 && (
              <div className="px-4 py-2 text-xs text-faint">No views yet</div>
            )}
            {p.views.map((v) => (
              <ViewItem
                key={v.name}
                view={v}
                active={sel.kind === 'view' && sel.name === v.name}
                onClick={() => p.onSelect({ kind: 'view', name: v.name })}
                onEdit={() => p.onEditView(v)}
                onDelete={() => { if (confirm(`Delete view "${v.name}"?`)) p.onDeleteView(v); }}
              />
            ))}
          </div>
        )}

        <SectionHeader
          label="Tags"
          open={tagsOpen}
          onToggle={() => setTagsOpen(!tagsOpen)}
        />
        {tagsOpen && (
          <div className="mt-1">
            {p.tagCounts.length === 0 ? (
              <div className="px-4 py-2 text-xs text-faint">No tags yet</div>
            ) : (
              <>
                <div className="px-4 pb-1">
                  <input
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    placeholder="Search tags…"
                    className="w-full text-xs border border-border rounded px-2 py-1"
                  />
                </div>
                {filteredTags.map(([tag, count]) => (
                  <SidebarItem
                    key={tag}
                    label={`#${tag}`}
                    count={count}
                    active={sel.kind === 'tag' && sel.name === tag}
                    onClick={() => p.onSelect({ kind: 'tag', name: tag })}
                  />
                ))}
                {filteredTags.length === 0 && (
                  <div className="px-4 py-2 text-xs text-faint">No matches</div>
                )}
              </>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

function SectionHeader({ label, open, onToggle, onAdd, addTitle }: { label: string; open: boolean; onToggle: () => void; onAdd?: () => void; addTitle?: string }) {
  return (
    <div className="mt-5 px-4 flex items-center justify-between text-xs text-muted uppercase tracking-wider">
      <button onClick={onToggle} className="flex items-center gap-1 hover:text-ink">
        <span className="inline-block w-3 text-center">{open ? '▾' : '▸'}</span>
        {label}
      </button>
      {onAdd && (
        <button className="text-muted hover:text-ink text-base leading-none" onClick={onAdd} title={addTitle}>+</button>
      )}
    </div>
  );
}

function SidebarItem({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-1.5 flex items-center justify-between text-sm ${active ? 'bg-accent-soft text-accent font-medium' : 'text-ink hover:bg-bg'}`}
    >
      <span className="truncate">{label}</span>
      <span className="text-xs text-faint ml-2">{count}</span>
    </button>
  );
}

function PeerItem({ ship, active, onClick, onUnsubscribe }: { ship: string; active: boolean; onClick: () => void; onUnsubscribe: () => void }) {
  return (
    <div className={`group flex items-center pr-2 ${active ? 'bg-accent-soft' : 'hover:bg-bg'}`}>
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className={`truncate font-mono text-xs ${active ? 'text-accent font-medium' : 'text-ink'}`}>{shortShip(ship)}</span>
      </button>
      <button className="hidden group-hover:block text-xs text-muted hover:text-red-600 px-1" onClick={onUnsubscribe} title="Unsubscribe">×</button>
    </div>
  );
}

function ViewItem({ view, active, onClick, onEdit, onDelete }: { view: View; active: boolean; onClick: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={`group flex items-center pr-2 ${active ? 'bg-accent-soft' : 'hover:bg-bg'}`}>
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: view.color }} />
        <span className={`truncate ${active ? 'text-accent font-medium' : 'text-ink'}`}>{view.name}</span>
      </button>
      <div className="hidden group-hover:flex gap-1">
        <button className="text-xs text-muted hover:text-ink px-1" onClick={onEdit} title="Edit">✎</button>
        <button className="text-xs text-muted hover:text-red-600 px-1" onClick={onDelete} title="Delete">×</button>
      </div>
    </div>
  );
}
