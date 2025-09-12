
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { URL, fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: __dirname is not available in ES modules. Use import.meta.url for path resolution.
      // FIX: Alias '@' to the project root, as there's no 'src' directory.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
