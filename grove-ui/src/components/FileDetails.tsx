import { useState } from 'react';
import type { FileMeta, Share } from '../types';
import { formatBytes, formatDate, normalizeShip, addTag } from '../format';
import { fileUrl } from '../urls';
import Thumb from './Thumb';

interface Props {
  file: FileMeta;
  share: Share | null;
  published: boolean;
  onClose: () => void;
  onRename: (name: string) => void;
  onAddTags: (tags: string[]) => void;
  onRemoveTags: (tags: string[]) => void;
  onShare: () => void;
  onUnshare: (token: string) => void;
  onShowShare: (sh: Share) => void;
  onSetAllowed: (ships: string[], notify: boolean) => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export default function FileDetails({ file, share, published, onClose, onRename, onAddTags, onRemoveTags, onShare, onUnshare, onShowShare, onSetAllowed, onPublish, onUnpublish }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(file.name);
  const [tagDraft, setTagDraft] = useState('');
  const [shipDraft, setShipDraft] = useState('');
  const [shipError, setShipError] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);

  function handleAddTag() {
    const updated = addTag(file.tags, tagDraft);
    if (!updated) return;
    onAddTags([updated[updated.length - 1]]);
    setTagDraft('');
  }

  function addShip() {
    const norm = normalizeShip(shipDraft);
    if (!norm) { setShipError('not a valid @p'); return; }
    if (file.allowed.includes(norm)) { setShipError('already on the list'); return; }
    setShipError(null);
    onSetAllowed([...file.allowed, norm], notify);
    setShipDraft('');
  }

  function removeShip(s: string) {
    onSetAllowed(file.allowed.filter((x) => x !== s), false);
  }

  return (
    <aside className="w-80 shrink-0 border-l border-border bg-surface overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className="text-xs text-muted uppercase tracking-wider">Details</span>
        <button onClick={onClose} className="text-muted hover:text-ink text-sm">×</button>
      </div>

      <div className="p-4 border-b border-border flex items-center gap-3">
        <Thumb mark={file.fileMark} src={fileUrl(file.id)} size="lg" />
        <div className="min-w-0 flex-1">
          {renaming ? (
            <div className="flex gap-1">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { onRename(nameDraft); setRenaming(false); } if (e.key === 'Escape') { setRenaming(false); setNameDraft(file.name); } }}
                className="flex-1 border border-border rounded px-1 py-0.5 text-sm"
              />
              <button onClick={() => { onRename(nameDraft); setRenaming(false); }} className="text-xs text-accent">Save</button>
            </div>
          ) : (
            <>
              <div className="truncate font-medium">{file.name}</div>
              <button onClick={() => { setNameDraft(file.name); setRenaming(true); }} className="text-xs text-muted hover:text-ink">Rename</button>
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-border text-xs text-muted space-y-1">
        <MetadataRow label="Type" value={file.fileMark} />
        <MetadataRow label="Size" value={formatBytes(file.size)} />
        <MetadataRow label="Modified" value={formatDate(file.modified)} />
        <MetadataRow label="Created" value={formatDate(file.created)} />
      </div>

      <div className="p-4 border-b border-border">
        <a
          href={fileUrl(file.id)}
          download={file.name}
          className="block text-center text-sm px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90"
        >
          Download
        </a>
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-2">Tags</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {file.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1">
              {t}
              <button onClick={() => onRemoveTags([t])} className="text-faint hover:text-red-600">×</button>
            </span>
          ))}
          {file.tags.length === 0 && <span className="text-xs text-faint">No tags</span>}
        </div>
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); } }}
          placeholder="Add tag…"
          className="w-full border border-border rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-2">Sharing</div>
        <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!share}
            onChange={(e) => {
              if (e.target.checked) onShare();
              else if (share) onUnshare(share.token);
            }}
          />
          <span>Public link</span>
        </label>
        {share && (
          <div className="space-y-1">
            <button onClick={() => onShowShare(share!)} className="text-xs text-accent hover:underline">
              Copy link
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-2">Canopy</div>
        {published ? (
          <div className="space-y-2">
            <div className="text-xs text-ink flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Published to your canopy
            </div>
            <button
              onClick={() => { if (confirm('Unpublish from canopy?')) onUnpublish(); }}
              className="text-xs text-muted hover:text-red-600"
            >Unpublish</button>
          </div>
        ) : (
          <button
            onClick={onPublish}
            className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-accent"
          >Publish to canopy…</button>
        )}
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-xs text-muted uppercase tracking-wider mb-2">Allowed ships</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {file.allowed.map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1 font-mono">
              {s}
              <button onClick={() => removeShip(s)} className="text-faint hover:text-red-600">×</button>
            </span>
          ))}
          {file.allowed.length === 0 && <span className="text-xs text-faint">No ships granted access</span>}
        </div>
        <input
          value={shipDraft}
          onChange={(e) => { setShipDraft(e.target.value); setShipError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addShip(); } }}
          placeholder="~sampel-palnet"
          className="w-full border border-border rounded px-2 py-1 text-sm font-mono"
        />
        {shipError && <div className="text-xs text-red-600 mt-1">{shipError}</div>}
        <label className="flex items-center gap-2 text-xs text-muted mt-2 cursor-pointer">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span>DM the ship via Tlon when added</span>
        </label>
      </div>
    </aside>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="text-ink truncate">{value}</span>
    </div>
  );
}
