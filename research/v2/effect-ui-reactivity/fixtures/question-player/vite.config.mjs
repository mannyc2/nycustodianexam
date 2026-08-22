import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  root: resolve(import.meta.dirname, "public"),
  publicDir: false,
  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    manifest: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        direct: resolve(import.meta.dirname, "public/direct.html"),
        template: resolve(import.meta.dirname, "public/template.html"),
        lit: resolve(import.meta.dirname, "public/lit.html")
      }
    }
  }
})
