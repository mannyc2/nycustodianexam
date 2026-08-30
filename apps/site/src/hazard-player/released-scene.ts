import {
  LegacyPostcommitScene as LegacyPostcommitSceneSchema,
  PostcommitScene as PostcommitSceneSchema,
  ReleasedPostcommitScene as ReleasedPostcommitSceneSchema
} from "@nycustodian/content/model"

export type LegacyPostcommitScene = typeof LegacyPostcommitSceneSchema.Type
export type PostcommitScene = typeof PostcommitSceneSchema.Type
export type ReleasedPostcommitScene = typeof ReleasedPostcommitSceneSchema.Type

export interface HazardSceneRegion {
  readonly inventoryId: string
  readonly polygons: ReadonlyArray<ReadonlyArray<readonly [number, number]>>
}

export interface HazardZonedStatement {
  readonly zone: string
  readonly role: "target" | "decoy" | "safe-background"
  readonly statement: string
}

export const isCurrentPostcommitScene = (
  payload: ReleasedPostcommitScene
): payload is PostcommitScene => "schemaVersion" in payload && payload.schemaVersion === 2

export const targetRegionsForScene = (
  payload: ReleasedPostcommitScene
): ReadonlyArray<HazardSceneRegion> => isCurrentPostcommitScene(payload)
  ? payload.targets.map((target) => ({
      inventoryId: target.id,
      polygons: target.polygons
    }))
  : payload.targetRegions

export const decoyRegionsForScene = (
  payload: ReleasedPostcommitScene
): ReadonlyArray<HazardSceneRegion> => isCurrentPostcommitScene(payload)
  ? payload.decoys.map((decoy) => ({
      inventoryId: decoy.id,
      polygons: decoy.polygons
    }))
  : payload.decoyRegions

export const targetFeedbackForScene = (
  payload: ReleasedPostcommitScene,
  inventoryId: string | undefined
): { readonly observableCondition: string; readonly immediateCorrection: string } | undefined => {
  if (inventoryId === undefined) return undefined
  if (isCurrentPostcommitScene(payload)) {
    const target = payload.targets.find((candidate) => candidate.id === inventoryId)
    if (target === undefined) return undefined
    return {
      observableCondition: target.observableCondition,
      immediateCorrection: payload.claims.find(
        (claim) => claim.id === target.immediateCorrectionClaimId
      )?.text ?? "The released correction is unavailable."
    }
  }
  const target = payload.targets.find((candidate) => candidate.id === inventoryId)
  return target === undefined
    ? undefined
    : {
        observableCondition: target.condition,
        immediateCorrection: target.correction
      }
}

export const decoyFeedbackForScene = (
  payload: ReleasedPostcommitScene,
  inventoryId: string | undefined
): { readonly observableCondition: string; readonly safeAsDepicted: string } | undefined => {
  if (inventoryId === undefined) return undefined
  if (isCurrentPostcommitScene(payload)) {
    const decoy = payload.decoys.find((candidate) => candidate.id === inventoryId)
    if (decoy === undefined) return undefined
    return {
      observableCondition: decoy.observableCondition,
      safeAsDepicted: payload.claims.find(
        (claim) => claim.id === decoy.safeAsDepictedClaimId
      )?.text ?? "The released explanation is unavailable."
    }
  }
  const decoy = payload.decoys.find((candidate) => candidate.id === inventoryId)
  return decoy === undefined
    ? undefined
    : {
        observableCondition: decoy.condition,
        safeAsDepicted: decoy.safeBecause
      }
}

const currentClaimText = (payload: PostcommitScene, claimId: string): string =>
  payload.claims.find((claim) => claim.id === claimId)?.text ??
  "The released evidence claim is unavailable."

/**
 * Derives the post-submission text equivalent from the canonical v2 facts.
 * The legacy branch is deliberately returned byte-for-byte as authored in the
 * historical release rather than being upgraded or reinterpreted.
 */
export const zonedStatementsForScene = (
  payload: ReleasedPostcommitScene
): ReadonlyArray<HazardZonedStatement> => {
  if (!isCurrentPostcommitScene(payload)) return payload.nonvisualZonedEquivalent

  return [
    ...payload.targets.map((target) => ({
      zone: target.zone,
      role: "target" as const,
      statement: [
        target.observableCondition,
        `Why unsafe: ${currentClaimText(payload, target.whyUnsafeClaimId)}`,
        `Likely consequence: ${currentClaimText(payload, target.likelyConsequenceClaimId)}`,
        `Immediate correction: ${currentClaimText(payload, target.immediateCorrectionClaimId)}`
      ].join(" ")
    })),
    ...payload.decoys.map((decoy) => ({
      zone: decoy.zone,
      role: "decoy" as const,
      statement: [
        decoy.observableCondition,
        `Why it may look suspicious: ${decoy.suspiciousBecause}`,
        `Safe as depicted: ${currentClaimText(payload, decoy.safeAsDepictedClaimId)}`,
        `Condition that would make it unsafe: ${currentClaimText(payload, decoy.unsafeIfClaimId)}`
      ].join(" ")
    })),
    ...payload.safeBackground.map((detail) => ({
      zone: detail.zone,
      role: "safe-background" as const,
      statement: detail.observableCondition
    }))
  ]
}

export const targetZonesForScene = (
  payload: ReleasedPostcommitScene
): ReadonlySet<string> => new Set(
  isCurrentPostcommitScene(payload)
    ? payload.targets.map((target) => target.zone)
    : payload.nonvisualZonedEquivalent
        .filter((statement) => statement.role === "target")
        .map((statement) => statement.zone)
)

export const decoyZonesForScene = (
  payload: ReleasedPostcommitScene
): ReadonlySet<string> => new Set(
  isCurrentPostcommitScene(payload)
    ? payload.decoys.map((decoy) => decoy.zone)
    : payload.nonvisualZonedEquivalent
        .filter((statement) => statement.role === "decoy")
        .map((statement) => statement.zone)
)
