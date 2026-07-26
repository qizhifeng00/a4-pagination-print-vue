import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  root: './demo',
  resolve: {
    alias: {
      '@a4-pagination-print/core': resolve(__dirname, '../a4-core/src'),
      '@a4/vue': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
