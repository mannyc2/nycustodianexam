import type {
  HazardMarker,
  PostcommitScene,
  PrecommitScene,
  ReleasedPostcommitScene
} from "./attempt.ts"
import {
  decoyRegionsForScene,
  isCurrentPostcommitScene,
  targetRegionsForScene,
  type HazardSceneRegion,
  type LegacyPostcommitScene
} from "./released-scene.ts"

export type MarkerAssessmentKind =
  | "hit"
  | "duplicate"
  | "decoy_false_positive"
  | "false_positive"

export interface MarkerAssessment {
  readonly marker: HazardMarker
  readonly markerNumber: number
  readonly kind: MarkerAssessmentKind
  readonly inventoryId?: string
}

export interface VisualHazardAssessment {
  readonly markers: ReadonlyArray<MarkerAssessment>
  readonly missedInventoryIds: ReadonlyArray<string>
}

export interface ZoneAssessment {
  readonly order: number
  readonly label: string
  readonly selected: boolean
}

const markerTolerance = 0.015

const pointInPolygon = (
  point: { readonly x: number; readonly y: number },
  polygon: ReadonlyArray<readonly [number, number]>
): boolean => {
  let inside = false
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const currentPoint = polygon[current]
    const previousPoint = polygon[previous]
    if (currentPoint === undefined || previousPoint === undefined) continue
    const [currentX, currentY] = currentPoint
    const [previousX, previousY] = previousPoint
    const crosses =
      currentY > point.y !== previousY > point.y &&
      point.x <
        ((previousX - currentX) * (point.y - currentY)) /
          (previousY - currentY) +
          currentX
    if (crosses) inside = !inside
  }
  return inside
}

const squaredDistanceToSegment = (
  point: { readonly x: number; readonly y: number },
  start: readonly [number, number],
  end: readonly [number, number]
): number => {
  const deltaX = end[0] - start[0]
  const deltaY = end[1] - start[1]
  if (deltaX === 0 && deltaY === 0) {
    return (point.x - start[0]) ** 2 + (point.y - start[1]) ** 2
  }
  const projected = Math.min(
    1,
    Math.max(
      0,
      ((point.x - start[0]) * deltaX + (point.y - start[1]) * deltaY) /
        (deltaX ** 2 + deltaY ** 2)
    )
  )
  const closestX = start[0] + projected * deltaX
  const closestY = start[1] + projected * deltaY
  return (point.x - closestX) ** 2 + (point.y - closestY) ** 2
}

const pointTouchesPolygon = (
  point: { readonly x: number; readonly y: number },
  polygon: ReadonlyArray<readonly [number, number]>
): boolean => {
  if (pointInPolygon(point, polygon)) return true
  const toleranceSquared = markerTolerance ** 2
  for (let index = 0; index < polygon.length; index += 1) {
    const start = polygon[index]
    const end = polygon[(index + 1) % polygon.length]
    if (
      start !== undefined &&
      end !== undefined &&
      squaredDistanceToSegment(point, start, end) <= toleranceSquared
    ) {
      return true
    }
  }
  return false
}

const markerTouchesRegion = (marker: HazardMarker, region: HazardSceneRegion): boolean =>
  region.polygons.some((polygon) => pointTouchesPolygon(marker, polygon))

export const assessVisualMarkers = (
  markers: ReadonlyArray<HazardMarker>,
  payload: ReleasedPostcommitScene
): VisualHazardAssessment => {
  const matchedTargets = new Set<string>()
  const assessments: Array<MarkerAssessment> = []
  const targetRegions = targetRegionsForScene(payload)
  const decoyRegions = decoyRegionsForScene(payload)

  markers.forEach((marker, index) => {
    const availableTarget = targetRegions.find(
      (region) =>
        !matchedTargets.has(region.inventoryId) && markerTouchesRegion(marker, region)
    )
    if (availableTarget !== undefined) {
      matchedTargets.add(availableTarget.inventoryId)
      assessments.push({
        marker,
        markerNumber: index + 1,
        kind: "hit",
        inventoryId: availableTarget.inventoryId
      })
      return
    }

    const duplicateTarget = targetRegions.find((region) =>
      markerTouchesRegion(marker, region)
    )
    if (duplicateTarget !== undefined) {
      assessments.push({
        marker,
        markerNumber: index + 1,
        kind: "duplicate",
        inventoryId: duplicateTarget.inventoryId
      })
      return
    }

    const decoy = decoyRegions.find((region) => markerTouchesRegion(marker, region))
    assessments.push(
      decoy === undefined
        ? { marker, markerNumber: index + 1, kind: "false_positive" }
        : {
            marker,
            markerNumber: index + 1,
            kind: "decoy_false_positive",
            inventoryId: decoy.inventoryId
          }
    )
  })

  return {
    markers: assessments,
    missedInventoryIds: targetRegions
      .map((region) => region.inventoryId)
      .filter((inventoryId) => !matchedTargets.has(inventoryId))
  }
}

export const assessSelectedZones = (
  selectedZoneOrders: ReadonlyArray<number>,
  scene: PrecommitScene
): ReadonlyArray<ZoneAssessment> => {
  const selected = new Set(selectedZoneOrders)
  return scene.neutralPreAnswer.zones.map((zone) => ({
    order: zone.order,
    label: zone.label,
    selected: selected.has(zone.order)
  }))
}

const exactSet = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean => {
  const leftSet = new Set(left)
  const rightSet = new Set(right)
  return leftSet.size === left.length &&
    rightSet.size === right.length &&
    leftSet.size === rightSet.size &&
    left.every((value) => rightSet.has(value))
}

const sameOrderedStrings = (
  left: ReadonlyArray<string>,
  right: ReadonlyArray<string>
): boolean => left.length === right.length && left.every((value, index) => value === right[index])

const isAbsoluteHttpsUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" &&
      parsed.hostname.length > 0 &&
      parsed.username.length === 0 &&
      parsed.password.length === 0
  } catch {
    return false
  }
}

const hasValidLegacyPostcommitClosure = (
  scene: PrecommitScene,
  payload: LegacyPostcommitScene
): boolean => {
  const targetIds = payload.targets.map((target) => target.id)
  const targetRegionIds = payload.targetRegions.map((region) => region.inventoryId)
  const decoyIds = payload.decoys.map((decoy) => decoy.id)
  const decoyRegionIds = payload.decoyRegions.map((region) => region.inventoryId)
  const sourceIds = payload.fullPostAnswer.sources.map((source) => source.id)
  const zoneLabels = scene.neutralPreAnswer.zones.map((zone) => zone.label)
  const zoneOrders = scene.neutralPreAnswer.zones.map((zone) => zone.order)
  const targetStatements = payload.nonvisualZonedEquivalent.filter(
    (statement) => statement.role === "target"
  )
  const decoyStatements = payload.nonvisualZonedEquivalent.filter(
    (statement) => statement.role === "decoy"
  )
  const safeBackgroundStatements = payload.nonvisualZonedEquivalent.filter(
    (statement) => statement.role === "safe-background"
  )
  const semanticTargetSignatures = payload.targets.map(
    (target) => `${target.condition}\u0000${target.correction}`
  )
  const fullTargetSignatures = payload.fullPostAnswer.targets.map(
    (target) => `${target.condition}\u0000${target.correction}`
  )
  const semanticDecoySignatures = payload.decoys.map(
    (decoy) => `${decoy.condition}\u0000${decoy.safeBecause}`
  )
  const fullDecoySignatures = payload.fullPostAnswer.decoys.map(
    (decoy) => `${decoy.condition}\u0000${decoy.safeBecause}`
  )
  const targetSourceIdsClose = payload.fullPostAnswer.targets.every((target) =>
    target.sourceIds.every((sourceId) => sourceIds.includes(sourceId))
  )
  const sourceUrlsAreHttps = payload.fullPostAnswer.sources.every((source) =>
    isAbsoluteHttpsUrl(source.url)
  )
  const regionsAreNormalized = [...payload.targetRegions, ...payload.decoyRegions].every(
    (region) =>
      region.polygons.every(
        (polygon) =>
          polygon.length >= 3 &&
          polygon.every(
            ([x, y]) =>
              Number.isFinite(x) &&
              x >= 0 &&
              x <= 1 &&
              Number.isFinite(y) &&
              y >= 0 &&
              y <= 1
          )
      )
  )
  const targetSourceIdsAreUnique = payload.fullPostAnswer.targets.every(
    (target) => new Set(target.sourceIds).size === target.sourceIds.length
  )
  const statementZoneLabels = [...new Set(
    payload.nonvisualZonedEquivalent.map((statement) => statement.zone)
  )]

  return payload.opaqueAssetId === scene.asset.opaqueAssetId &&
    exactSet(targetIds, targetRegionIds) &&
    exactSet(decoyIds, decoyRegionIds) &&
    exactSet(payload.sourceIds, sourceIds) &&
    new Set(zoneLabels).size === zoneLabels.length &&
    new Set(zoneOrders).size === zoneOrders.length &&
    statementZoneLabels.every((label) => zoneLabels.includes(label)) &&
    payload.nonvisualZonedEquivalent.every((statement) =>
      statement.zone.trim().length > 0 && statement.statement.trim().length > 0
    ) &&
    payload.fullPostAnswer.claim === payload.claim &&
    exactSet(semanticTargetSignatures, fullTargetSignatures) &&
    exactSet(semanticDecoySignatures, fullDecoySignatures) &&
    sameOrderedStrings(
      targetStatements.map((statement) => statement.statement),
      payload.targets.map((target) => target.condition)
    ) &&
    sameOrderedStrings(
      decoyStatements.map((statement) => statement.statement),
      payload.decoys.map((decoy) => `${decoy.condition}; ${decoy.safeBecause}.`)
    ) &&
    sameOrderedStrings(
      safeBackgroundStatements.map((statement) => statement.statement),
      payload.fullPostAnswer.safeBackground
    ) &&
    targetSourceIdsClose &&
    targetSourceIdsAreUnique &&
    sourceUrlsAreHttps &&
    regionsAreNormalized &&
    (payload.kind === "zero-hazard"
      ? payload.hazardFamily === null &&
        payload.targets.length === 0 &&
        payload.targetRegions.length === 0
      : payload.hazardFamily !== null &&
        payload.targets.length > 0 &&
        payload.targetRegions.length > 0)
}

const uniqueStrings = (values: ReadonlyArray<string>): boolean =>
  new Set(values).size === values.length

const normalizedRegions = (
  regions: ReadonlyArray<HazardSceneRegion>
): boolean => regions.every((region) =>
  region.polygons.every((polygon) =>
    polygon.length >= 3 &&
    polygon.every(([x, y]) =>
      Number.isFinite(x) && x >= 0 && x <= 1 &&
      Number.isFinite(y) && y >= 0 && y <= 1
    )
  )
)

const hasValidCurrentPostcommitClosure = (
  scene: PrecommitScene,
  payload: PostcommitScene
): boolean => {
  const targetIds = payload.targets.map((target) => target.id)
  const decoyIds = payload.decoys.map((decoy) => decoy.id)
  const inventoryIds = [...targetIds, ...decoyIds]
  const zoneLabels = scene.neutralPreAnswer.zones.map((zone) => zone.label)
  const zoneOrders = scene.neutralPreAnswer.zones.map((zone) => zone.order)
  const zonedItems = [...payload.targets, ...payload.decoys, ...payload.safeBackground]
  const safeBackgroundSignatures = payload.safeBackground.map(
    (entry) => `${entry.zone}\u0000${entry.observableCondition}`
  )
  const claimIds = payload.claims.map((claim) => claim.id)
  const referencedClaimIds = [...new Set([
    ...payload.targets.flatMap((target) => [
      target.whyUnsafeClaimId,
      target.likelyConsequenceClaimId,
      target.immediateCorrectionClaimId
    ]),
    ...payload.decoys.flatMap((decoy) => [
      decoy.safeAsDepictedClaimId,
      decoy.unsafeIfClaimId
    ])
  ])]
  const sourceLineIds = payload.sources.map((source) => source.id)
  const claimById = new Map(payload.claims.map((claim) => [claim.id, claim]))
  const sourceById = new Map(payload.sources.map((source) => [source.id, source]))
  const claimsClose = payload.claims.every((claim) =>
    uniqueStrings(claim.sourceLineIds) &&
    claim.sourceLineIds.every((sourceLineId) => {
      const source = sourceById.get(sourceLineId)
      return source !== undefined && source.supportedClaimIds.includes(claim.id)
    })
  )
  const sourcesClose = payload.sources.every((source) =>
    source.scope !== undefined &&
    source.sourceLocator !== undefined &&
    uniqueStrings(source.supportedClaimIds) &&
    (source.url === undefined || isAbsoluteHttpsUrl(source.url)) &&
    source.supportedClaimIds.every((claimId) => {
      const claim = claimById.get(claimId)
      return claim !== undefined && claim.sourceLineIds.includes(source.id)
    })
  )
  const conceptIdsAreUnique = [...payload.targets, ...payload.decoys].every(
    (item) => uniqueStrings(item.conceptIds)
  )

  return payload.opaqueAssetId === scene.asset.opaqueAssetId &&
    payload.tags.environment === scene.environment &&
    payload.tags.hazardCategory === payload.hazardFamily &&
    uniqueStrings(inventoryIds) &&
    uniqueStrings(zoneLabels) &&
    uniqueStrings(zoneOrders.map(String)) &&
    zoneOrders.every((order, index) => order === index + 1) &&
    zonedItems.every((item) => zoneLabels.includes(item.zone)) &&
    uniqueStrings(safeBackgroundSignatures) &&
    conceptIdsAreUnique &&
    normalizedRegions([
      ...targetRegionsForScene(payload),
      ...decoyRegionsForScene(payload)
    ]) &&
    uniqueStrings(claimIds) &&
    exactSet(referencedClaimIds, claimIds) &&
    uniqueStrings(sourceLineIds) &&
    claimsClose &&
    sourcesClose &&
    (payload.kind === "zero-hazard"
      ? payload.hazardFamily === null &&
        payload.tags.hazardCategory === null &&
        payload.targets.length === 0
      : payload.hazardFamily !== null &&
        payload.tags.hazardCategory !== null &&
        payload.targets.length > 0)
}

export const hasValidPostcommitClosure = (
  scene: PrecommitScene,
  payload: ReleasedPostcommitScene
): boolean => isCurrentPostcommitScene(payload)
  ? hasValidCurrentPostcommitClosure(scene, payload)
  : hasValidLegacyPostcommitClosure(scene, payload)
