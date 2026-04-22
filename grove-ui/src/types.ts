export type FileId = string;
export type ShareToken = string;

export interface FileMeta {
  id: FileId;
  name: string;
  fileMark: string;
  size: number;
  tags: string[];
  created: string;
  modified: string;
  description: string;
  starred: boolean;
  allowed: string[];
  inCatalogs: string[];
}

export interface View {
  name: string;
  tags: string[];
  color: string;
}

export interface Share {
  token: ShareToken;
  fileId: FileId;
  name: string;
}

export interface InboxEntry {
  owner: string;
  fileId: FileId;
  name: string;
  fileMark: string;
  size: number;
  offered: string;
  accepted: boolean;
  cached: boolean;
}

export interface Trust {
  trusted: string[];
  blocked: string[];
}

export type CatalogMode = 'public' | 'pals' | 'group';

export interface CanopyEntry {
  id: FileId;
  displayName: string;
  fileMark: string;
  size: number;
  tags: string[];
  published: string;
  description: string;
}

export interface GroupFlag {
  host: string;
  name: string;
}

export interface GroupInfo {
  host: string;
  name: string;
  title: string;
  members: number;
}

export interface CatalogConfig {
  name: string;
  description: string;
  mode: CatalogMode;
  friends: string[];
  groupFlag: GroupFlag | null;
  files: string[];
  created: string;
  modified: string;
}

export interface Catalog {
  catalogId: string;
  config: CatalogConfig;
}

export interface CatalogListing {
  host: string;
  catalogId: string;
  name: string;
  description: string;
  mode: CatalogMode;
  entries: CanopyEntry[];
}

export interface CatalogSearchHit {
  host: string;
  catalogId: string;
  catalogName: string;
  entry: CanopyEntry;
}

export interface CatalogSub {
  host: string;
  catalogId: string;
}

export type Update =
  | { type: 'fileAdded'; fileId: FileId; name: string; fileMark: string; size: number; tags: string[]; created: string; modified: string; description: string; starred: boolean }
  | { type: 'fileUpdated'; fileId: FileId; name: string; fileMark: string; size: number; tags: string[]; created: string; modified: string; description: string; starred: boolean }
  | { type: 'fileRemoved'; fileId: FileId }
  | { type: 'viewAdded'; name: string; tags: string[]; color: string }
  | { type: 'viewRemoved'; name: string }
  | { type: 'shareAdded'; token: ShareToken; fileId: FileId }
  | { type: 'shareRemoved'; token: ShareToken }
  | { type: 'allowedUpdated'; fileId: FileId; ships: string[] }
  | { type: 'inboxAdded'; entry: InboxEntry }
  | { type: 'inboxUpdated'; entry: InboxEntry }
  | { type: 'inboxRemoved'; owner: string; fileId: FileId }
  | { type: 'trustedUpdated'; trusted: string[]; blocked: string[] }
  | { type: 'cacheUpdated'; owner: string; meta: FileMeta }
  | { type: 'cacheRemoved'; owner: string; fileId: FileId }
  | { type: 'catalogCreated'; catalogId: string; config: CatalogConfig }
  | { type: 'catalogDeleted'; catalogId: string }
  | { type: 'catalogUpdated'; catalogId: string; config: CatalogConfig }
  | { type: 'catalogFileAdded'; catalogId: string; fileId: FileId }
  | { type: 'catalogFileRemoved'; catalogId: string; fileId: FileId }
  | { type: 'catalogPeerUpdated'; listing: CatalogListing }
  | { type: 'catalogPeerRemoved'; host: string; catalogId: string };

export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'largest' | 'smallest' | 'type';

export type ViewMode = 'list' | 'grid';

export type Selection =
  | { kind: 'all' }
  | { kind: 'starred' }
  | { kind: 'view'; name: string }
  | { kind: 'tag'; name: string }
  | { kind: 'inbox' }
  | { kind: 'catalogs' }
  | { kind: 'catalog'; catalogId: string }
  | { kind: 'browse' }
  | { kind: 'browse-peer'; host: string }
  | { kind: 'browse-catalog'; host: string; catalogId: string }
  | { kind: 'discover' };

// Wire-format interfaces matching Hoon JSON serialization.
export interface RawFileMeta {
  id: string;
  name: string;
  'file-mark'?: string;
  fileMark?: string;
  size: number;
  tags?: string[];
  created: string;
  modified: string;
  description?: string;
  starred?: boolean;
  allowed?: string[];
  inCatalogs?: string[];
}

export interface RawInboxEntry {
  owner: string;
  'file-id'?: string;
  fileId?: string;
  name: string;
  fileMark?: string;
  'file-mark'?: string;
  size: number;
  offered: string;
  accepted?: boolean;
  cached?: boolean;
}

export interface RawCanopyEntry {
  id: string;
  displayName?: string;
  'display-name'?: string;
  name?: string;
  fileMark?: string;
  'file-mark'?: string;
  size: number;
  tags?: string[];
  published: string;
  description?: string;
}

export interface RawCatalogConfig {
  name?: string;
  description?: string;
  mode?: unknown;
  friends?: string[];
  'group-flag'?: { host: string; name: string } | null;
  files?: string[];
  created?: string;
  modified?: string;
}

export interface RawCatalogListing {
  host: string;
  catalogId?: string;
  'catalog-id'?: string;
  name?: string;
  description?: string;
  mode?: unknown;
  entries?: RawCanopyEntry[];
}

export interface RawView {
  name: string;
  tags?: string[];
  color: string;
}

export interface RawShare {
  token: string;
  'file-id': string;
  name: string;
}

export interface RawCatalogSearchHit {
  host: string;
  catalogId?: string;
  'catalog-id'?: string;
  catalogName?: string;
  'catalog-name'?: string;
  entry: RawCanopyEntry;
}

export interface RawGroupInfo {
  host: string;
  name: string;
  title?: string;
  members?: number;
}

export type GroveAction =
  | { upload: { name: string; 'file-mark': string; data: string; tags: string[] } }
  | { rename: { id: FileId; name: string } }
  | { delete: { id: FileId } }
  | { 'toggle-star': { id: FileId } }
  | { 'add-tags': { id: FileId; tags: string[] } }
  | { 'remove-tags': { id: FileId; tags: string[] } }
  | { 'set-description': { id: FileId; description: string } }
  | { share: { id: FileId } }
  | { unshare: { token: ShareToken } }
  | { 'set-allowed': { id: FileId; ships: string[]; notify: boolean; 'base-url': string } }
  | { mkview: { name: string; tags: string[]; color: string } }
  | { rmview: { name: string } }
  | { 'accept-offer': { owner: string; id: FileId } }
  | { 'decline-offer': { owner: string; id: FileId } }
  | { 'trust-ship': { who: string } }
  | { 'untrust-ship': { who: string } }
  | { 'block-ship': { who: string } }
  | { 'unblock-ship': { who: string } }
  | { fetch: { owner: string; id: FileId } }
  | { plant: { owner: string; id: FileId } }
  | { 'drop-cache': { owner: string; id: FileId } }
  | { 'create-catalog': { id: string; name: string; description: string; mode: CatalogMode } }
  | { 'delete-catalog': { id: string } }
  | { 'update-catalog': { id: string; name: string; description: string } }
  | { 'set-catalog-mode': { id: string; mode: CatalogMode } }
  | { 'set-catalog-group': { id: string; flag: GroupFlag | null } }
  | { 'add-catalog-friend': { id: string; who: string } }
  | { 'remove-catalog-friend': { id: string; who: string } }
  | { 'add-to-catalog': { id: string; 'file-id': string; 'display-name': string; tags: string[]; description: string } }
  | { 'remove-from-catalog': { id: string; 'file-id': string } }
  | { 'subscribe-catalog': { who: string; 'catalog-id': string } }
  | { 'unsubscribe-catalog': { who: string; 'catalog-id': string } };
