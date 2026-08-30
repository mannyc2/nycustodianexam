import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { Schema } from "effect"
import {
  LegacyPostcommitScene,
  PostcommitScene,
  ReleasedPostcommitScene
} from "../src/model.ts"

const decodeLegacyScene = Schema.decodeUnknownSync(
  LegacyPostcommitScene,
  { onExcessProperty: "error" }
)
const decodeCurrentScene = Schema.decodeUnknownSync(
  PostcommitScene,
  { onExcessProperty: "error" }
)
const decodeReleasedScene = Schema.decodeUnknownSync(
  ReleasedPostcommitScene,
  { onExcessProperty: "error" }
)

const readFixture = async (name: string): Promise<{ readonly text: string; readonly json: unknown }> => {
  const text = await readFile(
    fileURLToPath(new URL(`fixtures/legacy-scenes/${name}`, import.meta.url)),
    "utf8"
  )
  return { text, json: JSON.parse(text) as unknown }
}

describe("released postcommit scene compatibility", () => {
  it.each([
    [
      "s001.postcommit.json",
      "8c86b391298a92ca1e35a590a0b4831c2fe50947d7d21e9ed9f366508cc8b196",
      "positive"
    ],
    [
      "s017.postcommit.json",
      "876b9af494d7525c4a65dbf2101843ca2a5051680517c4b9da76e9cadb1c30e3",
      "zero-hazard"
    ]
  ] as const)("decodes the exact legacy fixture %s", async (name, expectedSha256, kind) => {
    const fixture = await readFixture(name)
    expect(createHash("sha256").update(fixture.text).digest("hex")).toBe(expectedSha256)
    expect(decodeLegacyScene(fixture.json)).toMatchObject({ kind })
    expect(decodeReleasedScene(fixture.json)).toMatchObject({ kind })
    expect(() => decodeCurrentScene(fixture.json)).toThrow()
  })

  it("decodes the tagged version-2 semantic scene through the current-first release union", () => {
    const current = {
      schemaVersion: 2,
      version: 2,
      id: "scene.zero.example",
      opaqueAssetId: "s999",
      kind: "zero-hazard",
      hazardFamily: null,
      tags: {
        domain: "health-and-safety",
        family: "hazard-scene",
        environment: "classroom",
        hazardCategory: null,
        seriesScope: "entry-level-custodians-janitors",
        editorialDifficulty: "application"
      },
      targets: [],
      decoys: [{
        id: "decoy-1",
        zone: "central floor",
        polygons: [[[0.1, 0.1], [0.2, 0.1], [0.2, 0.2]]],
        observableCondition: "An intact object is outside the walking route.",
        conceptIds: ["clear-route"],
        suspiciousBecause: "Its position near the floor can initially draw attention.",
        safeAsDepictedClaimId: "claim.scene.zero.example.decoy-1.safe",
        unsafeIfClaimId: "claim.scene.zero.example.decoy-1.unsafe-if"
      }],
      safeBackground: [],
      claims: [{
        id: "claim.scene.zero.example.decoy-1.safe",
        text: "The object is outside the walking route.",
        sourceLineIds: ["line.scene.zero.example"],
        evidenceTier: "official-primary",
        caveat: null
      }, {
        id: "claim.scene.zero.example.decoy-1.unsafe-if",
        text: "It would be unsafe if it entered the walking route.",
        sourceLineIds: ["line.scene.zero.example"],
        evidenceTier: "official-primary",
        caveat: null
      }],
      sources: [{
        id: "line.scene.zero.example",
        sourceId: "OSHA_FLOOR",
        title: "29 CFR 1910.22 — General requirements",
        publisher: "Occupational Safety and Health Administration",
        evidenceTier: "official-primary",
        version: "OSHA page accessed 2026-08-30",
        rightsNotes: "Project-authored paraphrase; the official source controls.",
        locator: "1910.22(a)(3)",
        excerpt: "Walking-working surfaces must remain free of hazards.",
        language: "en",
        verifiedOn: "2026-08-30",
        supportedClaimIds: [
          "claim.scene.zero.example.decoy-1.safe",
          "claim.scene.zero.example.decoy-1.unsafe-if"
        ],
        scope: "Federal general-industry walking-surface requirements.",
        sourceLocator: "1910.22(a) and (d)",
        url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.22"
      }]
    }

    expect(decodeCurrentScene(current)).toMatchObject({ schemaVersion: 2, version: 2 })
    expect(decodeReleasedScene(current)).toMatchObject({ schemaVersion: 2, version: 2 })
  })
})
