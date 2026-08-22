import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { assert, describe, it } from "@effect/vitest"
import { compileCorpus } from "../src/compiler.ts"

const fixture = async (name: string) => JSON.parse(
  await readFile(resolve(import.meta.dirname, `../fixtures/${name}.json`), "utf8")
)

describe("current Effect v4 compiler boundary", () => {
  it("emits identical roots for identical input", async () => {
    const input = await fixture("valid")
    const first = compileCorpus(input)
    const second = compileCorpus(input)
    assert.deepStrictEqual(first, second)
    assert.strictEqual(first.diagnostics.length, 0)
    assert.ok(first.artifact?.releaseRoot.startsWith("sha256:"))
  })

  it("accumulates structural failures without retaining input values", async () => {
    const result = compileCorpus(await fixture("invalid-structural"))
    assert.ok(result.diagnostics.length >= 5)
    assert.ok(result.diagnostics.every((entry) => entry.code === "STRUCT.INVALID_VALUE"))
    assert.strictEqual(result.artifact, undefined)
  })

  it("accepts not-published, conflicting, superseded, and reviewed translated content", async () => {
    const result = compileCorpus(await fixture("status-and-translation"))
    assert.strictEqual(result.diagnostics.length, 0)
    assert.ok(result.artifact?.objectDigest.startsWith("sha256:"))
  })

  it("accumulates relational failures in stable order", async () => {
    const result = compileCorpus(await fixture("invalid-relational"))
    assert.deepStrictEqual(result.diagnostics.map((entry) => entry.code), [
      "IDENTITY.DUPLICATE_ID",
      "REFERENCE.CLAIM_MISSING",
      "REFERENCE.CONCEPT_MISSING",
      "PROVENANCE.VERIFIED_WITHOUT_SPAN",
      "AUDIENCE.HIGH_LEVEL_DEPENDENCY",
      "REVIEW.ACCESSIBILITY_MISSING_OR_STALE",
      "REVIEW.RIGHTS_MISSING_OR_STALE"
    ])
    assert.strictEqual(result.artifact, undefined)
  })
})
