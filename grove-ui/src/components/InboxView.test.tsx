// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InboxView from './InboxView';
import type { InboxEntry } from '../types';

const pending: InboxEntry = {
  owner: '~zod', fileId: 'f1', name: 'shared.png', fileMark: 'png',
  size: 1024, offered: '~2026.1.1..10.00.00..0000', accepted: false, cached: false,
};

const accepted: InboxEntry = {
  owner: '~bus', fileId: 'f2', name: 'doc.pdf', fileMark: 'pdf',
  size: 2048, offered: '~2026.1.2..10.00.00..0000', accepted: true, cached: true,
};

function renderInbox(overrides = {}) {
  const props = {
    entries: [pending, accepted],
    trusted: new Set<string>(),
    blocked: new Set<string>(),
    search: '',
    sortKey: 'newest' as const,
    viewMode: 'list' as const,
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    onTrust: vi.fn(),
    onUntrust: vi.fn(),
    onBlock: vi.fn(),
    onUnblock: vi.fn(),
    onFetch: vi.fn(),
    onPlant: vi.fn(),
    onDropCache: vi.fn(),
    ...overrides,
  };
  render(<InboxView {...props} />);
  return props;
}

describe('InboxView', () => {
  afterEach(cleanup);

  it('renders pending offers section', () => {
    renderInbox();
    expect(screen.getByText(/Pending offers/)).toBeTruthy();
  });

  it('shows pending file name', () => {
    renderInbox();
    expect(screen.getAllByText('shared.png').length).toBeGreaterThan(0);
  });

  it('renders with empty entries', () => {
    renderInbox({ entries: [] });
    expect(screen.getByText(/Nothing shared with you yet/)).toBeTruthy();
  });

  it('shows accepted file name', () => {
    renderInbox();
    expect(screen.getAllByText('doc.pdf').length).toBeGreaterThan(0);
  });

  it('calls onAccept when Accept button is clicked', () => {
    const props = renderInbox();
    fireEvent.click(screen.getByText('Accept'));
    expect(props.onAccept).toHaveBeenCalledWith(pending);
  });

  it('calls onDecline when Decline button is clicked on pending', () => {
    const props = renderInbox();
    // The first Decline button belongs to the pending entry
    fireEvent.click(screen.getAllByText('Decline')[0]);
    expect(props.onDecline).toHaveBeenCalledWith(pending);
  });

  it('calls onTrust when Trust button is clicked', () => {
    const props = renderInbox();
    // "Trust" appears as section header, option text, and button — use getByTitle
    fireEvent.click(screen.getByTitle('Always accept from this ship'));
    expect(props.onTrust).toHaveBeenCalledWith('~zod');
  });

  it('calls onBlock when Block button is clicked', () => {
    const props = renderInbox();
    // "Block" appears as option text and button — use getByTitle
    fireEvent.click(screen.getByTitle('Block all future offers'));
    expect(props.onBlock).toHaveBeenCalledWith('~zod');
  });

  it('shows Open instead of Fetch for cached accepted entries', () => {
    renderInbox();
    expect(screen.getByText('Open')).toBeTruthy();
  });

  it('shows Fetch for non-cached accepted entries', () => {
    const uncached = { ...accepted, cached: false };
    renderInbox({ entries: [uncached] });
    expect(screen.getByText('Fetch')).toBeTruthy();
  });

  it('filters entries by search term', () => {
    renderInbox({ search: 'shared' });
    expect(screen.getAllByText('shared.png').length).toBeGreaterThan(0);
    expect(screen.queryByText('doc.pdf')).toBeNull();
  });
});
