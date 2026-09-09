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
    case "staged": return "Ready to turn on"
    case "activating": return "Checking before turning on"
    case "active": return "Turned on"
    case "retained": return "Kept for older work"
    case "quarantined": return "Did not pass its check"
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
  const [downloadsLoaded, setDownloadsLoaded] = useState(false)
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
  const [removalPreview, setRemovalPreview] = useState<{
    readonly pack: OfflinePackRecord
    readonly impact: OfflinePackRemovalImpact
  } | null>(null)
  const removalHeading = useRef<HTMLHeadingElement>(null)
  const removalTrigger = useRef<HTMLButtonElement | null>(null)
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
    setDownloadsLoaded(true)
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

  useEffect(() => {
    if (removalPreview !== null) removalHeading.current?.focus()
  }, [removalPreview])

  const stage = async (target: OfflinePackDescriptor): Promise<void> => {
    setRemovalPreview(null)
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
    setRemovalPreview(null)
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

  const previewRemoval = async (pack: OfflinePackRecord, trigger: HTMLButtonElement): Promise<void> => {
    setRemovalPreview(null)
    setBusy(pack.id)
    setProblem(null)
    setCompletion(null)
    removalTrigger.current = trigger
    try {
      const impact = await run(previewOfflinePackRemoval(pack.id))
      setRemovalPreview({ pack, impact })
    } catch (cause) {
      setProblem(localFailureReport(cause, "The removal preview could not be read. Nothing was removed."))
    } finally {
      setBusy(null)
    }
  }

  const keepCopy = (): void => {
    setRemovalPreview(null)
    setNotice("Removal canceled. Nothing changed.")
    requestAnimationFrame(() => removalTrigger.current?.focus())
  }

  const remove = async (): Promise<void> => {
    if (removalPreview === null || removalPreview.impact.activeSessionPins > 0) return
    const { pack, impact } = removalPreview
    setBusy(pack.id)
    setProblem(null)
    setCompletion(null)
    try {
      await run(removeOfflinePackClaim(pack.id, impact.historicalAttempts > 0))
      setRemovalPreview(null)
      await refresh()
      await refreshStorage()
      setNotice("The download was removed. Your study history stayed on this device.")
      setCompletion("Download removed")
      requestAnimationFrame(() => storedPacksHeading.current?.focus())
    } catch (cause) {
      setRemovalPreview(null)
      setProblem(localFailureReport(cause, "The removal did not finish. Review the downloads still listed below before trying again."))
      await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
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
  const availability = offlinePackAvailabilityState(group)
  const currentShellBuildNeedsStage = availability === "absent" ||
    availability === "retry" || availability === "update-available"
  const availableForNewSessions = descriptor.lifecycle !== "retired"
  const insufficientCapacity = storage.availability === "quota-limited"

  return (
    <div className="local-data-stack offline-pack-manager">
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
      <section className="pack-downloads" aria-labelledby="stored-packs-heading">
        <div className="section-header">
          <h2 id="stored-packs-heading" ref={storedPacksHeading} tabIndex={-1}>Copies on this device</h2>
          <p>Only a copy that is turned on can start new offline work. Older copies can be kept for earlier sessions.</p>
        </div>
        {!downloadsLoaded ? (
          <div className="local-data-state">
            <h3>{problem === null ? "Checking what is saved on this device" : "Saved downloads could not be checked"}</h3>
            <p>{problem === null ? "The list will appear when the check finishes." : "This does not mean there are no saved copies."}</p>
            {problem === null ? null : <>
              <p>Online reference pages remain readable. Saving practice responses requires working browser storage.</p>
              <div className="question-controls">
                <button className="button button-secondary" type="button" onClick={() => location.reload()}>Check again</button>
                <a className="button button-secondary" href="/atlas/">Read tool references</a>
              </div>
            </>}
          </div>
        ) : <>
          {packs.length === 0 && busy === null ? (
            <div className="empty-state">
              <h3 className="empty-state-heading" tabIndex={-1}>Nothing downloaded yet</h3>
              <p>Download and check a copy, then turn it on to study with no connection.</p>
              {availableForNewSessions ? <div className="empty-state-actions">
                <button className="button button-primary" disabled={insufficientCapacity} onClick={() => void stage(descriptor)} type="button">Download the {formatBytes(descriptor.estimatedDownloadBytes ?? descriptor.totalBytes)} copy</button>
              </div> : <p>This release is retired. A new download is not offered.</p>}
            </div>
          ) : null}
          {(packs.length > 0 || busy !== null) ? <ul className="pack-record-list">
            {availableForNewSessions && currentShellBuildNeedsStage && (availability !== "retry" || busy === descriptor.id) ? (
              <li data-pack-state={busy === descriptor.id ? "staging" : "available"}>
                <div className="pack-record-copy">
                  <div className="pack-record-header"><h3>{descriptor.label}</h3><span className="pack-status">{busy === descriptor.id ? "Downloading" : "Not downloaded"}</span></div>
                  <p className="pack-help">{formatBytes(descriptor.estimatedDownloadBytes ?? descriptor.totalBytes)}. {availability === "update-available" ? "A newer copy of the site is available to download and check." : "The download is checked before it can be turned on."}</p>
                  {busy === descriptor.id ? <><progress aria-label="Downloading and checking the copy" /><p className="pack-help">An interrupted download starts again from the beginning.</p></> : null}
                </div>
                {busy === descriptor.id ? null : <button className="button button-primary" disabled={busy !== null || insufficientCapacity} onClick={() => void stage(descriptor)} type="button">Download and check</button>}
              </li>
            ) : null}
            {packs.map((pack) => (
              <li key={pack.id} data-pack-state={pack.status}>
                <div className="pack-record-copy">
                  <div className="pack-record-header"><h3>{pack.descriptor.label}</h3><span className={`pack-status pack-status-${pack.status}`}>{statusLabel(pack.status)}</span></div>
                  <p className="pack-help">{formatBytes(pack.downloadedBytes)} saved. {pack.descriptor.counts.questions} questions, {pack.descriptor.counts.tools} tools and {pack.descriptor.counts.hazardScenes} hazard scenes.</p>
                  <p className="pack-help">{pack.status === "active" ? "Turned on for new offline work." : pack.status === "retained" ? "Kept for work that depends on this copy." : pack.status === "staged" ? "Checked and ready. Turn it on when you are ready to use it." : pack.status === "quarantined" ? "This copy cannot be turned on. Retrying starts the download from the beginning." : "This operation has not finished."}</p>
                  <details className="technical-details">
                    <summary>Technical details</summary>
                    <dl className="fact-list"><dt>Pack version</dt><dd>{pack.descriptor.packVersion}</dd><dt>Device generation</dt><dd>{pack.generation}</dd><dt>Shell build</dt><dd><code>{pack.shellBuildFingerprint}</code></dd></dl>
                  </details>
                </div>
                <div className="question-controls">
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" && pack.packId === descriptor.id && (pack.status === "staged" || pack.status === "retained") ? (
                    <button aria-label={`Turn on this saved copy of ${pack.descriptor.label}`} className="button button-primary" disabled={busy !== null} onClick={() => void activate(pack.id)} type="button">Turn on this copy</button>
                  ) : null}
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" && pack.packId === descriptor.id && pack.status === "quarantined" ? (
                    <button aria-label={`Retry this saved copy of ${pack.descriptor.label}`} className="button button-secondary" disabled={busy !== null || insufficientCapacity} onClick={() => void stage(pack.descriptor)} type="button">Retry the download</button>
                  ) : null}
                  {pack.status === "staged" || pack.status === "active" || pack.status === "retained" || pack.status === "quarantined" ? (
                    <button className="button button-secondary" disabled={busy !== null} onClick={(event) => void previewRemoval(pack, event.currentTarget)} type="button">Preview removal</button>
                  ) : <span>Reload this page to finish this interrupted operation before choosing another action.</span>}
                </div>
              </li>
            ))}
          </ul> : null}
        </>}
      </section>

      {removalPreview === null ? null : <section className={removalPreview.impact.activeSessionPins > 0 ? "local-data-error" : "operation-preview pack-removal-preview"} aria-labelledby="pack-removal-heading">
        <h2 id="pack-removal-heading" ref={removalHeading} tabIndex={-1}>{removalPreview.impact.activeSessionPins > 0 ? "Cannot be removed yet" : "Remove this copy?"}</h2>
        <p>{removalPreview.pack.descriptor.label}. Nothing has been removed yet.</p>
        <dl className="fact-table">
          <div><dt>Saved size</dt><dd>{formatBytes(removalPreview.pack.downloadedBytes)}</dd></div>
          <div><dt>Sessions using this copy</dt><dd>{removalPreview.impact.activeSessionPins} active session(s) need this exact copy. {removalPreview.impact.activeSessionPins > 0 ? "Finish them before removing it." : "No active session blocks removal."}</dd></div>
          <div><dt>Saved attempts</dt><dd>{removalPreview.impact.historicalAttempts} saved attempt(s) stay in your history, but their content may become unavailable offline.</dd></div>
          <div><dt>Other data</dt><dd>Your study history and settings are not deleted.</dd></div>
        </dl>
        {removalPreview.pack.status === "active" ? <p>This is the copy currently turned on. Removing it means a copy must be turned on again before starting new offline work.</p> : null}
        <details className="technical-details"><summary>Technical details</summary><p>Pack version {removalPreview.pack.descriptor.packVersion}. Device generation {removalPreview.pack.generation}.</p></details>
        <div className="question-controls">
          {removalPreview.impact.activeSessionPins > 0 ? <a className="button button-secondary" href="/practice/">Back to studying</a> : <button className="button button-danger-outline" disabled={busy !== null} onClick={() => void remove()} type="button">Remove this copy</button>}
          <button className="button button-secondary" disabled={busy !== null} onClick={keepCopy} type="button">Keep it</button>
          <a href="/settings/#export-local-data">Export my progress first</a>
        </div>
      </section>}

      <section className="home-section offline-how" id="offline-steps" aria-labelledby="offline-steps-heading">
        <div className="section-header"><h2 id="offline-steps-heading">How a copy gets onto this device</h2><p>Download, turn on, study, and remove. Each action starts with you.</p></div>
        <ol className="numbered-sections">
          <li><span className="numeral" aria-hidden="true">1</span><div><h3>Download and check</h3><p>The downloaded files are checked against the published manifest. An interrupted download must start again; a partly written copy can never be turned on.</p></div></li>
          <li><span className="numeral" aria-hidden="true">2</span><div><h3>Turn it on yourself</h3><p>A copy that passed its check waits ready and unused. Turning it on makes it available to new sessions, so a download cannot change your study copy by surprise.</p></div></li>
          <li><span className="numeral" aria-hidden="true">3</span><div><h3>Study with no connection</h3><p>Use the downloaded practice and reference content offline. A session already in progress keeps the copy it started with, even after you turn on a newer one.</p></div></li>
          <li><span className="numeral" aria-hidden="true">4</span><div><h3>Preview removal, then confirm</h3><p>Before removing a copy, read how many saved sessions and attempts depend on it and what would become unreadable. Confirmation is a separate action. Your saved attempts are kept, and a copy still needed by an active session cannot be removed.</p></div></li>
        </ol>
      </section>

      <section className="pack-contents" aria-labelledby="available-pack-heading">
        <div className="section-header"><h2 id="available-pack-heading">What this copy holds</h2><p>{lifecycleLabel(descriptor.lifecycle)}. {descriptor.locale === "en" ? "English" : descriptor.locale}.</p></div>
        <dl className="fact-table">
          <div><dt>Download size</dt><dd>{formatBytes(descriptor.estimatedDownloadBytes ?? descriptor.totalBytes)}</dd></div>
          <div><dt>Included</dt><dd>{descriptor.counts.tools} tools, {descriptor.counts.questions} questions and {descriptor.counts.hazardScenes} hazard scenes.</dd></div>
          <div><dt>Works with</dt><dd>{descriptor.compatibility.map((entry) => entry.label).join(", ")}</dd></div>
        </dl>
        <details className="technical-details"><summary>Technical details</summary>
          <dl className="fact-list"><dt>Pack version</dt><dd>{descriptor.packVersion}</dd><dt>Content</dt><dd>{formatBytes(descriptor.totalBytes)}</dd><dt>Application shell</dt><dd>{formatBytes(descriptor.applicationShellBytes ?? 0)}</dd><dt>Published</dt><dd>{descriptor.publicationTime ?? "Not yet (preview)"}</dd></dl>
        </details>
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
