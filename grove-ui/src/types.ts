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
}

export interface View {
  name: string;
  tags: string[];
  color: string;
  shared?: SharedViewConfig;
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

export type CanopyMode = 'open' | 'friends' | 'group';

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

export interface SharedViewConfig {
  allowed: string[];
  groupFlag: GroupFlag | null;
}

export interface GroveViewListing {
  host: string;
  name: string;
  tags: string[];
  color: string;
  files: FileMeta[];
}

export interface CanopyConfig {
  mode: CanopyMode;
  name: string;
  friends: string[];
  groupFlag: GroupFlag | null;
}

export interface CanopyListing {
  host: string;
  name: string;
  mode: CanopyMode;
  entries: CanopyEntry[];
}

export interface CanopySearchHit {
  host: string;
  entry: CanopyEntry;
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
  | { type: 'canopyEntryAdded'; entry: CanopyEntry }
  | { type: 'canopyEntryRemoved'; fileId: FileId }
  | { type: 'canopyConfigUpdated'; config: CanopyConfig }
  | { type: 'canopyPeerUpdated'; listing: CanopyListing }
  | { type: 'canopyPeerRemoved'; host: string }
  | { type: 'viewShared'; name: string; allowed: string[]; groupFlag: GroupFlag | null }
  | { type: 'viewUnshared'; name: string }
  | { type: 'sharedViewUpdated'; listing: GroveViewListing }
  | { type: 'sharedViewRemoved'; host: string; name: string };

export type SortKey = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'largest' | 'smallest' | 'type';

export type ViewMode = 'list' | 'grid';

export type Selection =
  | { kind: 'all' }
  | { kind: 'starred' }
  | { kind: 'view'; name: string }
  | { kind: 'tag'; name: string }
  | { kind: 'inbox' }
  | { kind: 'canopy-mine' }
  | { kind: 'canopy-browse' }
  | { kind: 'canopy-peer'; ship: string };

// Wire-format interfaces matching Hoon JSON serialization.
// Scry responses use kebab-case; subscription updates use camelCase.
// fromJson parsers accept both via fallback reads.
export interface RawFileMeta {
  id: string;
  name: string;
  'file-mark': string;
  size: number;
  tags?: string[];
  created: string;
  modified: string;
  description?: string;
  starred?: boolean;
  allowed?: string[];
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

export interface RawCanopyConfig {
  mode?: unknown;
  name?: string;
  friends?: string[];
  'group-flag'?: { host: string; name: string } | null;
}

export interface RawCanopyListing {
  host: string;
  name?: string;
  mode?: unknown;
  entries?: RawCanopyEntry[];
}

export interface RawView {
  name: string;
  tags?: string[];
  color: string;
  shared?: unknown;
}

export interface RawShare {
  token: string;
  'file-id': string;
  name: string;
}

export interface RawCanopySearchHit {
  host: string;
  entry: RawCanopyEntry;
}

export interface RawGroupInfo {
  host: string;
  name: string;
  title?: string;
  members?: number;
}

export interface RawSharedViewConfig {
  allowed?: string[];
  'group-flag'?: { host: string; name: string } | null;
}

export interface RawGroveViewListing {
  host: string;
  name: string;
  tags?: string[];
  color?: string;
  files?: RawFileMeta[];
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
  | { 'set-allowed': { id: FileId; ships: string[]; notify: boolean } }
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
  | { publish: { id: FileId; 'display-name': string; tags: string[]; description: string } }
  | { unpublish: { id: FileId } }
  | { 'set-canopy-mode': { mode: CanopyMode } }
  | { 'set-canopy-name': { name: string } }
  | { 'add-friend': { who: string } }
  | { 'remove-friend': { who: string } }
  | { 'set-canopy-group': { flag: GroupFlag | null } }
  | { 'subscribe-to': { who: string } }
  | { 'unsubscribe-from': { who: string } }
  | { 'share-view': { name: string; allowed: string[]; 'group-flag': GroupFlag | null } }
  | { 'unshare-view': { name: string } }
  | { 'subscribe-view': { who: string; name: string } }
  | { 'unsubscribe-view': { who: string; name: string } };
