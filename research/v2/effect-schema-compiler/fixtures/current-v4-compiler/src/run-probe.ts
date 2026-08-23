import { mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, dirname, resolve } from "node:path"
import { compileCorpus, canonicalJson } from "./compiler.ts"

const fixtureRoot = resolve(import.meta.dir, "../fixtures")
const outputRoot = resolve(import.meta.dir, "../../../raw-results/current-v4-compiler")
const fixtureNames = [
  "valid.json",
  "status-and-translation.json",
  "invalid-structural.json",
  "invalid-relational.json"
] as const

await mkdir(outputRoot, { recursive: true })

const results = []
for (const fixtureName of fixtureNames) {
  const input = JSON.parse(await readFile(resolve(fixtureRoot, fixtureName), "utf8"))
  const first = compileCorpus(input)
  const second = compileCorpus(input)
  const deterministic = canonicalJson(first) === canonicalJson(second)
  const result = {
    fixture: fixtureName,
    deterministic,
    diagnosticCodes: first.diagnostics.map((entry) => entry.code),
    objectDigest: first.artifact?.objectDigest ?? null,
    releaseRoot: first.artifact?.releaseRoot ?? null
  }
  results.push(result)
  await writeFile(resolve(outputRoot, `${basename(fixtureName, ".json")}.result.json`), canonicalJson({ ...first, deterministic }))
}

await writeFile(resolve(outputRoot, "probe-summary.json"), canonicalJson({ results }))
const validInput = JSON.parse(await readFile(resolve(fixtureRoot, "valid.json"), "utf8"))
const valid = compileCorpus(validInput)
await writeFile(resolve(outputRoot, "corpus.schema.json"), canonicalJson(valid.artifact?.jsonSchema))
await writeFile(resolve(outputRoot, "canonical-corpus.json"), valid.artifact?.canonicalJson ?? "")

console.log(JSON.stringify({ outputRoot: dirname(resolve(outputRoot, "probe-summary.json")), results }, null, 2))
