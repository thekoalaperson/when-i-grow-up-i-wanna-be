import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'

// Produces a single self-contained index.html (JS, CSS, and fonts all inlined) for
// publishing as an Artifact / dropping anywhere. No external requests at runtime.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100000000, // inline fonts as data URIs
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
