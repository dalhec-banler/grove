// PWA Badging API -- shows unread count on app icon
const LAST_SEEN_KEY = 'grove-last-seen';

export function getLastSeen(): number {
  return Number(localStorage.getItem(LAST_SEEN_KEY)) || 0;
}

export function markSeen(): void {
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  clearBadge();
}

export function updateBadge(count: number): void {
  if (!('setAppBadge' in navigator)) return;
  if (count > 0) {
    (navigator as any).setAppBadge(count);
  } else {
    clearBadge();
  }
}

export function clearBadge(): void {
  if ('clearAppBadge' in navigator) {
    (navigator as any).clearAppBadge();
  }
}
