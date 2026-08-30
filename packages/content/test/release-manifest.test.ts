import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vitest"
import { Effect } from "effect"
import {
  compileContentPack,
  createReleaseManifest,
  validateReleaseManifest,
  type CompileContentPackInput,
  type CompiledContentPack
} from "../src/compiler.ts"

const repositoryRoot = new URL("../../../", import.meta.url)
const textEncoder = new TextEncoder()

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(fileURLToPath(new URL(path, repositoryRoot)), "utf8")) as unknown

const loadInput = async (): Promise<CompileContentPackInput> => ({
  authoredPack: await readJson("content/authoring/packs/launch-v1.json"),
  acceptedTools: await readJson("content/authoring/visuals/releases/tools.json"),
  acceptedComparisons: await readJson(
    "content/authoring/visuals/releases/comparisons.json"
  ),
  acceptedScenes: await readJson("content/authoring/visuals/releases/scenes.json")
})

const digestUtf8 = (text: string) =>
  Effect.succeed({
    sha256: createHash("sha256").update(text).digest("hex"),
    bytes: textEncoder.encode(text).byteLength
  })

describe("release manifest validation", () => {
  let compiled: CompiledContentPack

  beforeAll(async () => {
    compiled = await Effect.runPromise(compileContentPack(await loadInput()))
  })

  it("accepts the canonical manifest produced from deterministic release bytes", async () => {
    const manifest = await Effect.runPromise(
      createReleaseManifest(compiled, digestUtf8)
    )
    await expect(
      Effect.runPromise(validateReleaseManifest(compiled, manifest, digestUtf8))
    ).resolves.toEqual(manifest)
  })

  it("preserves digest-capability failures at the owning runtime boundary", async () => {
    const failure = new Error("host hashing failed")
    await expect(
      Effect.runPromise(createReleaseManifest(compiled, () => Effect.fail(failure)))
    ).rejects.toBe(failure)
  })

  it("rejects every mismatched release-identity field", async () => {
    const manifest = await Effect.runPromise(
      createReleaseManifest(compiled, digestUtf8)
    )
    const variants = [
      { ...manifest, releaseId: "other-release" },
      { ...manifest, packVersion: manifest.packVersion + 1 },
      { ...manifest, locale: manifest.locale === "en" ? "es" : "en" }
    ]
    for (const variant of variants) {
      await expect(
        Effect.runPromise(validateReleaseManifest(compiled, variant, digestUtf8))
      ).rejects.toMatchObject({
        _tag: "ContentValidationError",
        stage: "closure",
        detail: expect.stringContaining("release identity")
      })
    }
  })

  it("rejects reordered or byte-drifted artifact records", async () => {
    const manifest = await Effect.runPromise(
      createReleaseManifest(compiled, digestUtf8)
    )
    const [first, second, ...remaining] = manifest.artifacts
    expect(first).toBeDefined()
    expect(second).toBeDefined()

    await expect(
      Effect.runPromise(
        validateReleaseManifest(
          compiled,
          { ...manifest, artifacts: [second, first, ...remaining] },
          digestUtf8
        )
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("deterministic release layout")
    })

    await expect(
      Effect.runPromise(
        validateReleaseManifest(
          compiled,
          {
            ...manifest,
            artifacts: manifest.artifacts.map((artifact, index) =>
              index === 0 ? { ...artifact, sha256: "0".repeat(64) } : artifact
            )
          },
          digestUtf8
        )
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("deterministic release bytes")
    })
  })

  it("validates every artifact field against the canonical ordered closure", async () => {
    const manifest = await Effect.runPromise(createReleaseManifest(compiled, digestUtf8))
    const index = manifest.artifacts.findIndex((artifact) => artifact.kind === "question-precommit")
    const artifact = manifest.artifacts[index]
    expect(artifact).toBeDefined()
    if (artifact === undefined || artifact.kind !== "question-precommit") return

    const mutations = [
      { record: { ...artifact, kind: "question-postcommit" }, detail: "release layout" },
      { record: { ...artifact, itemId: "other-item" }, detail: "release layout" },
      {
        record: { ...artifact, path: "questions/other-item.precommit.json" },
        detail: "release layout"
      },
      { record: { ...artifact, bytes: artifact.bytes + 1 }, detail: "release bytes" },
      { record: { ...artifact, sha256: "0".repeat(64) }, detail: "release bytes" }
    ] as const

    for (const mutation of mutations) {
      const artifacts = manifest.artifacts.map((record, recordIndex) =>
        recordIndex === index ? mutation.record : record
      )
      await expect(
        Effect.runPromise(
          validateReleaseManifest(compiled, { ...manifest, artifacts }, digestUtf8)
        )
      ).rejects.toMatchObject({
        _tag: "ContentValidationError",
        stage: "closure",
        detail: expect.stringContaining(mutation.detail)
      })
    }
  })

  it("derives both legacy aliases from canonical first-question bytes", async () => {
    const manifest = await Effect.runPromise(createReleaseManifest(compiled, digestUtf8))
    const aliasPairs = [
      ["question-precommit", "legacy-question-precommit"],
      ["question-postcommit", "legacy-question-postcommit"]
    ] as const

    for (const [canonicalKind, aliasKind] of aliasPairs) {
      const canonical = manifest.artifacts.find((artifact) => artifact.kind === canonicalKind)
      const alias = manifest.artifacts.find((artifact) => artifact.kind === aliasKind)
      expect(alias).toMatchObject({ sha256: canonical?.sha256, bytes: canonical?.bytes })

      const artifacts = manifest.artifacts.map((artifact) =>
        artifact.kind === canonicalKind || artifact.kind === aliasKind
          ? { ...artifact, sha256: "0".repeat(64) }
          : artifact
      )
      await expect(
        Effect.runPromise(
          validateReleaseManifest(compiled, { ...manifest, artifacts }, digestUtf8)
        )
      ).rejects.toMatchObject({
        _tag: "ContentValidationError",
        stage: "closure",
        detail: expect.stringContaining("deterministic release bytes")
      })
    }
  })

  it("preserves canonical compiled-asset ordering", async () => {
    const manifest = await Effect.runPromise(createReleaseManifest(compiled, digestUtf8))
    await expect(
      Effect.runPromise(
        validateReleaseManifest(
          compiled,
          { ...manifest, assets: [...manifest.assets].reverse() },
          digestUtf8
        )
      )
    ).rejects.toMatchObject({
      _tag: "ContentValidationError",
      stage: "closure",
      detail: expect.stringContaining("compiled asset closure")
    })
  })
})
