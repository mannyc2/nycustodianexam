import { describe, expect, it } from "vitest"
import * as compiler from "@nycustodian/content/compiler"
import * as model from "@nycustodian/content/model"

describe("public package surface", () => {
  it("keeps the model facade explicit", () => {
    expect(Object.keys(model).sort()).toEqual([
      "AcceptedSceneAccessibility",
      "AcceptedSceneAccessibilityLedger",
      "AcceptedSceneDecoy",
      "AcceptedSceneRegionLedger",
      "AcceptedSceneRegions",
      "AcceptedSceneRelease",
      "AcceptedSceneReleaseLedger",
      "AcceptedSceneSemanticManifest",
      "AcceptedSceneSource",
      "AcceptedSceneTarget",
      "AcceptedToolRelease",
      "AcceptedToolReleaseLedger",
      "ArtifactManifestRecord",
      "ArtifactPathSegment",
      "AssetManifestRecord",
      "AuthoredContentPack",
      "AuthoredPackQuestion",
      "AuthoredPackQuestionOption",
      "AuthoredProfile",
      "AuthoredQuestion",
      "AuthoredTool",
      "CatalogArtifact",
      "CatalogTool",
      "CompiledVisualAsset",
      "ContentLocale",
      "ContentSource",
      "ContentValidationError",
      "FullSceneAccessibility",
      "FullSceneDecoy",
      "FullSceneTarget",
      "NeutralSceneAccessibility",
      "NeutralSceneZone",
      "NonvisualSceneStatement",
      "NormalizedPoint",
      "PassedQuestionReview",
      "PostcommitPackArtifact",
      "PostcommitPackQuestion",
      "PostcommitQuestion",
      "PostcommitScene",
      "PrecommitPackArtifact",
      "PrecommitPackQuestion",
      "PrecommitQuestion",
      "PrecommitScene",
      "PublicProfile",
      "QuestionOption",
      "QuestionOptionConcept",
      "QuestionOptionConceptMappings",
      "QuestionRationale",
      "RegionPolygon",
      "RegionPolygons",
      "RelativeContentPath",
      "ReleaseArtifactPath",
      "ReleaseManifest",
      "ReleasedDerivativeAsset",
      "ReleasedMasterAsset",
      "RepositoryContentPath",
      "SceneRegion",
      "SceneZone",
      "Sha256",
      "SourceReceipt"
    ])
  })

  it("keeps the compiler facade explicit", () => {
    expect(Object.keys(compiler).sort()).toEqual([
      "compileContentPack",
      "compileQuestion",
      "createReleaseManifest",
      "renderReleaseArtifacts",
      "stableJson",
      "validateQuestionOptionConceptClosure",
      "validateReleaseManifest",
      "verifyLegacyQuestionCompatibilityFixture"
    ])
  })

  it("keeps the deprecated path schema as the canonical schema identity", () => {
    expect(model.RelativeContentPath).toBe(model.RepositoryContentPath)
  })
})
