import { PostcommitScene, PrecommitScene } from "@nycustodian/content/model"
import { readdir, readFile } from "node:fs/promises"
import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import { hasValidPostcommitClosure } from "../src/hazard-player/assessment.ts"

const sceneDirectory = new URL(
  "../../../content/releases/vertical-slice/scenes/",
  import.meta.url
)

describe("released hazard scene closure", () => {
  it("accepts all 18 exact precommit/postcommit scene pairs", async () => {
    const files = (await readdir(sceneDirectory))
      .filter((file) => file.endsWith(".precommit.json"))
      .sort()

    expect(files).toHaveLength(18)
    for (const file of files) {
      const opaqueAssetId = file.slice(0, -".precommit.json".length)
      const precommit = Schema.decodeUnknownSync(PrecommitScene)(
        JSON.parse(await readFile(new URL(file, sceneDirectory), "utf8")) as unknown
      )
      const postcommit = Schema.decodeUnknownSync(PostcommitScene)(
        JSON.parse(
          await readFile(
            new URL(`${opaqueAssetId}.postcommit.json`, sceneDirectory),
            "utf8"
          )
        ) as unknown
      )
      expect(
        hasValidPostcommitClosure(precommit, postcommit),
        `${opaqueAssetId} must retain exact release closure`
      ).toBe(true)
    }
  })
})
