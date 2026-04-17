// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MineView from './CanopyMineView';
import type { CanopyConfig, CanopyEntry, GroupInfo } from '../types';

const config: CanopyConfig = {
  mode: 'open',
  name: 'My Canopy',
  friends: [],
  groupFlag: null,
};

const entries: CanopyEntry[] = [
  { id: 'c1', displayName: 'Photo.png', fileMark: 'png', size: 1024, tags: ['art'], published: '~2026.1.1..0.0', description: '' },
  { id: 'c2', displayName: 'Doc.pdf', fileMark: 'pdf', size: 2048, tags: [], published: '~2026.1.2..0.0', description: 'A doc' },
];

const groups: GroupInfo[] = [
  { host: '~zod', name: 'dev-crew', title: 'Dev Crew', members: 5 },
];

function renderMine(overrides = {}) {
  const props = {
    kind: 'mine' as const,
    entries,
    config,
    search: '',
    sortKey: 'newest' as const,
    viewMode: 'list' as const,
    onUnpublish: vi.fn(),
    onSetMode: vi.fn(),
    onSetName: vi.fn(),
    onAddFriend: vi.fn(),
    onRemoveFriend: vi.fn(),
    onSetGroup: vi.fn(),
    groups: [] as GroupInfo[],
    ...overrides,
  };
  render(<MineView {...props} />);
  return props;
}

describe('CanopyMineView', () => {
  afterEach(cleanup);

  it('renders settings and published sections', () => {
    renderMine();
    expect(screen.getByText('Canopy settings')).toBeTruthy();
    expect(screen.getByText(/Published files/)).toBeTruthy();
  });

  it('shows catalog name in input', () => {
    renderMine();
    expect(screen.getByDisplayValue('My Canopy')).toBeTruthy();
  });

  it('calls onSetMode when visibility button is clicked', () => {
    const props = renderMine();
    fireEvent.click(screen.getByText('Friends only'));
    expect(props.onSetMode).toHaveBeenCalledWith('friends');
  });

  it('calls onSetMode for group mode', () => {
    const props = renderMine();
    fireEvent.click(screen.getByText('Group'));
    expect(props.onSetMode).toHaveBeenCalledWith('group');
  });

  it('calls onSetName when Save is clicked with changed name', () => {
    const props = renderMine();
    const input = screen.getByDisplayValue('My Canopy');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save'));
    expect(props.onSetName).toHaveBeenCalledWith('New Name');
  });

  it('disables Save when name has not changed', () => {
    renderMine();
    expect((screen.getByText('Save') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows published entry names in list', () => {
    renderMine();
    expect(screen.getByText('Photo.png')).toBeTruthy();
    expect(screen.getByText('Doc.pdf')).toBeTruthy();
  });

  it('shows empty published state when no entries', () => {
    renderMine({ entries: [] });
    expect(screen.getByText(/Nothing published yet/)).toBeTruthy();
  });

  it('shows friends input when mode is friends', () => {
    renderMine({ config: { ...config, mode: 'friends' } });
    expect(screen.getByPlaceholderText('~sampel-palnet')).toBeTruthy();
    expect(screen.getByText('No friends yet')).toBeTruthy();
  });

  it('shows group selector when mode is group', () => {
    renderMine({ config: { ...config, mode: 'group' }, groups });
    expect(screen.getByText('Dev Crew')).toBeTruthy();
    expect(screen.getByText('5 members')).toBeTruthy();
  });

  it('calls onSetGroup when a group is selected', () => {
    const props = renderMine({ config: { ...config, mode: 'group' }, groups });
    fireEvent.click(screen.getByText('Dev Crew'));
    expect(props.onSetGroup).toHaveBeenCalledWith({ host: '~zod', name: 'dev-crew' });
  });

  it('shows open mode description', () => {
    renderMine();
    expect(screen.getByText(/Anyone can subscribe and download/)).toBeTruthy();
  });
});
