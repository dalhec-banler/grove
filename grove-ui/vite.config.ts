import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

const SHIP = process.env.SHIP_URL || 'http://localhost';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw-custom.ts',
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      scope: '/apps/grove/',
      manifest: {
        name: 'Grove',
        short_name: 'Grove',
        description: 'Private file manager with social sharing, on Urbit.',
        prefer_related_applications: false,
        theme_color: '#3A6BC5',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/apps/grove/',
        start_url: '/apps/grove/',
        icons: [
          {
            src: '/apps/grove/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/apps/grove/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/apps/grove/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        // Include mjs (1MB react-pdf worker) + webmanifest so offline PDF
        // viewing and install metadata work (M3).
        globPatterns: ['**/*.{js,mjs,css,html,svg,png,ico,woff,woff2,webmanifest}'],
      },
    }),
  ],
  base: '/apps/grove/',
  server: {
    proxy: {
      '/~': SHIP,
      '/apps/grove/~': SHIP,
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../grove/web'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Content-hashed filenames so the precache gets a real revision per
        // asset — otherwise Workbox serves the old bundle forever after an OTA
        // (new shell, stale JS/CSS). index.html references are rewritten by
        // vite, so hashing is safe (H5).
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
