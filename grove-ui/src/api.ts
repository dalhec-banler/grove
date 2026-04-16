import Urbit from '@urbit/http-api';
import type {
  FileMeta, View, Share, Update, InboxEntry, Trust,
  CanopyEntry, CanopyConfig, CanopyListing, CanopyMode, GroupInfo,
  GroveAction, CanopySearchHit,
} from './types';

declare global {
  interface Window { ship?: string }
}

const CANOPY_MODES: Set<string> = new Set(['open', 'friends', 'group']);
function parseCanopyMode(v: unknown): CanopyMode {
  return typeof v === 'string' && CANOPY_MODES.has(v) ? v as CanopyMode : 'open';
}

let _api: Urbit | null = null;

function getApi(): Urbit {
  if (!_api) {
    _api = new Urbit('', '', 'grove');
    _api.ship = (window.ship ?? '').replace(/^~/, '');
    _api.onError = (err) => console.error('[urbit]', err);
    _api.onRetry = () => console.warn('[urbit] retrying');
    _api.onOpen = () => console.log('[urbit] connected');
  }
  return _api;
}

export { getApi };

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
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/files' });
  return (Array.isArray(raw) ? raw : []).map(fileFromJson);
}

export async function scryViews(): Promise<View[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/views' });
  return (Array.isArray(raw) ? raw : []).map((v: any) => ({ name: v.name, tags: v.tags ?? [], color: v.color }));
}

export async function scryShares(): Promise<Share[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/shares' });
  return (Array.isArray(raw) ? raw : []).map((s: any) => ({ token: s.token, fileId: s['file-id'], name: s.name }));
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
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/inbox' });
  return (Array.isArray(raw) ? raw : []).map(entryFromJson);
}

export async function scryTrusted(): Promise<Trust> {
  const raw = await getApi().scry<any>({ app: 'grove', path: '/trusted' });
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
    mode: parseCanopyMode(o.mode),
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
    mode: parseCanopyMode(o.mode),
    entries: (o.entries ?? []).map(canopyEntryFromJson),
  };
}

export async function scryCanopyEntries(): Promise<CanopyEntry[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/canopy/entries' });
  return (Array.isArray(raw) ? raw : []).map(canopyEntryFromJson);
}

export async function scryCanopyConfig(): Promise<CanopyConfig> {
  const raw = await getApi().scry<any>({ app: 'grove', path: '/canopy/config' });
  return canopyConfigFromJson(raw ?? {});
}

export async function scryCanopyPeers(): Promise<CanopyListing[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/canopy/peers' });
  return (Array.isArray(raw) ? raw : []).map(canopyListingFromJson);
}

export async function scryCanopyPeer(ship: string): Promise<CanopyListing | null> {
  const s = ship.startsWith('~') ? ship.slice(1) : ship;
  try {
    const raw = await getApi().scry<any>({ app: 'grove', path: `/canopy/peer/~${s}` });
    if (!raw) return null;
    return canopyListingFromJson(raw);
  } catch (e: any) {
    if (e?.status === 404 || e?.message?.includes('404')) return null;
    console.error(`[scryCanopyPeer] ${ship}:`, e);
    return null;
  }
}

export async function scryCanopySearch(term: string): Promise<CanopySearchHit[]> {
  const t = term.trim();
  if (!t) return [];
  const raw = await getApi().scry<any[]>({ app: 'grove', path: `/canopy/search/${encodeURIComponent(t)}` });
  return (raw ?? []).map((h: any) => ({ host: h.host, entry: canopyEntryFromJson(h.entry) }));
}

export async function scryGroups(): Promise<GroupInfo[]> {
  try {
    const raw = await getApi().scry<any[]>({ app: 'grove', path: '/canopy/groups' });
    return (raw ?? []).map((g: any) => ({
      host: g.host,
      name: g.name,
      title: g.title ?? '',
      members: g.members ?? 0,
    }));
  } catch (e: any) {
    if (e?.status === 404 || e?.message?.includes('404')) return [];
    console.error('[scryGroups]', e);
    return [];
  }
}

export function poke(action: GroveAction): Promise<void> {
  return new Promise((resolve, reject) => {
    getApi().poke({
      app: 'grove',
      mark: 'grove-action',
      json: action,
      onSuccess: () => resolve(),
      onError: (err) => reject(new Error(typeof err === 'string' ? err : JSON.stringify(err))),
    });
  });
}

export function pokeSafe(action: GroveAction): void {
  poke(action).catch((e) => {
    console.error('poke failed', action, e);
    alert(`Action failed: ${(e as Error).message}`);
  });
}

export interface SubscriptionHandle {
  id: Promise<number>;
  cancel: () => void;
}

export function subscribeUpdates(
  onEvent: (u: Update) => void,
  opts?: { onQuit?: () => void; onError?: (e: unknown) => void },
): SubscriptionHandle {
  let cancelled = false;
  let latestSubId: number | undefined;

  const openSubscription = (): Promise<number> =>
    getApi().subscribe({
      app: 'grove',
      path: '/updates',
      event: (data: any) => {
        const norm = normalizeUpdate(data);
        if (norm) onEvent(norm);
      },
      err: (e) => {
        console.error('[sub err]', e);
        opts?.onError?.(e);
      },
      quit: () => {
        if (cancelled) return;
        console.warn('[sub quit] reconnecting in 2s…');
        setTimeout(() => {
          if (cancelled) return;
          openSubscription()
            .then((id) => { latestSubId = id; })
            .catch((e) => console.error('[sub reconnect]', e));
          opts?.onQuit?.();
        }, 2000);
      },
    });

  const id = openSubscription().then((subId) => { latestSubId = subId; return subId; });

  return {
    id,
    cancel() {
      cancelled = true;
      if (latestSubId !== undefined) {
        getApi().unsubscribe(latestSubId);
      } else {
        id.then((subId) => getApi().unsubscribe(subId)).catch(() => {});
      }
    },
  };
}

function normalizeFileMeta(type: 'fileAdded' | 'fileUpdated', data: any) {
  return {
    type, fileId: data.fileId, name: data.name, fileMark: data.fileMark,
    size: data.size, tags: data.tags ?? [], created: data.created,
    modified: data.modified, description: data.description ?? '', starred: !!data.starred,
  };
}

export function normalizeUpdate(data: any): Update | null {
  if (!data || !data.type) return null;
  switch (data.type) {
    case 'fileAdded':
    case 'fileUpdated':
      return normalizeFileMeta(data.type, data);
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
    case 'inboxUpdated':
      return { type: data.type, entry: entryFromJson(data.entry) };
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
    r.onerror = () => reject(new Error(r.error?.message ?? 'FileReader error'));
    r.readAsDataURL(file);
  });
}

