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

export function shortShip(ship: string): string {
  const s = ship.replace(/^~/, '');
  const parts = s.split('-');
  if (parts.length >= 8) return '~' + parts.slice(0, 2).join('-');
  return '~' + s;
}

export default function Sidebar({
  views, tagCounts, selection, onSelect, onNewView, onEditView, onDeleteView,
  counts, connected, shipName, canopyPeers, onUnsubscribeCanopy,
}: Props) {
  const [viewsOpen, setViewsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [subsOpen, setSubsOpen] = useState(true);
  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = tagCounts.filter(([t]) =>
    !tagFilter || t.toLowerCase().includes(tagFilter.toLowerCase())
  );

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white text-sm font-semibold">G</div>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight">Grove</div>
          <div className="text-[10px] text-faint font-mono truncate leading-tight">{shortShip(shipName)}</div>
        </div>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-faint'}`} title={connected ? 'connected' : 'connecting…'} />
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="py-3">
          <SidebarItem
            label="All files"
            count={counts.all}
            active={selection.kind === 'all'}
            onClick={() => onSelect({ kind: 'all' })}
          />
          <SidebarItem
            label="Starred"
            count={counts.starred}
            active={selection.kind === 'starred'}
            onClick={() => onSelect({ kind: 'starred' })}
          />
          <button
            onClick={() => onSelect({ kind: 'inbox' })}
            className={`w-full px-4 py-1.5 flex items-center justify-between text-sm ${selection.kind === 'inbox' ? 'bg-accent-soft text-accent font-medium' : 'text-ink hover:bg-bg'}`}
          >
            <span className="truncate">Shared with me</span>
            <span className="flex items-center gap-1.5 ml-2">
              {counts.inboxPending > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">{counts.inboxPending}</span>
              )}
              <span className="text-xs text-faint">{counts.inbox}</span>
            </span>
          </button>

          <SectionHeader
            label="Views"
            open={viewsOpen}
            onToggle={() => setViewsOpen(!viewsOpen)}
            onAdd={onNewView}
            addTitle="New view"
          />
          {viewsOpen && (
            <div className="mt-1">
              {views.length === 0 && (
                <div className="px-4 py-2 text-xs text-faint">No views yet</div>
              )}
              {views.map((v) => (
                <ViewItem
                  key={v.name}
                  view={v}
                  active={selection.kind === 'view' && selection.name === v.name}
                  onClick={() => onSelect({ kind: 'view', name: v.name })}
                  onEdit={() => onEditView(v)}
                  onDelete={() => { if (confirm(`Delete view "${v.name}"?`)) onDeleteView(v); }}
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
              {tagCounts.length === 0 ? (
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
                      active={selection.kind === 'tag' && selection.name === tag}
                      onClick={() => onSelect({ kind: 'tag', name: tag })}
                    />
                  ))}
                  {filteredTags.length === 0 && (
                    <div className="px-4 py-2 text-xs text-faint">No matches</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border">
          <div className="h-12 flex items-center gap-2 px-4 border-b border-border">
            <div className="w-7 h-7 rounded-md bg-canopy flex items-center justify-center text-white text-sm font-semibold">C</div>
            <div className="font-medium leading-tight text-sm">Canopy</div>
          </div>

          <div className="py-2">
            <SidebarItem
              label="My canopy"
              count={counts.canopy}
              active={selection.kind === 'canopy-mine'}
              onClick={() => onSelect({ kind: 'canopy-mine' })}
              color="canopy"
            />
            <button
              onClick={() => onSelect({ kind: 'canopy-browse' })}
              className={`w-full px-4 py-1.5 flex items-center text-sm ${selection.kind === 'canopy-browse' ? 'bg-canopy-soft text-canopy font-medium' : 'text-ink hover:bg-bg'}`}
            >
              <span className="truncate">Browse</span>
            </button>
            {canopyPeers.length > 0 && (
              <SectionHeader
                label={`Subscriptions (${canopyPeers.length})`}
                open={subsOpen}
                onToggle={() => setSubsOpen(!subsOpen)}
                small
              />
            )}
            {subsOpen && canopyPeers.map((ship) => (
              <PeerItem
                key={ship}
                ship={ship}
                active={selection.kind === 'canopy-peer' && selection.ship === ship}
                onClick={() => onSelect({ kind: 'canopy-peer', ship })}
                onUnsubscribe={() => { if (confirm(`Unsubscribe from ${ship}?`)) onUnsubscribeCanopy(ship); }}
              />
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function SectionHeader({ label, open, onToggle, onAdd, addTitle, small }: { label: string; open: boolean; onToggle: () => void; onAdd?: () => void; addTitle?: string; small?: boolean }) {
  return (
    <div className={`${small ? 'mt-2 mb-0.5' : 'mt-5'} px-4 flex items-center justify-between text-xs text-muted uppercase tracking-wider`}>
      <button onClick={onToggle} className="flex items-center gap-1 hover:text-ink">
        <span className="inline-block w-3 text-center">{open ? '▾' : '▸'}</span>
        {small ? <span className="text-[10px]">{label}</span> : label}
      </button>
      {onAdd && (
        <button className="text-muted hover:text-ink text-base leading-none" onClick={onAdd} title={addTitle}>+</button>
      )}
    </div>
  );
}

function SidebarItem({ label, count, active, onClick, color }: { label: string; count: number; active: boolean; onClick: () => void; color?: 'accent' | 'canopy' }) {
  const c = color ?? 'accent';
  const cls = active
    ? c === 'canopy' ? 'bg-canopy-soft text-canopy font-medium' : 'bg-accent-soft text-accent font-medium'
    : 'text-ink hover:bg-bg';
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-1.5 flex items-center justify-between text-sm ${cls}`}
    >
      <span className="truncate">{label}</span>
      <span className="text-xs text-faint ml-2">{count}</span>
    </button>
  );
}

function PeerItem({ ship, active, onClick, onUnsubscribe }: { ship: string; active: boolean; onClick: () => void; onUnsubscribe: () => void }) {
  return (
    <div className={`group flex items-center pr-2 ${active ? 'bg-canopy-soft' : 'hover:bg-bg'}`}>
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className={`truncate font-mono text-xs ${active ? 'text-canopy font-medium' : 'text-ink'}`}>{shortShip(ship)}</span>
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
