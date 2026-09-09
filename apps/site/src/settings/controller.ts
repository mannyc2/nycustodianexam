import { makeScreenStore } from "../screen/store.ts"
import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import type { HazardPersistence } from "../hazard-player/persistence.ts"
import {
  localFailureReport,
  type LocalFailureReport
} from "../local-failure-detail.ts"
import type { QuestionPersistence } from "../question-player/persistence.ts"
import type { ReviewPersistence } from "../review/persistence.ts"
import type { VerifiedContent } from "../verified-content.ts"
import {
  DataTransfer,
  serializeDataExport,
  type ImportPlan
} from "./data-transfer.ts"
import {
  SitePreferencesRecord,
  defaultSitePreferences,
  type ResetPreview,
  type ResetScope,
  type SettingsBootstrap
} from "./model.ts"
import { SettingsPersistence } from "./persistence.ts"
import { appDatabaseStores } from "../study-storage/app-database.ts"
import {
  rebuildReviewProjection,
  type ReviewRebuildReceipt
} from "./review-rebuild.ts"

type SettingsRequirements =
  | SettingsPersistence
  | DataTransfer
  | QuestionPersistence
  | HazardPersistence
  | ReviewPersistence
  | VerifiedContent

type ReviewRebuildState =
  | { readonly tag: "idle" }
  | { readonly tag: "pending" }
  | { readonly tag: "complete"; readonly receipt: ReviewRebuildReceipt }
  | { readonly tag: "recoverable_error"; readonly detail: string }

export type DisplayPreference = "largeText" | "reduceMotion"

export interface SettingsEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, SettingsRequirements>
  ) => Promise<A>
}

const loadPreferences = Effect.flatMap(SettingsPersistence, (settings) => settings.loadPreferences())

const savedWorkLabels = [
  [appDatabaseStores.questionAttempts, "question answers"],
  [appDatabaseStores.hazardAttempts, "scene responses"],
  [appDatabaseStores.reviewAcknowledgements, "finished reviews"],
  [appDatabaseStores.simulationSessions, "simulations"],
  [appDatabaseStores.printJobs, "print jobs"]
] as const

const loadSavedWork = Effect.fn("Settings.loadSavedWork")(function*() {
  const settings = yield* SettingsPersistence
  const preview = yield* settings.previewReset("study-events")
  const counts = new Map(preview.stores.map((store) => [store.name, store.records]))
  return savedWorkLabels.map(([store, label]) => {
    const count = counts.get(store) ?? 0
    return `${count} ${count === 1 ? label.slice(0, -1) : label}`
  }).join(" · ")
})

export interface SettingsState {
  readonly preferences: SitePreferencesRecord
  readonly preferenceRead: "loading" | "ready" | "unavailable"
  readonly preferenceStatus: Partial<Record<DisplayPreference, LocalFailureReport>>
  readonly dataAction: "import" | "delete" | null
  readonly includeDrafts: boolean
  readonly importText: string | null
  readonly importPlan: ImportPlan | null
  readonly importConfirmed: boolean
  readonly resetScope: ResetScope
  readonly resetPreview: ResetPreview | null
  readonly resetConfirmed: boolean
  readonly reviewRebuild: ReviewRebuildState
  readonly savedWork: string
  readonly busy: boolean
  readonly notice: string
  readonly problem: LocalFailureReport | null
  readonly completion: string | null
}
export type SettingsFocus = "problem" | "importPreview" | "resetPreview" | "completion" | "rebuildError" | "rebuildResult" | "action" | "deleteTrigger" | DisplayPreference
export interface SettingsBrowserCapabilities {
  readonly applyPreferences: (preferences: SitePreferencesRecord) => string | null
  readonly download: (text: string, exportedAt: number) => void
}
export interface SettingsImportFile {
  readonly size: number
  readonly text: () => Promise<string>
}
export const createSettingsController = (bootstrap: SettingsBootstrap, runtime: SettingsEffectRunner, browser: SettingsBrowserCapabilities) => {
  const screen = makeScreenStore<SettingsState, SettingsFocus>({ requestIdPrefix: "settings-", initialState: {
    preferences: defaultSitePreferences(),
    preferenceRead: "loading",
    preferenceStatus: {},
    dataAction: null,
    includeDrafts: false,
    importText: null,
    importPlan: null,
    importConfirmed: false,
    resetScope: "study-events",
    resetPreview: null,
    resetConfirmed: false,
    reviewRebuild: { tag: "idle" },
    savedWork: "Checking saved work…",
    busy: false,
    notice: "Loading local settings…",
    problem: null,
    completion: null,
  } })
  let active = true
  let started = false
  let importFileGeneration = 0
  let summaryGeneration = 0
  let lastAuthoritativePreferences = screen.getSnapshot().state.preferences
  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K] | ((current: SettingsState[K]) => SettingsState[K])): void => {
    if (!active) return
    const snapshot = screen.getSnapshot()
    const state = snapshot.state
    const pendingFocus = key === "savedWork" ? snapshot.focusRequest?.target : undefined
    screen.publish({ ...state, [key]: typeof value === "function" ? value(state[key]) : value },
      pendingFocus === undefined ? undefined : { focus: pendingFocus })
  }
  const focus = (target: SettingsFocus): void => screen.publish(screen.getSnapshot().state, { focus: target })
  const canOperate = (): boolean => active && !screen.getSnapshot().state.busy && screen.getSnapshot().state.preferenceRead !== "loading"
  const applySavedPreferences = (stored: SitePreferencesRecord): string | null => {
    if (!active) return null
    lastAuthoritativePreferences = stored
    set("preferences", stored)
    return browser.applyPreferences(stored)
  }
  const refreshSavedWork = (): void => {
    if (!active) return
    const generation = ++summaryGeneration
    set("savedWork", "Checking saved work…")
    if (screen.getSnapshot().state.busy) return
    void runtime.runPromise(loadSavedWork()).then((summary) => {
      if (active && generation === summaryGeneration) set("savedWork", summary)
    }, () => {
      if (active && generation === summaryGeneration) set("savedWork", "Saved-work counts unavailable. This does not mean your work is gone.")
    })
  }
  const beginOperation = (): void => {
    set("busy", true)
    set("problem", null)
    set("completion", null)
    refreshSavedWork()
  }
  const finishOperation = (target?: SettingsFocus): void => {
    if (!active) return
    set("busy", false)
    refreshSavedWork()
    const state = screen.getSnapshot().state
    if (target === "largeText" || target === "reduceMotion") focus(target)
    else if (state.problem !== null) focus("problem")
    else if (target !== undefined) focus(target)
    else if (state.completion !== null) focus("completion")
  }
  const savePreference = async (field: DisplayPreference, value: boolean): Promise<void> => {
    const { preferenceRead } = screen.getSnapshot().state
    if (!canOperate() || preferenceRead !== "ready") return
    set("busy", true)
    refreshSavedWork()
    const next = new SitePreferencesRecord({ ...lastAuthoritativePreferences, [field]: value })
    set("preferences", next)
    const report = (message: string, diagnostic: string | null = null): void => {
      set("preferenceStatus", (current) => ({ ...current, [field]: { message, diagnostic } }))
    }
    report("Saving on this device…")
    try {
      const saved = await runtime.runPromise(Effect.flatMap(SettingsPersistence,
        (settings) => settings.savePreferences(next)))
      const mirrorDetail = applySavedPreferences(saved)
      report(mirrorDetail === null
        ? "Saved on this device."
        : `Saved on this device; applied in this tab. ${mirrorDetail}`)
    } catch (cause) {
      if (!active) return
      const writeFailure = localFailureReport(cause, "Preference save failed.")
      try {
        const stored = await runtime.runPromise(loadPreferences)
        const mirrorDetail = applySavedPreferences(stored)
        report(`${writeFailure.message} Your saved choices were restored.` +
            (mirrorDetail === null ? "" : ` ${mirrorDetail}`),
          writeFailure.diagnostic)
      } catch (restoreCause) {
        console.error("Unable to reload the saved preferences", restoreCause)
        const mirrorDetail = applySavedPreferences(lastAuthoritativePreferences)
        report(`${writeFailure.message} Reload failed too; your last saved choices are shown.` +
            (mirrorDetail === null ? "" : ` ${mirrorDetail}`),
          writeFailure.diagnostic)
      }
    } finally {
      finishOperation(field)
    }
  }

  const exportData = async (): Promise<void> => {
    const { includeDrafts } = screen.getSnapshot().state
    if (!canOperate()) return
    beginOperation()
    try {
      const envelope = await runtime.runPromise(Effect.flatMap(DataTransfer,
        (transfer) => transfer.createExport(includeDrafts)))
      if (!active) return
      browser.download(serializeDataExport(envelope), envelope.payload.exportedAt)
      set("notice", `Export ready: ${envelope.payload.questionAttempts.length + envelope.payload.hazardAttempts.length + envelope.payload.reviewAcknowledgements.length} event records. Correction drafts ${includeDrafts ? "included" : "excluded"}.`)
      set("completion", "Export ready")
    } catch (cause) {
      set("problem", localFailureReport(cause, "Export failed. Saved data is unchanged."))
    } finally {
      finishOperation()
    }
  }

  const chooseImportFile = async (file: SettingsImportFile | undefined): Promise<void> => {
    if (!canOperate()) return
    const generation = ++importFileGeneration
    set("importPlan", null)
    set("importConfirmed", false)
    set("completion", null)
    set("problem", null)
    set("importText", null)
    if (file === undefined) {
      return
    }
    if (file.size > 10 * 1_024 * 1_024) {
      set("problem", { message: "Import files are limited to 10 MiB.", diagnostic: null })
      set("importText", null)
      focus("problem")
      return
    }
    try {
      const text = await file.text()
      if (!active || generation !== importFileGeneration) return
      set("importText", text)
      set("notice", "File loaded. Preview it before importing; nothing is saved yet.")
    } catch (cause) {
      if (!active || generation !== importFileGeneration) return
      set("problem", localFailureReport(
        cause,
        "File read failed. Choose the export again."
      ))
      focus("problem")
    }
  }

  const previewImport = async (): Promise<void> => {
    const { importText } = screen.getSnapshot().state
    if (importText === null) return
    if (!canOperate()) return
    beginOperation()
    try {
      const plan = await runtime.runPromise(Effect.flatMap(DataTransfer,
        (transfer) => transfer.previewImport(importText, bootstrap.trustedReleaseContentRegistry)))
      set("importPlan", plan)
      set("importConfirmed", false)
      set("notice", "File checked. Review the preview; nothing is saved yet.")
    } catch (cause) {
      set("problem", localFailureReport(cause, "File check failed. Nothing imported."))
      set("importPlan", null)
    } finally {
      finishOperation(screen.getSnapshot().state.importPlan === null ? undefined : "importPreview")
    }
  }

  const applyImport = async (): Promise<void> => {
    const { importPlan, importConfirmed } = screen.getSnapshot().state
    if (importPlan === null || !importConfirmed) return
    if (!canOperate()) return
    beginOperation()
    let importApplied = false
    try {
      const result = await runtime.runPromise(Effect.flatMap(DataTransfer,
        (transfer) => transfer.applyImport(importPlan, bootstrap.trustedReleaseContentRegistry)))
      if (!active) return
      importApplied = true
      set("notice", `Import saved: ${result.imported} added, ${result.matched} already present, ${result.quarantined} set aside. Existing records kept.`)
      set("importPlan", null)
      set("importText", null)
      set("importConfirmed", false)
      const loaded = await runtime.runPromise(loadPreferences)
      const mirrorDetail = applySavedPreferences(loaded)
      set("preferenceRead", "ready")
      set("preferenceStatus", {})
      if (mirrorDetail !== null) {
        set("notice", (current) => `${current} ${mirrorDetail} Imported preferences remain authoritative.`)
      }
      set("completion", "Import complete")
    } catch (cause) {
      if (importApplied) {
        set("preferenceRead", "unavailable")
        set("preferenceStatus", {})
      }
      set("problem", localFailureReport(
        cause,
        importApplied
          ? "Import saved. Preferences could not reload; reload this page before changing them."
          : "Import failed. Existing records are unchanged."
      ))
    } finally {
      finishOperation()
    }
  }

  const rebuildReviewQueue = async (): Promise<void> => {
    if (!canOperate()) return
    beginOperation()
    set("reviewRebuild", { tag: "pending" })
    try {
      const receipt = await runtime.runPromise(
        rebuildReviewProjection(bootstrap.reviewQueue)
      )
      set("reviewRebuild", { tag: "complete", receipt })
    } catch (cause) {
      console.error("Unable to rebuild the review queue", cause)
      set("reviewRebuild", {
        tag: "recoverable_error",
        detail: "Could not rebuild from this device’s storage."
      })
    } finally {
      finishOperation(screen.getSnapshot().state.reviewRebuild.tag === "complete" ? "rebuildResult" : "rebuildError")
    }
  }

  const previewResetOperation = async (): Promise<void> => {
    const { resetScope } = screen.getSnapshot().state
    if (!canOperate()) return
    beginOperation()
    try {
      const preview = await runtime.runPromise(Effect.flatMap(SettingsPersistence,
        (settings) => settings.previewReset(resetScope)))
      set("resetPreview", preview)
      set("resetConfirmed", false)
      set("notice", "Delete preview ready. Nothing changed.")
    } catch (cause) {
      set("problem", localFailureReport(cause, "Could not preview deletion. Nothing changed."))
    } finally {
      finishOperation(screen.getSnapshot().state.resetPreview === null ? undefined : "resetPreview")
    }
  }

  const applyReset = async (): Promise<void> => {
    const { resetPreview, resetConfirmed } = screen.getSnapshot().state
    if (resetPreview === null || !resetConfirmed) return
    if (!canOperate()) return
    beginOperation()
    try {
      const receipt = await runtime.runPromise(Effect.flatMap(SettingsPersistence,
        (settings) => settings.reset(resetPreview)))
      set("notice", `Delete complete: ${receipt.records} record(s) removed. Offline downloads unchanged.`)
      set("resetPreview", null)
      set("resetConfirmed", false)
      if (resetPreview.scope === "preferences" || resetPreview.scope === "all-portable-data") {
        const mirrorDetail = applySavedPreferences(defaultSitePreferences())
        set("preferenceRead", "ready")
        set("preferenceStatus", {})
        if (mirrorDetail !== null) {
          set("notice", (current) => `${current} ${mirrorDetail} Defaults applied in this tab.`)
        }
      }
      set("completion", "Delete complete")
    } catch (cause) {
      set("problem", localFailureReport(cause, "Delete failed. Records outside the preview were not touched."))
    } finally {
      finishOperation()
    }
  }

  const edit = <K extends "includeDrafts" | "importConfirmed" | "resetConfirmed">(key: K, value: SettingsState[K]): void => {
    if (canOperate()) set(key, value)
  }
  return {
    getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe, acknowledgeRequest: screen.acknowledgeRequest,
    refreshSavedWork,
    actions: {
      savePreference, exportData, chooseImportFile, previewImport, applyImport,
      rebuildReviewQueue, previewResetOperation, applyReset,
      setIncludeDrafts: (value: boolean) => edit("includeDrafts", value),
      setImportConfirmed: (value: boolean) => edit("importConfirmed", value),
      setResetConfirmed: (value: boolean) => edit("resetConfirmed", value),
      setDataAction: (value: "import" | "delete") => {
        if (!canOperate()) return
        set("dataAction", value)
        focus("action")
      },
      setResetScope: (scope: ResetScope) => {
        if (!canOperate()) return
        set("resetScope", scope)
        set("resetPreview", null)
        set("resetConfirmed", false)
      },
      cancelReset: () => {
        if (!canOperate()) return
        set("resetPreview", null)
        set("resetConfirmed", false)
        set("dataAction", null)
        focus("deleteTrigger")
      }
    },
    start: () => {
      if (started || !active) return
      started = true
      refreshSavedWork()
      void runtime.runPromise(loadPreferences).then((stored) => {
        if (!active) return
        set("preferenceRead", "ready")
        const detail = applySavedPreferences(stored)
        set("notice", (stored.updatedAt === 0 ? "Default preferences are shown." : "Your saved preferences loaded.") +
          (detail === null ? "" : ` ${detail} Saved preferences remain authoritative.`))
      }, (cause) => {
        if (!active) return
        set("preferenceRead", "unavailable")
        set("notice", "Preferences unavailable. Saved-work controls remain available.")
        set("problem", localFailureReport(cause, "Saved settings could not be read."))
        focus("problem")
      })
    },
    dispose: () => { active = false; importFileGeneration += 1; summaryGeneration += 1; screen.dispose() }
  }
}
export type SettingsController = ReturnType<typeof createSettingsController>
