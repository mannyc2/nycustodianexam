import { Schema } from "effect"

export class SitePreferencesRecord extends Schema.Class<SitePreferencesRecord>(
  "@nycustodian/site/settings/SitePreferencesRecord"
)({
  id: Schema.Literal("site-preferences"),
  schemaVersion: Schema.Literal(1),
  preferredLocale: Schema.Literals(["en", "es"]),
  lowDataMode: Schema.Boolean,
  largeText: Schema.Boolean,
  reduceMotion: Schema.Boolean,
  updatedAt: Schema.Number
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
  sceneIds: Schema.Array(Schema.NonEmptyString)
}) {}
