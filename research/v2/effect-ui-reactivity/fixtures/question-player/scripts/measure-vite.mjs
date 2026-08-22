import { gzipSync } from "node:zlib"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "..")
const dist = join(root, "dist")
const manifest = JSON.parse(await readFile(join(dist, ".vite", "manifest.json"), "utf8"))
const resultsPath = resolve(root, "..", "..", "raw-results", "vite-bundle-measurements.json")

const collect = (entryKey) => {
  const seen = new Set()
  const files = new Set()
  const visit = (key) => {
    if (seen.has(key)) return
    seen.add(key)
    const item = manifest[key]
    if (!item) throw new Error(`Missing Vite manifest entry: ${key}`)
    files.add(item.file)
    for (const css of item.css ?? []) files.add(css)
    for (const asset of item.assets ?? []) files.add(asset)
    for (const imported of item.imports ?? []) visit(imported)
    for (const imported of item.dynamicImports ?? []) visit(imported)
  }
  visit(entryKey)
  return [...files].sort()
}

const result = {
  methodology: "Vite production manifest closure; raw and gzip bytes, no source maps.",
  vite: "8.2.1",
  arms: {}
}
for (const [name, key] of Object.entries({ direct: "direct.html", template: "template.html", lit: "lit.html" })) {
  const files = collect(key)
  const buffers = await Promise.all(files.map((file) => readFile(join(dist, file))))
  const joined = Buffer.concat(buffers)
  result.arms[name] = {
    files,
    bytes: joined.byteLength,
    gzip_bytes: gzipSync(joined, { level: 9 }).byteLength
  }
}
result.deltas = {
  template_minus_direct: {
    bytes: result.arms.template.bytes - result.arms.direct.bytes,
    gzip_bytes: result.arms.template.gzip_bytes - result.arms.direct.gzip_bytes
  },
  lit_minus_direct: {
    bytes: result.arms.lit.bytes - result.arms.direct.bytes,
    gzip_bytes: result.arms.lit.gzip_bytes - result.arms.direct.gzip_bytes
  }
}
await writeFile(resultsPath, JSON.stringify(result, null, 2) + "\n")
console.log(JSON.stringify(result, null, 2))
