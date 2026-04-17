import Urbit from '@urbit/http-api';
import type {
  FileMeta, View, Share, Update, InboxEntry, Trust,
  CanopyEntry, CanopyConfig, CanopyListing, CanopyMode, GroupInfo,
  GroveAction, CanopySearchHit, GroveViewListing, GroupFlag,
  RawFileMeta, RawInboxEntry, RawCanopyEntry, RawCanopyConfig, RawCanopyListing,
  RawView, RawShare, RawCanopySearchHit, RawGroupInfo, RawGroveViewListing,
} from './types';

declare global {
  interface Window { ship?: string }
}

const CANOPY_MODES: readonly CanopyMode[] = ['open', 'friends', 'group'];
function isCanopyMode(v: unknown): v is CanopyMode {
  return typeof v === 'string' && (CANOPY_MODES as readonly string[]).includes(v);
}
function parseCanopyMode(v: unknown): CanopyMode {
  return isCanopyMode(v) ? v : 'open';
}

// Error notification emitter — decouples API from browser UI (no alert())
type ErrorHandler = (msg: string) => void;
let _onError: ErrorHandler = (msg) => console.error('[grove]', msg);
export function setErrorHandler(handler: ErrorHandler) { _onError = handler; }
export function notifyError(msg: string) { _onError(msg); }

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

export function fileFromJson(o: RawFileMeta): FileMeta {
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
  return (Array.isArray(raw) ? raw : []).map((r) => fileFromJson(r as RawFileMeta));
}

export async function scryViews(): Promise<View[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/views' });
  return (Array.isArray(raw) ? raw : []).map((v) => {
    const r = v as RawView;
    const view: View = { name: r.name, tags: r.tags ?? [], color: r.color };
    if (r.shared && typeof r.shared === 'object') {
      const s = r.shared as { allowed?: string[]; 'group-flag'?: { host: string; name: string } | null };
      view.shared = {
        allowed: s.allowed ?? [],
        groupFlag: s['group-flag'] && s['group-flag'].host
          ? { host: s['group-flag'].host, name: s['group-flag'].name }
          : null,
      };
    }
    return view;
  });
}

export async function scryShares(): Promise<Share[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/shares' });
  return (Array.isArray(raw) ? raw : []).map((s) => {
    const r = s as RawShare;
    return { token: r.token, fileId: r['file-id'], name: r.name };
  });
}

// Accepts both kebab-case (scry) and camelCase (subscription) field names.
export function entryFromJson(o: RawInboxEntry): InboxEntry {
  return {
    owner: o.owner,
    fileId: o['file-id'] ?? o.fileId ?? '',
    name: o.name,
    fileMark: o.fileMark ?? o['file-mark'] ?? '',
    size: o.size,
    offered: o.offered,
    accepted: !!o.accepted,
    cached: !!o.cached,
  };
}

export async function scryInbox(): Promise<InboxEntry[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/inbox' });
  return (Array.isArray(raw) ? raw : []).map((r) => entryFromJson(r as RawInboxEntry));
}

export async function scryTrusted(): Promise<Trust> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/trusted' }) as Record<string, unknown>;
  const t = raw as { trusted?: string[]; blocked?: string[] };
  return { trusted: t.trusted ?? [], blocked: t.blocked ?? [] };
}

// Accepts both kebab-case (scry) and camelCase (subscription) field names.
export function canopyEntryFromJson(o: RawCanopyEntry): CanopyEntry {
  return {
    id: o.id,
    displayName: o.displayName ?? o['display-name'] ?? o.name ?? '',
    fileMark: o.fileMark ?? o['file-mark'] ?? '',
    size: o.size,
    tags: o.tags ?? [],
    published: o.published,
    description: o.description ?? '',
  };
}

function canopyConfigFromJson(o: RawCanopyConfig): CanopyConfig {
  return {
    mode: parseCanopyMode(o.mode),
    name: o.name ?? '',
    friends: o.friends ?? [],
    groupFlag: o['group-flag'] && o['group-flag'].host
      ? { host: o['group-flag'].host, name: o['group-flag'].name }
      : null,
  };
}

function canopyListingFromJson(o: RawCanopyListing): CanopyListing {
  return {
    host: o.host,
    name: o.name ?? '',
    mode: parseCanopyMode(o.mode),
    entries: (o.entries ?? []).map(canopyEntryFromJson),
  };
}

export async function scryCanopyEntries(): Promise<CanopyEntry[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/canopy/entries' });
  return (Array.isArray(raw) ? raw : []).map((r) => canopyEntryFromJson(r as RawCanopyEntry));
}

export async function scryCanopyConfig(): Promise<CanopyConfig> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/canopy/config' });
  return canopyConfigFromJson((raw ?? {}) as RawCanopyConfig);
}

export async function scryCanopyPeers(): Promise<CanopyListing[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/canopy/peers' });
  return (Array.isArray(raw) ? raw : []).map((r) => canopyListingFromJson(r as RawCanopyListing));
}

/** Returns null on 404 — peer may not have canopy or may be unreachable. */
export async function scryCanopyPeer(ship: string): Promise<CanopyListing | null> {
  const s = ship.startsWith('~') ? ship.slice(1) : ship;
  try {
    const raw = await getApi().scry<unknown>({ app: 'grove', path: `/canopy/peer/~${s}` });
    if (!raw) return null;
    return canopyListingFromJson(raw as RawCanopyListing);
  } catch (e: any) {
    if (e?.status === 404 || e?.message?.includes('404')) return null;
    throw e;
  }
}

export async function scryCanopySearch(term: string): Promise<CanopySearchHit[]> {
  const t = term.trim();
  if (!t) return [];
  const raw = await getApi().scry<unknown>({ app: 'grove', path: `/canopy/search/${encodeURIComponent(t)}` });
  return (Array.isArray(raw) ? raw : []).map((h) => {
    const r = h as RawCanopySearchHit;
    return { host: r.host, entry: canopyEntryFromJson(r.entry) };
  });
}

/** Returns [] on 404 — groups app may not be installed. */
export async function scryGroups(): Promise<GroupInfo[]> {
  try {
    const raw = await getApi().scry<unknown>({ app: 'grove', path: '/canopy/groups' });
    return (Array.isArray(raw) ? raw : []).map((g) => {
      const r = g as RawGroupInfo;
      return { host: r.host, name: r.name, title: r.title ?? '', members: r.members ?? 0 };
    });
  } catch (e: any) {
    if (e?.status === 404 || e?.message?.includes('404')) return [];
    throw e;
  }
}

function gvlFromJson(o: RawGroveViewListing): GroveViewListing {
  return {
    host: o.host,
    name: o.name ?? '',
    tags: o.tags ?? [],
    color: o.color ?? '',
    files: (o.files ?? []).map((r) => fileFromJson(r as RawFileMeta)),
  };
}

function parseGroupFlag(o: unknown): GroupFlag | null {
  if (!o || typeof o !== 'object') return null;
  const gf = o as { host?: string; name?: string };
  if (!gf.host) return null;
  return { host: gf.host, name: gf.name ?? '' };
}

export async function scrySharedViewPeers(): Promise<GroveViewListing[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/shared-view-peers' });
  return (Array.isArray(raw) ? raw : []).map((r) => gvlFromJson(r as RawGroveViewListing));
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

export function pokeSafe(action: GroveAction): Promise<void> {
  return poke(action).catch((e) => {
    console.error('poke failed', action, e);
    notifyError(`Action failed: ${(e as Error).message}`);
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
    case 'viewShared':
      return {
        type: 'viewShared',
        name: data.name,
        allowed: data.allowed ?? [],
        groupFlag: parseGroupFlag(data.groupFlag ?? data['group-flag']),
      };
    case 'viewUnshared':
      return { type: 'viewUnshared', name: data.name };
    case 'sharedViewUpdated':
      return { type: 'sharedViewUpdated', listing: gvlFromJson(data.listing) };
    case 'sharedViewRemoved':
      return { type: 'sharedViewRemoved', host: data.host, name: data.name };
  }
  console.warn('[normalizeUpdate] unrecognized update type:', data.type);
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

