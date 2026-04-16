// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('InboxView', () => {
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
  };

  it('renders pending offers section', () => {
    render(<InboxView {...props} />);
    expect(screen.getByText(/Pending offers/)).toBeTruthy();
  });

  it('shows pending file name', () => {
    render(<InboxView {...props} />);
    expect(screen.getAllByText('shared.png').length).toBeGreaterThan(0);
  });

  it('renders with empty entries', () => {
    render(<InboxView {...props} entries={[]} />);
    expect(screen.getByText(/Nothing shared with you yet/)).toBeTruthy();
  });

  it('shows accepted file name', () => {
    render(<InboxView {...props} />);
    expect(screen.getAllByText('doc.pdf').length).toBeGreaterThan(0);
  });
});
