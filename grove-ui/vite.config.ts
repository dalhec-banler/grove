import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

const SHIP = process.env.SHIP_URL || 'http://localhost';

export default defineConfig({
  base: '/apps/grove/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'grove-icon.svg',
        'apple-touch-icon.png',
      ],
      manifest: {
        name: 'Grove',
        short_name: 'Grove',
        description: 'Private file manager with social sharing, on Urbit.',
        id: '/apps/grove/',
        start_url: '/apps/grove/',
        scope: '/apps/grove/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3A6BC5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/apps/grove/index.html',
        navigateFallbackDenylist: [/^\/~/, /^\/grove-file\//, /^\/grove-remote-file\//, /^\/grove-share\//],
        runtimeCaching: [],
        navigationPreload: false,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, '../grove/web'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  server: {
    proxy: {
      '/~': SHIP,
      '/apps/grove/~': SHIP,
    },
  },
});
