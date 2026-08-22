import { brotliCompressSync, constants, gzipSync } from "node:zlib"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name)
  return statSync(p).isDirectory() ? walk(p) : [p]
})

const roots = process.argv.slice(2, -1)
const outPath = process.argv.at(-1)
const rows = []
for (const root of roots) {
  for (const probeDir of readdirSync(root).sort()) {
    const dir = join(root, probeDir)
    if (!statSync(dir).isDirectory()) continue
    for (const file of walk(dir)) {
      if (!/\.(js|css|html)$/.test(file)) continue
      const buf = readFileSync(file)
      rows.push({
        probe: probeDir,
        file: file.slice(dir.length + 1),
        raw_bytes: buf.byteLength,
        gzip9_bytes: gzipSync(buf, { level: 9 }).byteLength,
        brotli11_bytes: brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).byteLength,
        sha256: createHash("sha256").update(buf).digest("hex").slice(0, 16)
      })
    }
  }
}
const totals = {}
for (const r of rows) {
  if (!r.file.endsWith(".js") && !r.file.endsWith(".css")) continue
  totals[r.probe] ??= { raw: 0, gzip9: 0, brotli11: 0 }
  totals[r.probe].raw += r.raw_bytes
  totals[r.probe].gzip9 += r.gzip9_bytes
  totals[r.probe].brotli11 += r.brotli11_bytes
}
writeFileSync(outPath, JSON.stringify({ generated: "2026-08-22", rows, totals }, null, 2) + "\n")
const pad = (s, n) => String(s).padStart(n)
console.log("probe".padEnd(28), pad("raw", 9), pad("gzip9", 9), pad("brotli11", 9))
for (const [probe, t] of Object.entries(totals)) console.log(probe.padEnd(28), pad(t.raw, 9), pad(t.gzip9, 9), pad(t.brotli11, 9))
