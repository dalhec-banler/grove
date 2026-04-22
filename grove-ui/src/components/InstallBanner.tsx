import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window { __pwaPrompt: BeforeInstallPromptEvent | null }
}

const DISMISSED_KEY = 'grove:install-dismissed';

export default function InstallBanner() {
  // Check early-captured event from index.html first
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => window.__pwaPrompt ?? null
  );
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === '1');
  const [lines, setLines] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    setLines(prev => [...prev, msg]);
  }, []);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    if (standalone) { setInstalled(true); return; }

    log(`HTTPS: ${location.protocol === 'https:' ? 'yes' : 'NO'}`);

    // Chrome version
    const m = navigator.userAgent.match(/Chrome\/(\d+)/);
    log(`Chrome: ${m ? m[1] : 'unknown'} | ${navigator.userAgent.slice(-40)}`);

    // Check if Chrome thinks app is already installed
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        log(`Installed related apps: ${apps.length > 0 ? JSON.stringify(apps) : 'none'}`);
      }).catch((e: any) => log(`Related apps check: ${e}`));
    }

    // Check start_url is reachable
    fetch('/apps/grove/', { cache: 'no-store', redirect: 'manual' })
      .then(r => log(`start_url fetch: ${r.status} type=${r.type}`))
      .catch(e => log(`start_url fetch: FAIL ${e}`));

    // Check if early capture got the prompt
    if (window.__pwaPrompt) {
      log('Install prompt: captured early (before React)');
      setDeferredPrompt(window.__pwaPrompt);
    }

    // Fetch grove-sw.js
    fetch('/apps/grove/grove-sw.js', { cache: 'no-store' })
      .then(r => log(`grove-sw.js: ${r.status} type=${r.headers.get('content-type') || 'none'}`))
      .catch(e => log(`grove-sw.js: FAIL ${e}`));

    // Check SW registration
    const checkReg = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration('/apps/grove/').then(reg => {
          if (reg) {
            const state = reg.active?.state || reg.waiting?.state || reg.installing?.state || 'none';
            log(`SW: ${state} scope=${reg.scope}`);
          } else {
            log('SW: no registration');
          }
        });
      }
    };
    setTimeout(checkReg, 2000);

    // Manifest + icon checks
    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      const mUrl = (link as HTMLLinkElement).href;
      fetch(mUrl)
        .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
        .then(m => {
          log(`Manifest: OK name=${m.name} icons=${m.icons?.length} id=${m.id}`);
          // Check each icon is actually fetchable
          const base = mUrl.substring(0, mUrl.lastIndexOf('/') + 1);
          (m.icons || []).forEach((icon: { src: string; sizes: string }) => {
            const iconUrl = icon.src.startsWith('http') ? icon.src : base + icon.src;
            fetch(iconUrl, { cache: 'no-store' })
              .then(r => log(`Icon ${icon.sizes}: ${r.status} type=${r.headers.get('content-type') || 'none'}`))
              .catch(e => log(`Icon ${icon.sizes}: FAIL ${e}`));
          });
        })
        .catch(e => log(`Manifest: ${e}`));
    }

    // Check page headers
    fetch(location.href, { cache: 'no-store' })
      .then(r => {
        const csp = r.headers.get('content-security-policy') || 'none';
        const xfo = r.headers.get('x-frame-options') || 'none';
        log(`Headers: CSP=${csp.substring(0, 60)} XFO=${xfo}`);
      })
      .catch(() => {});

    // Listen for late prompt
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      log('Install prompt: FIRED');
    };
    const onInstalled = () => { setInstalled(true); log('App installed!'); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const timer = setTimeout(() => {
      if (!window.__pwaPrompt) log('Install prompt: not fired after 15s');
    }, 15000);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, [log]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, '1');
  }, []);

  if (dismissed || installed) return null;

  return (
    <div className="flex flex-col gap-1 bg-panel border-b border-border px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        {deferredPrompt ? (
          <>
            <span className="flex-1 text-muted">Install Grove as an app</span>
            <button onClick={handleInstall} className="px-3 py-1 rounded bg-accent text-white text-xs font-medium shrink-0">
              Install
            </button>
          </>
        ) : (
          <span className="flex-1 text-muted">PWA diagnostic</span>
        )}
        <button onClick={dismiss} className="text-faint hover:text-muted shrink-0 p-1" aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="text-xs text-faint font-mono space-y-0.5 break-all">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}
