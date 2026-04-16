// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShareModal from './ShareModal';

describe('ShareModal', () => {
  const share = { token: 'tok123', fileId: 'f1', name: 'photo.png' };

  it('renders the share link input', () => {
    render(<ShareModal share={share} onClose={vi.fn()} />);
    expect(screen.getByDisplayValue(/grove-share\/tok123/)).toBeTruthy();
  });

  it('renders the modal', () => {
    render(<ShareModal share={share} onClose={vi.fn()} />);
    expect(screen.getAllByText(/Share link/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Copy/).length).toBeGreaterThan(0);
  });
});
