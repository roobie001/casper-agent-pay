import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@make-software/csprclick-core-client': fileURLToPath(
        new URL('./src/lib/csprclick-core-client-runtime.ts', import.meta.url),
      ),
    },
  },
})
