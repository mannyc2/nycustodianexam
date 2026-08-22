import { gzipSync } from "node:zlib"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, "..")
const publicRoot = join(root, "public")
const resultsPath = resolve(root, "..", "..", "raw-results", "payload-measurements.json")

const common = [
  "js/bootstrap.js", "js/controller.js", "js/model.js", "js/persistence.js",
  "js/grade-client.js", "js/question.js", "js/fixture-decoder.js", "styles.css"
]
const arms = {
  direct: [...common, "js/direct-view.js", "direct.html"],
  template: [...common, "js/template-view.js", "template.html"],
  lit_source_without_dependency: [...common, "js/lit-view.js", "lit.html"]
}

const result = {
  methodology: "Unbundled local source-closure bytes and gzip. The lit-html package is excluded, so this is not a production bundle comparison.",
  arms: {}
}
for (const [name, files] of Object.entries(arms)) {
  const buffers = await Promise.all(files.map((file) => readFile(join(publicRoot, file))))
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
  lit_first_party_source_minus_direct: {
    bytes: result.arms.lit_source_without_dependency.bytes - result.arms.direct.bytes,
    gzip_bytes: result.arms.lit_source_without_dependency.gzip_bytes - result.arms.direct.gzip_bytes
  }
}
await writeFile(resultsPath, JSON.stringify(result, null, 2) + "\n")
console.log(JSON.stringify(result, null, 2))
