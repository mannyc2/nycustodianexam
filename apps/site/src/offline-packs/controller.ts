import { makeScreenStore } from "../screen/store.ts"
import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import {
  LocalActionError,
  localFailureReport,
  type LocalFailureReport
} from "../local-failure-detail.ts"
import { OfflinePackManager, OfflinePackManagerError } from "./manager.ts"
import type {
  OfflinePackDescriptor,
  OfflinePackRecord,
  OfflinePackRemovalImpact
} from "./model.ts"
import { offlinePackShellBuildFingerprintSource } from "./model.ts"

export interface OfflinePackEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, OfflinePackManager>
  ) => Promise<A>
}

export interface OfflinePackRecordGroup {
  readonly packRecords: ReadonlyArray<OfflinePackRecord>
  readonly currentShellBuildRecords: ReadonlyArray<OfflinePackRecord>
}

export type OfflinePackAvailabilityState =
  | "absent"
  | "current"
  | "retry"
  | "update-available"

export const offlinePackAvailabilityState = (
  group: OfflinePackRecordGroup
): OfflinePackAvailabilityState => {
  if (group.currentShellBuildRecords.length > 0) {
    return group.currentShellBuildRecords.every((pack) => pack.status === "quarantined")
      ? "retry"
      : "current"
  }
  return group.packRecords.length > 0 ? "update-available" : "absent"
}

export const groupOfflinePackRecords = (
  packs: ReadonlyArray<OfflinePackRecord>,
  descriptor: OfflinePackDescriptor
): OfflinePackRecordGroup => {
  const currentShellBuild = offlinePackShellBuildFingerprintSource(descriptor)
  const packRecords = packs.filter((pack) => pack.packId === descriptor.id)
  return {
    packRecords,
    currentShellBuildRecords: packRecords.filter((pack) =>
      offlinePackShellBuildFingerprintSource(pack.descriptor) === currentShellBuild
    )
  }
}

export const activateOfflinePackClaim = Effect.fn("Offline.activateClaim")(function*(claimId: string) {
  const manager = yield* OfflinePackManager
  return yield* manager.activate(claimId)
})

export const previewOfflinePackRemoval = Effect.fn("Offline.previewRemoval")(function*(claimId: string) {
  const manager = yield* OfflinePackManager
  return yield* manager.previewRemoval(claimId)
})

export const removeOfflinePackClaim = Effect.fn("Offline.removeClaim")(function*(
  claimId: string,
  confirmedHistoricalImpact: boolean
) {
  const manager = yield* OfflinePackManager
  yield* manager.remove(claimId, confirmedHistoricalImpact)
})

export interface OfflineStorageState {
  readonly availability: "checking" | "available" | "estimate-unavailable" | "quota-limited"
  readonly persisted: boolean | null
  readonly quota: number | null
  readonly usage: number | null
}
export interface OfflineState {
  readonly packs: ReadonlyArray<OfflinePackRecord>
  readonly downloadsLoaded: boolean
  readonly busy: string | null
  readonly persisting: boolean
  readonly notice: string
  readonly problem: LocalFailureReport | null
  readonly completion: string | null
  readonly storage: OfflineStorageState
  readonly removalPreview: { readonly pack: OfflinePackRecord; readonly impact: OfflinePackRemovalImpact } | null
}
export interface OfflineBrowserCapabilities {
  readonly online: () => boolean
  readonly ensureServiceWorker: () => Promise<void>
  readonly estimateStorage: () => Promise<{ readonly quota: number | null; readonly usage: number | null; readonly persisted: boolean | null }>
  readonly requestPersistence: () => Promise<boolean | null>
  readonly reload: () => void
}
export type OfflineFocus = "error" | "removal" | "removalTrigger" | "storedPacks"
export const createOfflineController = (descriptor: OfflinePackDescriptor, runtime: OfflinePackEffectRunner, browser: OfflineBrowserCapabilities) => {
  const screen = makeScreenStore<OfflineState, OfflineFocus>({ requestIdPrefix: "offline-", initialState: {
    packs: [], downloadsLoaded: false, busy: null, persisting: false,
    notice: "Checking what is saved on this device…", problem: null, completion: null,
    storage: { availability: "checking", persisted: null, quota: null, usage: null }, removalPreview: null
  } })
  let active = true
  let started = false
  let storageGeneration = 0
  let persistenceGeneration = 0
  const set = <K extends keyof OfflineState>(key: K, value: OfflineState[K] | ((current: OfflineState[K]) => OfflineState[K]), preserveFocus = false): void => {
    if (!active) return
    const snapshot = screen.getSnapshot()
    const state = snapshot.state
    const pendingFocus = preserveFocus || key === "storage" ? snapshot.focusRequest?.target : undefined
    screen.publish({ ...state, [key]: typeof value === "function" ? value(state[key]) : value },
      pendingFocus === undefined ? undefined : { focus: pendingFocus })
  }
  const focus = (target: OfflineFocus): void => screen.publish(screen.getSnapshot().state, { focus: target })
  const canOperate = (): boolean => active && screen.getSnapshot().state.busy === null && !screen.getSnapshot().state.persisting
  const run = <A>(effect: EffectType.Effect<A, OfflinePackManagerError, OfflinePackManager>): Promise<A> => runtime.runPromise(effect)
  const refresh = async (): Promise<void> => {
    if (!active) return
    const records = await run(Effect.flatMap(OfflinePackManager, (manager) => manager.reconcileDescriptor(descriptor)))
    set("packs", records, true)
    set("downloadsLoaded", true, true)
  }
  const refreshStorage = async (): Promise<void> => {
    if (!active) return
    const generation = ++storageGeneration
    const persistenceAtStart = persistenceGeneration
    try {
      const { quota, usage, persisted } = await browser.estimateStorage()
      if (!active || generation !== storageGeneration) return
      const required = descriptor.estimatedDownloadBytes ?? descriptor.totalBytes
      set("storage", { availability: quota === null || usage === null ? "estimate-unavailable" : quota - usage < required ? "quota-limited" : "available", quota, usage, persisted: persistenceAtStart === persistenceGeneration ? persisted : screen.getSnapshot().state.storage.persisted })
    } catch {
      if (!active || generation !== storageGeneration) return
      set("storage", { availability: "estimate-unavailable", quota: null, usage: null, persisted: persistenceAtStart === persistenceGeneration ? null : screen.getSnapshot().state.storage.persisted })
    }
  }
  const finish = (target?: OfflineFocus): void => {
    if (!active) return
    set("busy", null)
    if (screen.getSnapshot().state.problem !== null) focus("error")
    else if (target !== undefined) focus(target)
  }
  const stage = async (target: OfflinePackDescriptor): Promise<void> => {
    if (!canOperate() || !screen.getSnapshot().state.downloadsLoaded || descriptor.lifecycle === "retired" || target.lifecycle === "retired" || target.id !== descriptor.id || screen.getSnapshot().state.storage.availability === "quota-limited") return
    set("removalPreview", null)
    set("busy", target.id)
    set("problem", null)
    set("completion", null)
    set("notice", "Downloading the study pack you requested…")
    const knownOffline = !browser.online()
    try {
      if (knownOffline) throw new LocalActionError("Go online before downloading or updating.")
      await browser.ensureServiceWorker()
      if (!active) return
      await run(Effect.flatMap(OfflinePackManager, (manager) => manager.stage(target)))
      await refresh()
      await refreshStorage()
      set("notice", "Download complete and checked. It is not in use yet — turn it on when you are ready.")
      set("completion", "Download checked")
    } catch (cause) {
      if (cause instanceof OfflinePackManagerError && cause.reason === "quota-limited") {
        set("storage", (current) => ({ ...current, availability: "quota-limited" }))
      }
      set("problem", localFailureReport(cause, "The download did not finish or failed its check. Review the download status below, then retry or remove the failed copy."))
      set("notice", "Update failed — your old copy, if you had one, still works.")
      if (!knownOffline) await refresh().catch(() => undefined)
    } finally {
      finish()
    }
  }

  const activate = async (claimId: string): Promise<void> => {
    const pack = screen.getSnapshot().state.packs.find((entry) => entry.id === claimId)
    if (!canOperate() || descriptor.lifecycle === "retired" || pack === undefined || pack.descriptor.lifecycle === "retired" || pack.packId !== descriptor.id || (pack.status !== "staged" && pack.status !== "retained")) return
    set("removalPreview", null)
    set("busy", claimId)
    set("problem", null)
    set("completion", null)
    try {
      await browser.ensureServiceWorker()
      if (!active) return
      await run(activateOfflinePackClaim(claimId))
      await refresh()
      set("notice", "This download is now in use for new sessions. Your previous copy was kept.")
      set("completion", "Offline copy turned on")
    } catch (cause) {
      set("problem", localFailureReport(cause, "This download could not be confirmed as ready. Review the status below before starting a new session."))
      await refresh().catch(() => undefined)
    } finally {
      finish()
    }
  }

  const previewRemoval = async (claimId: string): Promise<void> => {
    const pack = screen.getSnapshot().state.packs.find((entry) => entry.id === claimId)
    if (!canOperate() || pack === undefined || !["staged", "active", "retained", "quarantined"].includes(pack.status)) return
    set("removalPreview", null)
    set("busy", pack.id)
    set("problem", null)
    set("completion", null)
    try {
      const impact = await run(previewOfflinePackRemoval(pack.id))
      set("removalPreview", { pack, impact })
    } catch (cause) {
      set("problem", localFailureReport(cause, "The removal preview could not be read. Nothing was removed."))
    } finally {
      finish(screen.getSnapshot().state.removalPreview === null ? undefined : "removal")
    }
  }

  const keepCopy = (): void => {
    if (!canOperate()) return
    set("removalPreview", null)
    set("notice", "Removal canceled. Nothing changed.")
    focus("removalTrigger")
  }

  const remove = async (): Promise<void> => {
    const { removalPreview } = screen.getSnapshot().state
    if (!canOperate() || removalPreview === null || removalPreview.impact.activeSessionPins > 0) return
    const { pack, impact } = removalPreview
    set("busy", pack.id)
    set("problem", null)
    set("completion", null)
    try {
      await run(removeOfflinePackClaim(pack.id, impact.historicalAttempts > 0))
      set("removalPreview", null)
      await refresh()
      await refreshStorage()
      set("notice", "The download was removed. Your study history stayed on this device.")
      set("completion", "Download removed")
    } catch (cause) {
      set("removalPreview", null)
      set("problem", localFailureReport(cause, "The removal did not finish. Review the downloads still listed below before trying again."))
      await refresh().catch(() => undefined)
    } finally {
      finish("storedPacks")
    }
  }

  const requestPersistence = async (): Promise<void> => {
    if (!canOperate()) return
    persistenceGeneration += 1
    set("persisting", true)
    set("problem", null)
    try {
      const persisted = await browser.requestPersistence()
      if (persisted === null) {
        set("notice", "This browser does not support asking for kept storage.")
        return
      }
      set("storage", (current) => ({ ...current, persisted }))
      set("notice", persisted
        ? "The browser reports it will keep this data. That still does not back it up anywhere."
        : "The browser did not agree to keep this data; it may still delete offline data if space runs low.")
    } catch (cause) {
      set("problem", localFailureReport(cause, "The keep-this-data request failed. Existing records were not changed."))
    } finally {
      set("persisting", false)
      if (active && screen.getSnapshot().state.problem !== null) focus("error")
    }
  }
  return {
    descriptor, getSnapshot: screen.getSnapshot, getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe, acknowledgeRequest: screen.acknowledgeRequest,
    actions: { stage, activate, previewRemoval, keepCopy, remove, requestPersistence,
      reload: () => { if (active) browser.reload() }
    },
    start: () => {
      if (started || !active) return
      started = true
      void refresh().then(() => {
        set("notice", "Checked the downloads saved on this device. Nothing was downloaded or changed.", true)
      }, (cause) => {
        set("problem", localFailureReport(cause, "Saved downloads could not be read from this device."))
        if (active) focus("error")
      })
      void refreshStorage()
    },
    dispose: () => { active = false; storageGeneration += 1; screen.dispose() }
  }
}
export type OfflineController = ReturnType<typeof createOfflineController>
