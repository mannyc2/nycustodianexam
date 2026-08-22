import { resolve } from "node:path"
import { defineConfig } from "vite"

const entry = process.env.PROBE_ENTRY
const outName = process.env.PROBE_OUT
const minifier = process.env.PROBE_MINIFY ?? "oxc"

export default defineConfig({
  build: {
    outDir: resolve(import.meta.dirname, "dist", outName),
    emptyOutDir: true,
    manifest: true,
    sourcemap: false,
    minify: minifier === "terser" ? "terser" : true,
    target: "es2022",
    rollupOptions: {
      input: { [outName]: resolve(import.meta.dirname, entry) },
      output: { format: "es" }
    }
  }
})
