import { useState } from 'react';
import type { View, GroupInfo, SharedViewConfig } from '../types';
import { addTag } from '../format';
import Backdrop from './Backdrop';

interface Props {
  initial: View | null;
  allTags: string[];
  groups: GroupInfo[];
  onClose: () => void;
  onSave: (name: string, tags: string[], color: string, shared: SharedViewConfig | null) => void;
}

const PALETTE = ['#3A6BC5', '#D97706', '#059669', '#DC2626', '#7C3AED', '#DB2777', '#0EA5E9', '#65A30D'];

export default function ViewModal({ initial, allTags, groups, onClose, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);

  const [sharingEnabled, setSharingEnabled] = useState(!!initial?.shared);
  const [allowedInput, setAllowedInput] = useState('');
  const [allowedShips, setAllowedShips] = useState<string[]>(initial?.shared?.allowed ?? []);
  const [selectedGroup, setSelectedGroup] = useState<string>(
    initial?.shared?.groupFlag ? `${initial.shared.groupFlag.host}/${initial.shared.groupFlag.name}` : ''
  );

  function handleAddTag(t: string) {
    const updated = addTag(tags, t);
    if (!updated) return;
    setTags(updated);
    setTagInput('');
  }

  function handleAddShip() {
    const ship = allowedInput.trim();
    if (!ship || allowedShips.includes(ship)) return;
    setAllowedShips([...allowedShips, ship]);
    setAllowedInput('');
  }

  const disabled = !name.trim() || tags.length === 0;

  function handleSave() {
    let shared: SharedViewConfig | null = null;
    if (sharingEnabled) {
      let groupFlag = null;
      if (selectedGroup) {
        const idx = selectedGroup.indexOf('/');
        if (idx > 0) {
          groupFlag = { host: selectedGroup.slice(0, idx), name: selectedGroup.slice(idx + 1) };
        }
      }
      shared = { allowed: allowedShips, groupFlag };
    }
    onSave(name.trim(), tags, color, shared);
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-[420px] p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-medium mb-4">{initial ? 'Edit view' : 'New view'}</h2>
        <label className="block text-xs text-muted mb-1">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!!initial}
          placeholder="photos"
          className="w-full border border-border rounded px-2 py-1.5 text-sm mb-3 disabled:bg-bg"
        />
        <label className="block text-xs text-muted mb-1">Tags (files must have all)</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded bg-accent-soft text-accent flex items-center gap-1">
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-ink">×</button>
            </span>
          ))}
        </div>
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(tagInput); }
          }}
          placeholder="type a tag and press Enter"
          className="w-full border border-border rounded px-2 py-1.5 text-sm mb-2"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {allTags.filter((t) => !tags.includes(t)).map((t) => (
              <button key={t} onClick={() => handleAddTag(t)} className="text-xs px-1.5 py-0.5 rounded border border-border text-muted hover:bg-bg">
                + {t}
              </button>
            ))}
          </div>
        )}
        <label className="block text-xs text-muted mb-1">Color</label>
        <div className="flex gap-2 mb-4">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-ink' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="border-t border-border pt-3 mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={sharingEnabled}
              onChange={(e) => setSharingEnabled(e.target.checked)}
              className="accent-accent"
            />
            Share this view
          </label>
          {sharingEnabled && (
            <div className="mt-3 space-y-3 pl-1">
              <div>
                <label className="block text-xs text-muted mb-1">Allowed ships</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {allowedShips.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-accent-soft text-accent flex items-center gap-1 font-mono">
                      {s}
                      <button onClick={() => setAllowedShips(allowedShips.filter((x) => x !== s))} className="hover:text-ink">×</button>
                    </span>
                  ))}
                  {allowedShips.length === 0 && <span className="text-xs text-faint">None yet</span>}
                </div>
                <input
                  value={allowedInput}
                  onChange={(e) => setAllowedInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddShip(); } }}
                  placeholder="~sampel-palnet"
                  className="w-full border border-border rounded px-2 py-1 text-sm font-mono"
                />
              </div>
              {groups.length > 0 && (
                <div>
                  <label className="block text-xs text-muted mb-1">Or share with a group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full border border-border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">No group</option>
                    {groups.map((g) => (
                      <option key={`${g.host}/${g.name}`} value={`${g.host}/${g.name}`}>
                        {g.title || g.name} ({g.members} members)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <p className="text-xs text-faint">
                Allowed ships and group members can subscribe to see files matching this view.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-muted hover:text-ink">Cancel</button>
          <button
            onClick={handleSave}
            disabled={disabled}
            className="text-sm px-3 py-1.5 rounded-md bg-accent text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </Backdrop>
  );
}
