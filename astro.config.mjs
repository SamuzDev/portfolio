import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  adapter: isProduction ? cloudflare() : undefined,
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['three'],
      include: [],
    },
    server: {
      hmr: {
        overlay: false,
      },
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**', '**/.astro/**'],
      },
    },
    ssr: {
      external: ['three'],
    },
  },
  site: 'https://samuz.dev',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});