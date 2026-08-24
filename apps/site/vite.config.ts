import { readdirSync } from "node:fs"
import { relative, resolve } from "node:path"
import { defineConfig } from "vite"

const excludedDirectories = new Set(["dist", "node_modules", "public"])

export const discoverHtmlInputs = (root: string): Readonly<Record<string, string>> => {
  const collect = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if (entry.name.startsWith(".") || (entry.isDirectory() && excludedDirectories.has(entry.name))) {
        return []
      }
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) return collect(path)
      return entry.isFile() && entry.name.endsWith(".html") ? [path] : []
    })

  const documents = collect(root).sort()
  if (documents.length === 0) throw new Error("No generated HTML documents were found")
  return Object.fromEntries(
    documents.map((path) => {
      const relativePath = relative(root, path).replaceAll("\\", "/")
      const name = relativePath === "index.html" ? "home" : relativePath
        .replace(/\/index\.html$/, "")
        .replace(/\.html$/, "")
        .replaceAll("/", "__")
      return [name, path]
    })
  )
}

const root = import.meta.dirname

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: discoverHtmlInputs(root)
    },
    target: "es2023"
  }
})
