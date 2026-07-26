import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'A4Vue',
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@a4-pagination-print/core', 'echarts'],
      output: {
        globals: {
          vue: 'Vue',
        },
        exports: 'named',
      },
    },
    sourcemap: true,
  },
});
