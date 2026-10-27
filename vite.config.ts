import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `--mode artifact` bundles everything into one chunk so it can be inlined into a single HTML page.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: mode === 'artifact' ? { rollupOptions: { output: { inlineDynamicImports: true } } } : {},
}));
