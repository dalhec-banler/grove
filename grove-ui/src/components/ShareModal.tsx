import { useState } from 'react';
import type { Share } from '../types';
import Backdrop from './Backdrop';

interface Props {
  share: Share;
  onClose: () => void;
}

export default function ShareModal({ share, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/grove-share/${share.token}`;

  const [copyFailed, setCopyFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="bg-surface rounded-lg shadow-xl w-[480px] p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-medium mb-1">Share link</h2>
        <p className="text-xs text-muted mb-4">Anyone with this link can download <b>{share.name}</b>.</p>
        <div className="flex gap-2 mb-4">
          <input readOnly value={url} className="flex-1 border border-border rounded px-2 py-1.5 text-sm font-mono bg-bg" />
          <button onClick={copy} className={`text-sm px-3 py-1.5 rounded-md text-white ${copyFailed ? 'bg-red-500' : 'bg-accent'}`}>
            {copied ? 'Copied' : copyFailed ? 'Failed — select & copy' : 'Copy'}
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm px-3 py-1.5 text-muted hover:text-ink">Close</button>
        </div>
      </div>
    </Backdrop>
  );
}
