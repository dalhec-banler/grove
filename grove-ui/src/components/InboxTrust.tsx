import { useState } from 'react';
import { normalizeShip } from '../format';
import ShipChip from './ShipChip';

export default function TrustList({ trusted, blocked, onUntrust, onUnblock, onTrust, onBlock }: {
  trusted: Set<string>; blocked: Set<string>;
  onUntrust: (s: string) => void; onUnblock: (s: string) => void;
  onTrust: (s: string) => void; onBlock: (s: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'trust' | 'block'>('trust');

  function addShip() {
    const norm = normalizeShip(draft);
    if (!norm) return;
    if (mode === 'trust') onTrust(norm);
    else onBlock(norm);
    setDraft('');
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-muted mb-1">Trusted (offers auto-accept)</div>
        <div className="flex flex-wrap gap-1">
          {Array.from(trusted).sort((a, b) => a.localeCompare(b)).map((s) => (
            <ShipChip key={s} ship={s} onRemove={() => onUntrust(s)} />
          ))}
          {trusted.size === 0 && <span className="text-xs text-faint">No trusted ships</span>}
        </div>
      </div>
      <div>
        <div className="text-xs text-muted mb-1">Blocked (offers dropped silently)</div>
        <div className="flex flex-wrap gap-1">
          {Array.from(blocked).sort((a, b) => a.localeCompare(b)).map((s) => (
            <ShipChip key={s} ship={s} onRemove={() => onUnblock(s)} />
          ))}
          {blocked.size === 0 && <span className="text-xs text-faint">No blocked ships</span>}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <select value={mode} onChange={(e) => setMode(e.target.value as 'trust' | 'block')} className="text-xs border border-border rounded px-1 py-1">
          <option value="trust">Trust</option>
          <option value="block">Block</option>
        </select>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addShip(); } }}
          placeholder="~sampel-palnet"
          className="flex-1 border border-border rounded px-2 py-1 text-sm font-mono"
        />
        <button onClick={addShip} className="text-xs px-2 py-1 rounded bg-accent text-white">Add</button>
      </div>
    </div>
  );
}
