import { Schema } from "effect"
import { DurableTimestamp } from "../durable-values.ts"
import { ReviewQueueBootstrap } from "../review/model.ts"
import {
  TrustedReleaseContentRegistry,
  decodeTrustedReleaseContentRegistry,
  verifyTrustedHazardContent,
  verifyTrustedQuestionContent
} from "../trusted-release-content.ts"

export class SitePreferencesRecord extends Schema.Class<SitePreferencesRecord>(
  "@nycustodian/site/settings/SitePreferencesRecord"
)({
  id: Schema.Literal("site-preferences"),
  schemaVersion: Schema.Literal(1),
  preferredLocale: Schema.Literals(["en", "es"]),
  lowDataMode: Schema.Boolean,
  largeText: Schema.Boolean,
  reduceMotion: Schema.Boolean,
  updatedAt: DurableTimestamp
}) {}

export const decodeStoredSitePreferences = (record: unknown): SitePreferencesRecord => {
  const preferences = Schema.decodeUnknownSync(
    SitePreferencesRecord,
    { onExcessProperty: "error" }
  )(record)
  if (!Number.isFinite(preferences.updatedAt) || preferences.updatedAt < 0) {
    throw new Error("Saved preferences have an invalid update time")
  }
  return preferences
}

export const defaultSitePreferences = (): SitePreferencesRecord =>
  new SitePreferencesRecord({
    id: "site-preferences",
    schemaVersion: 1,
    preferredLocale: "en",
    lowDataMode: false,
    largeText: false,
    reduceMotion: false,
    updatedAt: 0
  })

export const ResetScope = Schema.Literals([
  "study-events",
  "preferences",
  "correction-drafts",
  "transfer-quarantine",
  "all-portable-data"
])

export type ResetScope = typeof ResetScope.Type

export interface ResetPreview {
  readonly scope: ResetScope
  readonly records: number
  readonly stores: ReadonlyArray<{
    readonly name: string
    readonly records: number
  }>
  readonly excludesOfflinePacks: true
}

export class SettingsBootstrap extends Schema.Class<SettingsBootstrap>(
  "@nycustodian/site/settings/SettingsBootstrap"
)({
  schemaVersion: Schema.Literal(1),
  questionIds: Schema.Array(Schema.NonEmptyString),
  sceneIds: Schema.Array(Schema.NonEmptyString),
  trustedReleaseContentRegistry: TrustedReleaseContentRegistry,
  reviewQueue: ReviewQueueBootstrap
}) {}

const sameStrings = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const decodeSettingsBootstrap = (value: unknown): SettingsBootstrap => {
  const bootstrap = Schema.decodeUnknownSync(
    SettingsBootstrap,
    { onExcessProperty: "error" }
  )(value)
  const registry = decodeTrustedReleaseContentRegistry(
    bootstrap.trustedReleaseContentRegistry
  )
  const registryQuestionIds = registry.entries
    .filter((entry) => entry.variant === "question")
    .map((entry) => entry.itemId)
  const registrySceneIds = registry.entries
    .filter((entry) => entry.variant === "hazard-visual")
    .map((entry) => entry.itemId)
  const reviewQuestionIds = bootstrap.reviewQueue.questions.map((entry) => entry.id)
  const reviewSceneIds = bootstrap.reviewQueue.scenes.map((entry) => entry.scene.id)

  if (
    new Set(bootstrap.questionIds).size !== bootstrap.questionIds.length ||
    new Set(bootstrap.sceneIds).size !== bootstrap.sceneIds.length ||
    !sameStrings(bootstrap.questionIds, registryQuestionIds) ||
    !sameStrings(bootstrap.sceneIds, registrySceneIds) ||
    !sameStrings(bootstrap.questionIds, reviewQuestionIds) ||
    !sameStrings(bootstrap.sceneIds, reviewSceneIds)
  ) {
    throw new Error(
      "Settings bootstrap content references do not close over its trusted review registry"
    )
  }

  for (const source of bootstrap.reviewQueue.questions) {
    if (source.id !== source.receipt.questionId) {
      throw new Error("Settings review question identity does not close over its receipt")
    }
    verifyTrustedQuestionContent(registry, {
      receipt: source.receipt,
      optionIds: source.optionIds
    })
  }
  for (const source of bootstrap.reviewQueue.scenes) {
    const allowedZoneOrders = source.scene.neutralPreAnswer.zones.map((zone) => zone.order)
    if (
      source.scene.id !== source.visualReceipt.sceneId ||
      source.scene.id !== source.nonvisualReceipt.sceneId
    ) {
      throw new Error("Settings review scene identity does not close over its receipts")
    }
    verifyTrustedHazardContent(registry, {
      receipt: source.visualReceipt,
      allowedZoneOrders
    })
    verifyTrustedHazardContent(registry, {
      receipt: source.nonvisualReceipt,
      allowedZoneOrders
    })
  }
  return bootstrap
}
