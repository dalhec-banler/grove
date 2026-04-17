import { useState } from 'react';
import type { Selection, View, GroveViewListing } from '../types';
import { isGroveDrag, getDragFileIds } from '../dnd';
import { shortShip } from '../format';

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
  onDropOnView: (viewName: string, fileIds: string[]) => void;
  onDropOnCanopy: (fileIds: string[]) => void;
  svPeers: Map<string, GroveViewListing>;
  onUnsubscribeSharedView: (host: string, name: string) => void;
}

export default function Sidebar({
  views, tagCounts, selection, onSelect, onNewView, onEditView, onDeleteView,
  counts, connected, shipName, canopyPeers, onUnsubscribeCanopy,
  onDropOnView, onDropOnCanopy, svPeers, onUnsubscribeSharedView,
}: Props) {
  const [viewsOpen, setViewsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [subsOpen, setSubsOpen] = useState(true);
  // sharedOpen removed – sub-items appear when a shared section is selected
  const [tagFilter, setTagFilter] = useState('');

  const filteredTags = tagCounts.filter(([t]) =>
    !tagFilter || t.toLowerCase().includes(tagFilter.toLowerCase())
  );

  const svList = Array.from(svPeers.entries()).map(([, v]) => v);

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white text-sm font-semibold">G</div>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight">Grove</div>
          <div className="text-[10px] text-faint font-mono truncate leading-tight">{shortShip(shipName)}</div>
        </div>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-faint'}`} title={connected ? 'connected' : 'connecting...'} />
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
            muted
          />

          <SectionHeader
            label="Views"
            open={viewsOpen}
            onToggle={() => setViewsOpen(!viewsOpen)}
            onAdd={onNewView}
            addTitle="New view"
            tooltip="Filtered collections — files matching all selected tags"
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
                  onDrop={(ids) => onDropOnView(v.name, ids)}
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
                      placeholder="Search tags..."
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

          {(() => {
            const isSharedSection = selection.kind === 'inbox' || selection.kind === 'shared-views' || selection.kind === 'shared-view';
            return (
              <div className="mt-4">
                <SidebarItem
                  label="Shared with me"
                  count={counts.inbox + svList.length}
                  active={isSharedSection}
                  onClick={() => onSelect({ kind: 'inbox' })}
                  badge={counts.inboxPending}
                  tooltip="Files and views that others have shared with you"
                />
                {isSharedSection && (
                  <div>
                    <ClickableSectionHeader
                      label="All Files"
                      count={counts.inbox}
                      active={selection.kind === 'inbox'}
                      onClick={() => onSelect({ kind: 'inbox' })}
                      tooltip="Files shared directly with you by other ships"
                    />
                    <ClickableSectionHeader
                      label="Shared Views"
                      count={svList.length}
                      active={selection.kind === 'shared-views' || selection.kind === 'shared-view'}
                      onClick={() => onSelect({ kind: 'shared-views' })}
                      tooltip="Filtered collections shared with you by other ships"
                    />
                    {svList.length > 0 && svList.map((sv) => (
                      <SharedViewSubItem
                        key={`${sv.host}/${sv.name}`}
                        listing={sv}
                        active={selection.kind === 'shared-view' && selection.host === sv.host && selection.name === sv.name}
                        onClick={() => onSelect({ kind: 'shared-view', host: sv.host, name: sv.name })}
                        onUnsubscribe={() => {
                          if (confirm(`Unsubscribe from ${sv.name} on ${sv.host}?`)) onUnsubscribeSharedView(sv.host, sv.name);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="border-t border-border">
          <div className="h-12 flex items-center gap-2 px-4 border-b border-border">
            <div className="w-7 h-7 rounded-md bg-canopy flex items-center justify-center text-white text-sm font-semibold">C</div>
            <div className="font-medium leading-tight text-sm" title="Your public file feed that others can browse and subscribe to">Canopy</div>
          </div>

          <div className="py-2">
            <SidebarItem
              label="My canopy"
              count={counts.canopy}
              active={selection.kind === 'canopy-mine'}
              onClick={() => onSelect({ kind: 'canopy-mine' })}
              tint="canopy"
              onFileDrop={onDropOnCanopy}
              tooltip="Files you've published for others to see"
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

function SectionHeader({ label, open, onToggle, onAdd, addTitle, small, tooltip }: { label: string; open: boolean; onToggle: () => void; onAdd?: () => void; addTitle?: string; small?: boolean; tooltip?: string }) {
  return (
    <div className={`${small ? 'mt-2 mb-0.5' : 'mt-5'} px-4 flex items-center justify-between text-xs text-muted uppercase tracking-wider`}>
      <button onClick={onToggle} className="flex items-center gap-1 hover:text-ink" title={tooltip}>
        <span className="inline-block w-3 text-center">{open ? '▾' : '▸'}</span>
        {small ? <span className="text-[10px]">{label}</span> : label}
      </button>
      {onAdd && (
        <button className="text-muted hover:text-ink text-base leading-none" onClick={onAdd} title={addTitle}>+</button>
      )}
    </div>
  );
}

function ClickableSectionHeader({ label, count, active, onClick, tooltip }: {
  label: string; count: number; active: boolean; onClick: () => void; tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-full px-4 py-1 flex items-center justify-between text-xs uppercase tracking-wider ${
        active ? 'text-accent font-medium' : 'text-muted hover:text-ink'
      }`}
    >
      <span>{label}</span>
      <span className="text-[10px] text-faint normal-case">{count}</span>
    </button>
  );
}

function SidebarItem({ label, count, active, onClick, tint, muted, badge, onFileDrop, tooltip }: {
  label: string; count: number; active: boolean; onClick: () => void;
  tint?: 'accent' | 'canopy'; muted?: boolean; badge?: number; onFileDrop?: (ids: string[]) => void; tooltip?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const c = tint ?? 'accent';

  const cls = dragOver
    ? c === 'canopy' ? 'bg-canopy-soft ring-2 ring-canopy text-canopy font-medium' : 'bg-accent-soft ring-2 ring-accent text-accent font-medium'
    : active
    ? c === 'canopy' ? 'bg-canopy-soft text-canopy font-medium' : 'bg-accent-soft text-accent font-medium'
    : muted ? 'text-muted hover:bg-bg' : 'text-ink hover:bg-bg';

  return (
    <button
      onClick={onClick}
      title={tooltip}
      onDragOver={onFileDrop ? (e) => {
        if (!isGroveDrag(e)) return;
        e.preventDefault();
        e.stopPropagation();
        if (!dragOver) setDragOver(true);
      } : undefined}
      onDragLeave={onFileDrop ? (e) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      } : undefined}
      onDrop={onFileDrop ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const ids = getDragFileIds(e);
        if (ids) onFileDrop(ids);
      } : undefined}
      className={`w-full px-4 py-1.5 flex items-center justify-between text-sm ${cls}`}
    >
      <span className="truncate">{label}</span>
      <span className="flex items-center gap-2 ml-2">
        {badge != null && badge > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white">{badge}</span>
        )}
        <span className="text-xs text-faint">{count}</span>
      </span>
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

function SharedViewSubItem({ listing, active, onClick, onUnsubscribe }: {
  listing: GroveViewListing; active: boolean; onClick: () => void; onUnsubscribe: () => void;
}) {
  return (
    <div className={`group flex items-center pr-2 ${active ? 'bg-accent-soft' : 'hover:bg-bg'}`}>
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: listing.color }} />
        <span className={`truncate text-xs ${active ? 'text-accent font-medium' : 'text-ink'}`}>{listing.name}</span>
        <span className="text-[10px] text-faint font-mono shrink-0">{shortShip(listing.host)}</span>
      </button>
      <button className="hidden group-hover:block text-xs text-muted hover:text-red-600 px-1" onClick={onUnsubscribe} title="Unsubscribe">×</button>
    </div>
  );
}

function ViewItem({ view, active, onClick, onEdit, onDelete, onDrop }: {
  view: View; active: boolean; onClick: () => void;
  onEdit: () => void; onDelete: () => void; onDrop: (fileIds: string[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`group flex items-center pr-2 ${
        dragOver ? 'bg-accent-soft ring-2 ring-accent'
        : active ? 'bg-accent-soft'
        : 'hover:bg-bg'
      }`}
      onDragOver={(e) => {
        if (!isGroveDrag(e)) return;
        e.preventDefault();
        e.stopPropagation();
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const ids = getDragFileIds(e);
        if (ids) onDrop(ids);
      }}
    >
      <button onClick={onClick} className="flex-1 px-4 py-1.5 flex items-center gap-2 text-sm min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: view.color }} />
        <span className={`truncate ${active ? 'text-accent font-medium' : 'text-ink'}`}>{view.name}</span>
        {view.shared && <span className="text-[10px] text-muted shrink-0" title="Shared view">shared</span>}
      </button>
      <div className="hidden group-hover:flex gap-1">
        <button className="text-xs text-muted hover:text-ink px-1" onClick={onEdit} title="Edit">✎</button>
        <button className="text-xs text-muted hover:text-red-600 px-1" onClick={onDelete} title="Delete">×</button>
      </div>
    </div>
  );
}
