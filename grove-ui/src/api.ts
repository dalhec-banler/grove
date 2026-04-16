import Urbit from '@urbit/http-api';
import type {
  FileMeta, View, Share, Update, InboxEntry, Trust,
  CanopyEntry, CanopyConfig, CanopyListing, CanopyMode, GroupInfo,
} from './types';

declare global {
  interface Window { ship: string }
}

const api = new Urbit('', '', 'grove');
api.ship = (window.ship ?? '').replace(/^~/, '');
api.onError = (err) => console.error('[urbit]', err);
api.onRetry = () => console.warn('[urbit] retrying');
api.onOpen = () => console.log('[urbit] connected');

export default api;

function fileFromJson(o: any): FileMeta {
  return {
    id: o.id,
    name: o.name,
    fileMark: o['file-mark'],
    size: o.size,
    tags: o.tags ?? [],
    created: o.created,
    modified: o.modified,
    description: o.description ?? '',
    starred: !!o.starred,
    allowed: o.allowed ?? [],
  };
}

export async function scryFiles(): Promise<FileMeta[]> {
  const raw = await api.scry<any[]>({ app: 'grove', path: '/files' });
  return (raw ?? []).map(fileFromJson);
}

export async function scryViews(): Promise<View[]> {
  const raw = await api.scry<any[]>({ app: 'grove', path: '/views' });
  return (raw ?? []).map((v) => ({ name: v.name, tags: v.tags ?? [], color: v.color }));
}

export async function scryShares(): Promise<Share[]> {
  const raw = await api.scry<any[]>({ app: 'grove', path: '/shares' });
  return (raw ?? []).map((s) => ({ token: s.token, fileId: s['file-id'], name: s.name }));
}

function entryFromJson(o: any): InboxEntry {
  return {
    owner: o.owner,
    fileId: o['file-id'] ?? o.fileId,
    name: o.name,
    fileMark: o.fileMark ?? o['file-mark'],
    size: o.size,
    offered: o.offered,
    accepted: !!o.accepted,
    cached: !!o.cached,
  };
}

export async function scryInbox(): Promise<InboxEntry[]> {
  const raw = await api.scry<any[]>({ app: 'grove', path: '/inbox' });
  return (raw ?? []).map(entryFromJson);
}

export async function scryTrusted(): Promise<Trust> {
  const raw = await api.scry<any>({ app: 'grove', path: '/trusted' });
  return { trusted: raw?.trusted ?? [], blocked: raw?.blocked ?? [] };
}

function canopyEntryFromJson(o: any): CanopyEntry {
  return {
    id: o.id,
    displayName: o.displayName ?? o['display-name'] ?? o.name ?? '',
    fileMark: o.fileMark ?? o['file-mark'],
    size: o.size,
    tags: o.tags ?? [],
    published: o.published,
    description: o.description ?? '',
  };
}

function canopyConfigFromJson(o: any): CanopyConfig {
  return {
    mode: (o.mode as CanopyMode) ?? 'open',
    name: o.name ?? '',
    friends: o.friends ?? [],
    groupFlag: o['group-flag'] && o['group-flag'].host
      ? { host: o['group-flag'].host, name: o['group-flag'].name }
      : null,
  };
}

function canopyListingFromJson(o: any): CanopyListing {
  return {
    host: o.host,
    name: o.name ?? '',
    mode: (o.mode as CanopyMode) ?? 'open',
    entries: (o.entries ?? []).map(canopyEntryFromJson),
  };
}

export async function scryCanopyEntries(): Promise<CanopyEntry[]> {
  const raw = await api.scry<any[]>({ app: 'grove', path: '/canopy/entries' });
  return (raw ?? []).map(canopyEntryFromJson);
}

export async function scryCanopyConfig(): Promise<CanopyConfig> {
  const raw = await api.scry<any>({ app: 'grove', path: '/canopy/config' });
  return canopyConfigFromJson(raw ?? {});
}

export async function scryCanopyPeers(): Promise<CanopyListing[]> {
  const raw = await api.scry<any[]>({ app: 'grove', path: '/canopy/peers' });
  return (raw ?? []).map(canopyListingFromJson);
}

export async function scryCanopyPeer(ship: string): Promise<CanopyListing | null> {
  const s = ship.startsWith('~') ? ship.slice(1) : ship;
  try {
    const raw = await api.scry<any>({ app: 'grove', path: `/canopy/peer/~${s}` });
    if (!raw) return null;
    return canopyListingFromJson(raw);
  } catch (_e) {
    return null;
  }
}

export interface CanopySearchHit {
  host: string;
  entry: CanopyEntry;
}

export async function scryCanopySearch(term: string): Promise<CanopySearchHit[]> {
  const t = term.trim();
  if (!t) return [];
  const raw = await api.scry<any[]>({ app: 'grove', path: `/canopy/search/${encodeURIComponent(t)}` });
  return (raw ?? []).map((h: any) => ({ host: h.host, entry: canopyEntryFromJson(h.entry) }));
}

export async function scryGroups(): Promise<GroupInfo[]> {
  try {
    const raw = await api.scry<any[]>({ app: 'grove', path: '/canopy/groups' });
    return (raw ?? []).map((g: any) => ({
      host: g.host,
      name: g.name,
      title: g.title ?? '',
      members: g.members ?? 0,
    }));
  } catch (_e) {
    return [];
  }
}

export function remoteFileUrl(owner: string, id: string): string {
  const o = owner.startsWith('~') ? owner.slice(1) : owner;
  return `/grove-remote-file/~${o}/${id}`;
}

export function poke(action: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    api.poke({
      app: 'grove',
      mark: 'grove-action',
      json: action,
      onSuccess: () => resolve(),
      onError: (err) => reject(new Error(typeof err === 'string' ? err : JSON.stringify(err))),
    });
  });
}

export function subscribeUpdates(
  onEvent: (u: Update) => void,
  onQuit?: () => void,
): Promise<number> {
  const doSub = (): Promise<number> =>
    api.subscribe({
      app: 'grove',
      path: '/updates',
      event: (data: any) => {
        const norm = normalizeUpdate(data);
        if (norm) onEvent(norm);
      },
      err: (e) => console.error('[sub err]', e),
      quit: () => {
        console.warn('[sub quit] reconnecting in 2s…');
        setTimeout(() => {
          doSub().catch((e) => console.error('[sub reconnect]', e));
          if (onQuit) onQuit();
        }, 2000);
      },
    });
  return doSub();
}

function normalizeUpdate(data: any): Update | null {
  if (!data || !data.type) return null;
  switch (data.type) {
    case 'fileAdded':
    case 'fileUpdated':
      return {
        type: data.type,
        fileId: data.fileId,
        name: data.name,
        fileMark: data.fileMark,
        size: data.size,
        tags: data.tags ?? [],
        created: data.created,
        modified: data.modified,
        description: data.description ?? '',
        starred: !!data.starred,
      };
    case 'allowedUpdated':
      return { type: 'allowedUpdated', fileId: data.fileId, ships: data.ships ?? [] };
    case 'fileRemoved':
      return { type: 'fileRemoved', fileId: data.fileId };
    case 'viewAdded':
      return { type: 'viewAdded', name: data.name, tags: data.tags ?? [], color: data.color };
    case 'viewRemoved':
      return { type: 'viewRemoved', name: data.name };
    case 'shareAdded':
      return { type: 'shareAdded', token: data.token, fileId: data.fileId };
    case 'shareRemoved':
      return { type: 'shareRemoved', token: data.token };
    case 'inboxAdded':
      return { type: 'inboxAdded', entry: entryFromJson(data.entry) };
    case 'inboxUpdated':
      return { type: 'inboxUpdated', entry: entryFromJson(data.entry) };
    case 'inboxRemoved':
      return { type: 'inboxRemoved', owner: data.owner, fileId: data.fileId };
    case 'trustedUpdated':
      return { type: 'trustedUpdated', trusted: data.trusted ?? [], blocked: data.blocked ?? [] };
    case 'cacheUpdated':
      return { type: 'cacheUpdated', owner: data.owner, meta: fileFromJson(data.meta) };
    case 'cacheRemoved':
      return { type: 'cacheRemoved', owner: data.owner, fileId: data.fileId };
    case 'canopyEntryAdded':
      return { type: 'canopyEntryAdded', entry: canopyEntryFromJson(data.entry) };
    case 'canopyEntryRemoved':
      return { type: 'canopyEntryRemoved', fileId: data.fileId };
    case 'canopyConfigUpdated':
      return { type: 'canopyConfigUpdated', config: canopyConfigFromJson(data.config) };
    case 'canopyPeerUpdated':
      return { type: 'canopyPeerUpdated', listing: canopyListingFromJson(data.listing) };
    case 'canopyPeerRemoved':
      return { type: 'canopyPeerRemoved', host: data.host };
  }
  return null;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const comma = s.indexOf(',');
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function inferMark(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (!ext) return 'bin';
  return ext;
}

export function fileUrl(id: string): string {
  return `/grove-file/${id}`;
}

