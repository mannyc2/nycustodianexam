import { ReleaseManifest } from "@nycustodian/content/model"
import { Schema } from "effect"
import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import {
  decodePublicDeliveryManifest,
  derivePublicDeliveryManifest
} from "../src/delivery-manifest.ts"
import {
  assertPublicDeliveryClosure,
  serializePublicDeliveryManifest
} from "../scripts/finalize-service-worker.ts"

const internalManifest = async () =>
  Schema.decodeUnknownSync(ReleaseManifest)(
    JSON.parse(
      await readFile(
        new URL("../../../content/releases/vertical-slice/manifest.json", import.meta.url),
        "utf8"
      )
    )
  )

describe("public delivery manifest", () => {
  it("derives an exact deployable subset without claiming the withheld pack", async () => {
    const internal = await internalManifest()
    const delivery = derivePublicDeliveryManifest(internal)

    expect(delivery.scope).toBe("public-delivery")
    expect(delivery.artifacts).toEqual(
      internal.artifacts.filter((artifact) => artifact.kind !== "pack-postcommit")
    )
    expect(delivery.artifacts.some((artifact) => artifact.kind === "pack-postcommit")).toBe(false)
    expect(delivery.assets).toEqual(internal.assets)
  })

  it("rejects forbidden and duplicate records instead of accepting an open closure", async () => {
    const internal = await internalManifest()
    const delivery = derivePublicDeliveryManifest(internal)
    const forbidden = internal.artifacts.find((artifact) => artifact.kind === "pack-postcommit")
    expect(forbidden).toBeDefined()

    expect(() =>
      decodePublicDeliveryManifest({
        ...delivery,
        artifacts: [...delivery.artifacts, forbidden]
      })
    ).toThrow(/non-deployable/)
    expect(() =>
      decodePublicDeliveryManifest({
        ...delivery,
        artifacts: [...delivery.artifacts, delivery.artifacts[0]]
      })
    ).toThrow(/duplicate artifact/)
  })

  it("serializes the public contract and closes it over exactly deployed files", async () => {
    const internal = await internalManifest()
    const serialized = serializePublicDeliveryManifest(internal)
    const delivery = decodePublicDeliveryManifest(JSON.parse(serialized))
    const releaseFiles = ["manifest.json", ...delivery.artifacts.map((artifact) => artifact.path)]
    const assetFiles = delivery.assets.map((asset) =>
      asset.path.replace(/^content\/assets\//, "")
    )

    expect(delivery.scope).toBe("public-delivery")
    expect(serialized).not.toBe(`${JSON.stringify(internal, null, 2)}\n`)
    expect(() => assertPublicDeliveryClosure(delivery, releaseFiles, assetFiles)).not.toThrow()
    expect(() =>
      assertPublicDeliveryClosure(delivery, [...releaseFiles, "undeclared.json"], assetFiles)
    ).toThrow(/extra \[undeclared\.json\]/)
  })
})
