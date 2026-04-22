import Urbit from '@urbit/http-api';
import type {
  FileMeta, View, Share, Update, InboxEntry, Trust,
  CanopyEntry, CatalogConfig, CatalogListing, CatalogMode, GroupInfo,
  GroveAction, CatalogSearchHit, Catalog, CatalogSub, GroupFlag,
  RawFileMeta, RawInboxEntry, RawCanopyEntry, RawCatalogConfig, RawCatalogListing,
  RawView, RawShare, RawCatalogSearchHit, RawGroupInfo,
} from './types';

declare global {
  interface Window { ship?: string }
}

const CATALOG_MODES: readonly CatalogMode[] = ['public', 'pals', 'group'];
function isCatalogMode(v: unknown): v is CatalogMode {
  return typeof v === 'string' && (CATALOG_MODES as readonly string[]).includes(v);
}
function parseCatalogMode(v: unknown): CatalogMode {
  return isCatalogMode(v) ? v : 'public';
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
    fileMark: o['file-mark'] ?? o.fileMark ?? '',
    size: o.size,
    tags: o.tags ?? [],
    created: o.created,
    modified: o.modified,
    description: o.description ?? '',
    starred: !!o.starred,
    allowed: o.allowed ?? [],
    inCatalogs: o.inCatalogs ?? [],
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
    return { name: r.name, tags: r.tags ?? [], color: r.color };
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

function catalogConfigFromJson(o: RawCatalogConfig): CatalogConfig {
  return {
    name: o.name ?? '',
    description: o.description ?? '',
    mode: parseCatalogMode(o.mode),
    friends: o.friends ?? [],
    groupFlag: o['group-flag'] && o['group-flag'].host
      ? { host: o['group-flag'].host, name: o['group-flag'].name }
      : null,
    files: o.files ?? [],
    created: o.created ?? '',
    modified: o.modified ?? '',
  };
}

function catalogListingFromJson(o: RawCatalogListing): CatalogListing {
  return {
    host: o.host,
    catalogId: o.catalogId ?? o['catalog-id'] ?? '',
    name: o.name ?? '',
    description: o.description ?? '',
    mode: parseCatalogMode(o.mode),
    entries: (o.entries ?? []).map(canopyEntryFromJson),
  };
}

export async function scryCatalogs(): Promise<Catalog[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/catalogs' });
  return (Array.isArray(raw) ? raw : []).map((r) => {
    const o = r as { catalogId?: string; config?: RawCatalogConfig };
    return {
      catalogId: o.catalogId ?? '',
      config: catalogConfigFromJson((o.config ?? {}) as RawCatalogConfig),
    };
  });
}

export async function scryCatalogConfig(catalogId: string): Promise<CatalogConfig | null> {
  try {
    const raw = await getApi().scry<unknown>({ app: 'grove', path: `/catalog/${catalogId}/config` });
    if (!raw) return null;
    return catalogConfigFromJson(raw as RawCatalogConfig);
  } catch { return null; }
}

export async function scryCatalogEntries(catalogId: string): Promise<CanopyEntry[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: `/catalog/${catalogId}/entries` });
  return (Array.isArray(raw) ? raw : []).map((r) => canopyEntryFromJson(r as RawCanopyEntry));
}

export async function scryCatalogPeers(): Promise<CatalogListing[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/catalog-peers' });
  return (Array.isArray(raw) ? raw : []).map((r) => catalogListingFromJson(r as RawCatalogListing));
}

export async function scryCatalogSubs(): Promise<CatalogSub[]> {
  const raw = await getApi().scry<unknown>({ app: 'grove', path: '/catalog-subs' });
  return (Array.isArray(raw) ? raw : []).map((r) => {
    const o = r as { host?: string; catalogId?: string };
    return { host: o.host ?? '', catalogId: o.catalogId ?? '' };
  });
}

export async function scryCatalogSearch(term: string): Promise<CatalogSearchHit[]> {
  const t = term.trim();
  if (!t) return [];
  const raw = await getApi().scry<unknown>({ app: 'grove', path: `/catalog/search/${encodeURIComponent(t)}` });
  return (Array.isArray(raw) ? raw : []).map((h) => {
    const r = h as RawCatalogSearchHit;
    return {
      host: r.host,
      catalogId: r.catalogId ?? r['catalog-id'] ?? '',
      catalogName: r.catalogName ?? r['catalog-name'] ?? '',
      entry: canopyEntryFromJson(r.entry),
    };
  });
}

/** Returns [] on 404 — groups app may not be installed. */
export async function scryGroups(): Promise<GroupInfo[]> {
  try {
    const raw = await getApi().scry<unknown>({ app: 'grove', path: '/catalog/groups' });
    return (Array.isArray(raw) ? raw : []).map((g) => {
      const r = g as RawGroupInfo;
      return { host: r.host, name: r.name, title: r.title ?? '', members: r.members ?? 0 };
    });
  } catch (e: any) {
    if (e?.status === 404 || e?.message?.includes('404')) return [];
    throw e;
  }
}

function parseGroupFlag(o: unknown): GroupFlag | null {
  if (!o || typeof o !== 'object') return null;
  const gf = o as { host?: string; name?: string };
  if (!gf.host) return null;
  return { host: gf.host, name: gf.name ?? '' };
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
    case 'catalogCreated':
      return { type: 'catalogCreated', catalogId: data.catalogId, config: catalogConfigFromJson(data.config) };
    case 'catalogDeleted':
      return { type: 'catalogDeleted', catalogId: data.catalogId };
    case 'catalogUpdated':
      return { type: 'catalogUpdated', catalogId: data.catalogId, config: catalogConfigFromJson(data.config) };
    case 'catalogFileAdded':
      return { type: 'catalogFileAdded', catalogId: data.catalogId, fileId: data.fileId };
    case 'catalogFileRemoved':
      return { type: 'catalogFileRemoved', catalogId: data.catalogId, fileId: data.fileId };
    case 'catalogPeerUpdated':
      return { type: 'catalogPeerUpdated', listing: catalogListingFromJson(data.listing) };
    case 'catalogPeerRemoved':
      return { type: 'catalogPeerRemoved', host: data.host, catalogId: data.catalogId };
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
