import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState } from "react"
import {
  LocalActionError,
  localFailureReport,
  type LocalFailureReport
} from "../../local-failure-detail.ts"
import { OfflinePackManager, OfflinePackManagerError } from "../manager.ts"
import type {
  OfflinePackDescriptor,
  OfflinePackRecord,
  OfflinePackRemovalImpact
} from "../model.ts"
import { offlinePackShellBuildFingerprintSource } from "../model.ts"

interface OfflinePackEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, OfflinePackManager>
  ) => Promise<A>
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1_024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KiB`
  return `${(bytes / 1_048_576).toFixed(1)} MiB`
}

const statusLabel = (status: OfflinePackRecord["status"]): string => {
  switch (status) {
    case "staging": return "Downloading"
    case "verifying": return "Checking download"
    case "staged": return "Downloaded and checked — not in use yet"
    case "activating": return "Checking before turning on"
    case "active": return "Ready offline"
    case "retained": return "Kept for earlier sessions"
    case "quarantined": return "Failed its check — not in use"
    case "removing": return "Removing"
  }
}

const lifecycleLabel = (lifecycle: OfflinePackDescriptor["lifecycle"]): string => {
  switch (lifecycle) {
    case "preview": return "Preview copy"
    case "published": return "Current published copy"
    case "retired": return "Retired copy"
  }
}

const ensureServiceWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    throw new LocalActionError("This browser does not support the feature (a service worker) needed for offline navigation.")
  }
  await navigator.serviceWorker.register("/sw.js", { scope: "/" })
  await navigator.serviceWorker.ready
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

export const activateOfflinePackClaim = (claimId: string) => Effect.gen(function*() {
  const manager = yield* OfflinePackManager
  return yield* manager.activate(claimId)
})

export const previewOfflinePackRemoval = (claimId: string) => Effect.gen(function*() {
  const manager = yield* OfflinePackManager
  return yield* manager.previewRemoval(claimId)
})

export const removeOfflinePackClaim = (
  claimId: string,
  confirmedHistoricalImpact: boolean
) => Effect.gen(function*() {
  const manager = yield* OfflinePackManager
  yield* manager.remove(claimId, confirmedHistoricalImpact)
})

export const OfflinePackManagerIsland = ({
  descriptor,
  runtime
}: {
  readonly descriptor: OfflinePackDescriptor
  readonly runtime: OfflinePackEffectRunner
}) => {
  const [packs, setPacks] = useState<ReadonlyArray<OfflinePackRecord>>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState("Checking what is saved on this device…")
  const [problem, setProblem] = useState<LocalFailureReport | null>(null)
  const [completion, setCompletion] = useState<string | null>(null)
  const [storage, setStorage] = useState<{
    readonly availability: "checking" | "available" | "estimate-unavailable" | "quota-limited"
    readonly persisted: boolean | null
    readonly quota: number | null
    readonly usage: number | null
  }>({ availability: "checking", persisted: null, quota: null, usage: null })
  const errorHeading = useRef<HTMLHeadingElement>(null)
  const storedPacksHeading = useRef<HTMLHeadingElement>(null)

  const run = <A,>(effect: EffectType.Effect<A, OfflinePackManagerError, OfflinePackManager>): Promise<A> =>
    runtime.runPromise(effect)

  const refresh = async (): Promise<void> => {
    const records = await run(Effect.gen(function*() {
      const manager = yield* OfflinePackManager
      return yield* manager.reconcileDescriptor(descriptor)
    }))
    setPacks(records)
  }

  const refreshStorage = async (): Promise<void> => {
    try {
      const estimate = await navigator.storage?.estimate?.()
      const persisted = await navigator.storage?.persisted?.()
      const quota = estimate?.quota ?? null
      const usage = estimate?.usage ?? null
      const required = descriptor.estimatedDownloadBytes ?? descriptor.totalBytes
      setStorage({
        availability: quota === null || usage === null
          ? "estimate-unavailable"
          : quota - usage < required
          ? "quota-limited"
          : "available",
        persisted: persisted ?? null,
        quota,
        usage
      })
    } catch {
      setStorage({
        availability: "estimate-unavailable",
        persisted: null,
        quota: null,
        usage: null
      })
    }
  }

  useEffect(() => {
    let active = true
    void refresh().then(() => {
      if (active) setNotice("Checked the downloads saved on this device. Nothing was downloaded or changed.")
    }).catch((cause: OfflinePackManagerError) => {
      if (active) setProblem(localFailureReport(cause, "Saved downloads could not be read from this device."))
    })
    void refreshStorage()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (problem !== null) errorHeading.current?.focus()
  }, [problem])

  const stage = async (target: OfflinePackDescriptor): Promise<void> => {
    setBusy(target.id)
    setProblem(null)
    setCompletion(null)
    setNotice("Downloading the study pack you requested…")
    const knownOffline = navigator.onLine === false
    try {
      if (knownOffline) throw new LocalActionError("Go online before downloading or updating.")
      await ensureServiceWorker()
      await run(Effect.gen(function*() {
        const manager = yield* OfflinePackManager
        return yield* manager.stage(target)
      }))
      await refresh()
      await refreshStorage()
      setNotice("Download complete and checked. It is not in use yet — turn it on when you are ready.")
      setCompletion("Download checked")
    } catch (cause) {
      if (cause instanceof OfflinePackManagerError && cause.reason === "quota-limited") {
        setStorage((current) => ({ ...current, availability: "quota-limited" }))
      }
      setProblem(localFailureReport(cause, "The download did not finish or failed its check. Review the download status below, then retry or remove the failed copy."))
      setNotice("Update failed — your old copy, if you had one, still works.")
      if (!knownOffline) await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
    }
  }

  const activate = async (claimId: string): Promise<void> => {
    setBusy(claimId)
    setProblem(null)
    setCompletion(null)
    try {
      await ensureServiceWorker()
      await run(activateOfflinePackClaim(claimId))
      await refresh()
      setNotice("This download is now in use for new sessions. Your previous copy was kept.")
      setCompletion("Offline copy turned on")
    } catch (cause) {
      setProblem(localFailureReport(cause, "This download could not be confirmed as ready. Review the status below before starting a new session."))
      await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
    }
  }

  const remove = async (
    pack: OfflinePackRecord,
    trigger: HTMLButtonElement
  ): Promise<void> => {
    setBusy(pack.id)
    setProblem(null)
    setCompletion(null)
    let cancelled = false
    try {
      const impact = await run(previewOfflinePackRemoval(pack.id))
      if (impact.activeSessionPins > 0) {
        setProblem({
          message: `${impact.activeSessionPins} active study ${impact.activeSessionPins === 1 ? "session still needs" : "sessions still need"} this exact download, so it cannot be removed yet.`,
          diagnostic: null
        })
        return
      }
      const confirmed = confirmRemoval(pack, impact)
      if (!confirmed) {
        cancelled = true
        setNotice("Removal canceled. Nothing changed.")
        return
      }
      await run(removeOfflinePackClaim(pack.id, impact.historicalAttempts > 0))
      await refresh()
      await refreshStorage()
      setNotice("The download was removed. Your study history stayed on this device.")
      setCompletion("Download removed")
      requestAnimationFrame(() => storedPacksHeading.current?.focus())
    } catch (cause) {
      setProblem(localFailureReport(cause, "The removal did not finish. Review the downloads still listed below before trying again."))
      await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
      if (cancelled) requestAnimationFrame(() => trigger.focus())
    }
  }

  const requestPersistence = async (): Promise<void> => {
    if (navigator.storage?.persist === undefined) {
      setNotice("This browser does not support asking for kept storage.")
      return
    }
    setProblem(null)
    try {
      const persisted = await navigator.storage.persist()
      setStorage((current) => ({ ...current, persisted }))
      setNotice(persisted
        ? "The browser reports it will keep this data. That still does not back it up anywhere."
        : "The browser did not agree to keep this data; it may still delete offline data if space runs low.")
    } catch (cause) {
      setProblem(localFailureReport(
        cause,
        "The keep-this-data request failed. Existing records were not changed."
      ))
    }
  }

  const group = groupOfflinePackRecords(
    packs,
    descriptor
  )
  const { packRecords, currentShellBuildRecords } = group
  const availability = offlinePackAvailabilityState(group)
  const currentShellBuildNeedsStage = availability === "absent" ||
    availability === "retry" || availability === "update-available"
  const availableForNewSessions = descriptor.lifecycle !== "retired"
  const insufficientCapacity = storage.availability === "quota-limited"

  return (
    <div className="local-data-stack">
      {problem === null ? null : (
        <section className="local-data-error" role="alert" aria-labelledby="pack-error-heading">
          <h2 id="pack-error-heading" ref={errorHeading} tabIndex={-1}>This offline action stopped</h2>
          <p>{problem.message}</p>
          {problem.diagnostic === null ? null : (
            <details className="feedback-sources">
              <summary>Technical details</summary>
              <p><code>{problem.diagnostic}</code></p>
            </details>
          )}
        </section>
      )}
      <section className="reference-card" aria-labelledby="available-pack-heading">
        <p className="eyebrow">{lifecycleLabel(descriptor.lifecycle)} · {descriptor.locale === "en" ? "English" : descriptor.locale.toUpperCase()}</p>
        <h2 id="available-pack-heading">{descriptor.label}</h2>
        <dl className="fact-list">
          <dt>Download size</dt><dd>{formatBytes(descriptor.estimatedDownloadBytes ?? descriptor.totalBytes)}</dd>
          <dt>Included</dt><dd>{descriptor.counts.tools} tools, {descriptor.counts.questions} questions, {descriptor.counts.hazardScenes} hazard scenes</dd>
          <dt>Works with</dt><dd>{descriptor.compatibility.map((entry) => entry.label).join(", ")}</dd>
        </dl>
        <details className="source-note">
          <summary>Technical details</summary>
          <p>
            Pack version {descriptor.packVersion} · content {formatBytes(descriptor.totalBytes)} ·
            application shell {formatBytes(descriptor.applicationShellBytes ?? 0)} ·
            published {descriptor.publicationTime ?? "not yet (preview)"}
          </p>
        </details>
        <p className="source-note">Nothing downloads until you choose the button below. A finished download is checked and then waits — turning it on is always a separate step.</p>
        <div className="question-controls">
          {!availableForNewSessions ? (
            <p className="source-note">
              This release is retired. What you already saved stays on this device, but no new download is offered.
            </p>
          ) : currentShellBuildNeedsStage ? (
            <>
              {availability === "update-available" ? (
                <p className="source-note" role="status">
                  Update available: the copy saved on this device does not match the current version of the site.
                </p>
              ) : null}
              <button
                className="button button-primary"
                disabled={busy !== null || insufficientCapacity}
                onClick={() => void stage(descriptor)}
                type="button"
              >
                {availability === "retry"
                  ? "Retry the download"
                  : availability === "update-available"
                  ? "Download the update"
                  : "Download for offline use"}
              </button>
            </>
          ) : (
            currentShellBuildRecords.map((pack) => (
              <p className="source-note" key={pack.id}>
                This download is <strong>{statusLabel(pack.status).toLowerCase()}</strong> on this device.
              </p>
            ))
          )}
          {currentShellBuildRecords
            .filter((pack) =>
              availableForNewSessions &&
              pack.descriptor.lifecycle !== "retired" &&
              (pack.status === "staged" || pack.status === "retained")
            )
            .map((pack) => (
              <button
                className="button button-secondary"
                disabled={busy !== null}
                key={pack.id}
                onClick={() => void activate(pack.id)}
                type="button"
              >
                Turn on this download
              </button>
            ))}
        </div>
        {packRecords.length > currentShellBuildRecords.length ? (
          <p className="source-note">
            {packRecords.length - currentShellBuildRecords.length} earlier saved {packRecords.length - currentShellBuildRecords.length === 1 ? "copy" : "copies"} of this pack {packRecords.length - currentShellBuildRecords.length === 1 ? "remains" : "remain"} listed under “Downloads on this device.”
          </p>
        ) : null}
      </section>

      <section className="local-data-state" aria-labelledby="stored-packs-heading">
        <h2 id="stored-packs-heading" ref={storedPacksHeading} tabIndex={-1}>Downloads on this device</h2>
        {packs.length === 0 ? <p>Not downloaded. Nothing is saved for offline use yet.</p> : (
          <ul className="pack-record-list">
            {packs.map((pack) => (
              <li key={pack.id}>
                <strong>{pack.descriptor.label}</strong>
                <span>{statusLabel(pack.status)} · {formatBytes(pack.downloadedBytes)} checked</span>
                <details className="feedback-sources">
                  <summary>Technical details</summary>
                  <p>Pack version {pack.descriptor.packVersion} · device generation {pack.generation} · shell build <code>{pack.shellBuildFingerprint.slice(0, 12)}</code></p>
                </details>
                <div className="question-controls">
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" &&
                  pack.packId === descriptor.id &&
                  (pack.status === "staged" || pack.status === "retained") ? (
                    <button
                      aria-label={`Turn on this saved copy of ${pack.descriptor.label}`}
                      className="button button-primary"
                      disabled={busy !== null}
                      onClick={() => void activate(pack.id)}
                      type="button"
                    >
                      Turn on this download
                    </button>
                  ) : null}
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" &&
                  pack.packId === descriptor.id && pack.status === "quarantined" ? (
                    <button
                      aria-label={`Retry this saved copy of ${pack.descriptor.label}`}
                      className="button button-secondary"
                      disabled={busy !== null}
                      onClick={() => void stage(pack.descriptor)}
                      type="button"
                    >
                      Retry the download
                    </button>
                  ) : null}
                  {pack.status === "staged" || pack.status === "active" ||
                  pack.status === "retained" || pack.status === "quarantined" ? (
                    <button
                      className="button button-secondary"
                      disabled={busy !== null}
                      onClick={(event) => void remove(pack, event.currentTarget)}
                      type="button"
                    >
                      Preview and remove
                    </button>
                  ) : <span>Reload this page to finish this interrupted operation before choosing another action.</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="local-data-state" aria-labelledby="pack-storage-heading">
        <h2 id="pack-storage-heading">Browser storage</h2>
        <p>{storage.usage === null || storage.quota === null
          ? "The browser did not provide a storage estimate."
          : `${formatBytes(storage.usage)} used of approximately ${formatBytes(storage.quota)}.`}</p>
        {storage.availability === "estimate-unavailable" ? (
          <p className="source-note" role="status">
            Storage space could not be estimated. A save may still fail; nothing is reported as saved unless it completes.
          </p>
        ) : null}
        {insufficientCapacity ? (
          <div className="local-data-error" role="alert">
            <p>
              There does not appear to be enough space for this download, so it is turned off until space is available.
            </p>
            <p>
              <a href="#stored-packs-heading">Remove an unused download</a> or{" "}
              <a href="/settings/#export-local-data">export your local records before freeing browser storage</a>.
            </p>
          </div>
        ) : null}
        <p>{storage.persisted === true
          ? "The browser reports it will keep this data."
          : "The browser may delete offline data if space runs low."}</p>
        <button className="button button-secondary" onClick={() => void requestPersistence()} type="button">
          Ask the browser to keep this data
        </button>
      </section>
      {completion === null ? (
        <p role="status" aria-live="polite">{notice}</p>
      ) : (
        <section className="local-data-state" aria-labelledby="pack-completion-heading">
          <h2 id="pack-completion-heading">{completion}</h2>
          <p role="status" aria-live="polite">{notice}</p>
        </section>
      )}
    </div>
  )
}

const confirmRemoval = (
  pack: OfflinePackRecord,
  impact: OfflinePackRemovalImpact
): boolean => window.confirm(
  `Remove this saved copy of ${pack.descriptor.label}? ` +
  `${impact.historicalAttempts} saved attempt(s) will stay in your history, but their offline content may become unavailable. ` +
  "Your study history is not deleted."
)
