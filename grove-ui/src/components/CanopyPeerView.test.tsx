// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PeerView from './CanopyPeerView';
import type { CanopyListing, InboxEntry } from '../types';

const listing: CanopyListing = {
  host: '~zod',
  name: "Zod's Library",
  mode: 'open',
  entries: [
    { id: 'c1', displayName: 'Shared.png', fileMark: 'png', size: 512, tags: ['photo'], published: '~2026.1.1..0.0', description: '' },
    { id: 'c2', displayName: 'Notes.txt', fileMark: 'txt', size: 128, tags: [], published: '~2026.1.2..0.0', description: 'some notes' },
  ],
};

const cachedEntry: InboxEntry = {
  owner: '~zod', fileId: 'c1', name: 'Shared.png', fileMark: 'png',
  size: 512, offered: '~2026.1.1..0.0', accepted: true, cached: true,
};

function renderPeer(overrides = {}) {
  const props = {
    kind: 'peer' as const,
    host: '~zod',
    listing: listing as CanopyListing | null,
    cache: new Map<string, InboxEntry>(),
    search: '',
    sortKey: 'newest' as const,
    viewMode: 'list' as const,
    onFetch: vi.fn(),
    onPlant: vi.fn(),
    onDropCache: vi.fn(),
    onUnsubscribe: vi.fn(),
    ...overrides,
  };
  render(<PeerView {...props} />);
  return props;
}

describe('CanopyPeerView', () => {
  afterEach(cleanup);

  it('shows host name and mode', () => {
    renderPeer();
    expect(screen.getByText("Zod's Library")).toBeTruthy();
    expect(screen.getByText(/~zod · open/)).toBeTruthy();
  });

  it('renders entry display names', () => {
    renderPeer();
    expect(screen.getByText('Shared.png')).toBeTruthy();
    expect(screen.getByText('Notes.txt')).toBeTruthy();
  });

  it('shows waiting state when listing is null', () => {
    renderPeer({ listing: null });
    expect(screen.getByText(/Waiting for ~zod's catalog/)).toBeTruthy();
  });

  it('shows empty catalog message when listing has no entries', () => {
    renderPeer({ listing: { ...listing, entries: [] } });
    expect(screen.getByText('This catalog is empty.')).toBeTruthy();
  });

  it('shows Fetch button for non-cached entries', () => {
    renderPeer();
    const fetchButtons = screen.getAllByText('Fetch');
    expect(fetchButtons.length).toBeGreaterThan(0);
  });

  it('calls onFetch when Fetch button is clicked', () => {
    const props = renderPeer();
    const fetchButtons = screen.getAllByText('Fetch');
    fireEvent.click(fetchButtons[0]);
    // Entries are sorted newest-first, so c2 (later date) comes first
    expect(props.onFetch).toHaveBeenCalledWith('~zod', 'c2');
  });

  it('shows Open instead of Fetch for cached entries', () => {
    const cache = new Map<string, InboxEntry>([['~zod/c1', cachedEntry]]);
    renderPeer({ cache });
    expect(screen.getByText('Open')).toBeTruthy();
  });

  it('enables Plant button for cached entries', () => {
    const cache = new Map<string, InboxEntry>([['~zod/c1', cachedEntry]]);
    renderPeer({ cache });
    const plantButtons = screen.getAllByText('Plant');
    // The cached entry's Plant button should not be disabled
    const enabledPlant = plantButtons.find((btn) => !(btn as HTMLButtonElement).disabled);
    expect(enabledPlant).toBeTruthy();
  });

  it('calls onPlant when Plant button is clicked', () => {
    const cache = new Map<string, InboxEntry>([['~zod/c1', cachedEntry]]);
    const props = renderPeer({ cache });
    const plantButtons = screen.getAllByText('Plant');
    const enabledPlant = plantButtons.find((btn) => !(btn as HTMLButtonElement).disabled)!;
    fireEvent.click(enabledPlant);
    expect(props.onPlant).toHaveBeenCalledWith('~zod', 'c1');
  });

  it('filters entries by search term', () => {
    renderPeer({ search: 'Shared' });
    expect(screen.getByText('Shared.png')).toBeTruthy();
    expect(screen.queryByText('Notes.txt')).toBeNull();
  });

  it('shows Unsubscribe button', () => {
    renderPeer();
    expect(screen.getByText('Unsubscribe')).toBeTruthy();
  });
});
