import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const rootDir = import.meta.dirname;

const cleanUrlsPlugin = {
  name: 'vercel-clean-urls-compat',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/cv' || req.url?.startsWith('/cv?')) {
        req.url = req.url.replace('/cv', '/cv.html');
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/cv' || req.url?.startsWith('/cv?')) {
        req.url = req.url.replace('/cv', '/cv.html');
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [cleanUrlsPlugin],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        cv: resolve(rootDir, 'cv.html'),
      },
    },
  },
});
