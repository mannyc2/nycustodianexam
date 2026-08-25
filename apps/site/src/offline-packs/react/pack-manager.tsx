import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState } from "react"
import { localFailureDetail } from "../../local-failure-detail.ts"
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
    case "staging": return "Downloading exact objects"
    case "verifying": return "Verifying checksums and closure"
    case "staged": return "Verified and awaiting explicit activation"
    case "activating": return "Re-verifying the exact generation before activation"
    case "active": return "Active for new sessions"
    case "retained": return "Retained for pinned history"
    case "quarantined": return "Quarantined; explicit retry or removal required"
    case "removing": return "Removal in progress"
  }
}

const ensureServiceWorker = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("This browser does not expose the service-worker support required for offline navigation.")
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
  const [notice, setNotice] = useState("Reading offline-pack records on this device…")
  const [problem, setProblem] = useState<string | null>(null)
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
      if (active) setNotice("Pack records reconciled. No download or activation occurred.")
    }).catch((cause: OfflinePackManagerError) => {
      if (active) setProblem(cause.detail)
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
    setNotice("Downloading only because you explicitly requested this pack…")
    const knownOffline = navigator.onLine === false
    try {
      if (knownOffline) throw new Error("Go online before downloading or updating a pack.")
      await ensureServiceWorker()
      await run(Effect.gen(function*() {
        const manager = yield* OfflinePackManager
        return yield* manager.stage(target)
      }))
      await refresh()
      await refreshStorage()
      setNotice("Every declared object was checksum-verified. The pack is staged, not active.")
      setCompletion("Offline pack verified")
    } catch (cause) {
      if (cause instanceof OfflinePackManagerError && cause.reason === "quota-limited") {
        setStorage((current) => ({ ...current, availability: "quota-limited" }))
      }
      setProblem(localFailureDetail(cause, "Pack staging failed."))
      setNotice("The prior active pack, if any, remains unchanged.")
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
      setNotice("The verified pack is active for new sessions. The previous active pack was retained.")
      setCompletion("Offline pack activated")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Pack activation failed."))
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
        setProblem(`${impact.activeSessionPins} active session pin(s) block removal of this exact pack.`)
        return
      }
      const confirmed = confirmRemoval(pack, impact)
      if (!confirmed) {
        cancelled = true
        setNotice("Pack removal was cancelled; no bytes or records changed.")
        return
      }
      await run(removeOfflinePackClaim(pack.id, impact.historicalAttempts > 0))
      await refresh()
      await refreshStorage()
      setNotice("The selected pack bytes and activation record were removed. Study events were retained.")
      setCompletion("Offline pack removed")
      requestAnimationFrame(() => storedPacksHeading.current?.focus())
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Pack removal failed."))
      await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
      if (cancelled) requestAnimationFrame(() => trigger.focus())
    }
  }

  const requestPersistence = async (): Promise<void> => {
    if (navigator.storage?.persist === undefined) {
      setNotice("This browser does not expose a durable-storage request.")
      return
    }
    setProblem(null)
    try {
      const persisted = await navigator.storage.persist()
      setStorage((current) => ({ ...current, persisted }))
      setNotice(persisted
        ? "The browser reports that storage is durable. Device backup is still not implied."
        : "The browser did not grant durable storage; pack eviction remains possible.")
    } catch (cause) {
      setProblem(localFailureDetail(
        cause,
        "The durable-storage request failed. Existing records were not changed."
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
          <h2 id="pack-error-heading" ref={errorHeading} tabIndex={-1}>Offline-pack operation stopped</h2>
          <p>{problem}</p>
        </section>
      )}
      <section className="reference-card" aria-labelledby="available-pack-heading">
        <p className="eyebrow">{descriptor.lifecycle} · {descriptor.locale.toUpperCase()}</p>
        <h2 id="available-pack-heading">{descriptor.label}</h2>
        <dl className="fact-list">
          <dt>Version</dt><dd>{descriptor.packVersion}</dd>
          <dt>Compatibility</dt><dd>{descriptor.compatibility.map((entry) => entry.label).join(", ")}</dd>
          <dt>Content bytes</dt><dd>{formatBytes(descriptor.totalBytes)}</dd>
          <dt>Finalized application-shell bytes</dt><dd>{formatBytes(descriptor.applicationShellBytes ?? 0)}</dd>
          <dt>Estimated total download</dt><dd>{formatBytes(descriptor.estimatedDownloadBytes ?? descriptor.totalBytes)}</dd>
          <dt>Included</dt><dd>{descriptor.counts.tools} tools, {descriptor.counts.questions} questions, {descriptor.counts.hazardScenes} hazard scenes</dd>
          <dt>Publication time</dt><dd>{descriptor.publicationTime ?? "Not published; preview lifecycle"}</dd>
        </dl>
        <p className="source-note">No object downloads until you choose the button below. Downloading stages and verifies; activation is always a separate action.</p>
        <div className="question-controls">
          {!availableForNewSessions ? (
            <p className="source-note">
              This release is retired. Existing safe historical records may be retained, but no new download or activation is offered.
            </p>
          ) : currentShellBuildNeedsStage ? (
            <>
              {availability === "update-available" ? (
                <p className="source-note" role="status">
                  Update available: the current application-shell build is not stored with this content release.
                </p>
              ) : null}
              <button
                className="button button-primary"
                disabled={busy !== null || insufficientCapacity}
                onClick={() => void stage(descriptor)}
                type="button"
              >
                {availability === "retry"
                  ? "Retry download and verification"
                  : availability === "update-available"
                  ? "Download and verify update"
                  : "Download and verify pack"}
              </button>
            </>
          ) : (
            currentShellBuildRecords.map((pack) => (
              <p className="source-note" key={pack.id}>
                Device generation <code>{pack.generation}</code> has a durable <strong>{statusLabel(pack.status).toLowerCase()}</strong> record for this application-shell build.
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
                Activate verified pack
              </button>
            ))}
        </div>
        {packRecords.length > currentShellBuildRecords.length ? (
          <p className="source-note">
            {packRecords.length - currentShellBuildRecords.length} prior application-shell generation(s) for this content pack remain available under “Packs on this device.”
          </p>
        ) : null}
      </section>

      <section className="local-data-state" aria-labelledby="stored-packs-heading">
        <h2 id="stored-packs-heading" ref={storedPacksHeading} tabIndex={-1}>Packs on this device</h2>
        {packs.length === 0 ? <p>No explicit offline pack is stored.</p> : (
          <ul className="pack-record-list">
            {packs.map((pack) => (
              <li key={pack.id}>
                <strong>{pack.descriptor.label} v{pack.descriptor.packVersion}</strong>
                <span>{statusLabel(pack.status)} · {formatBytes(pack.downloadedBytes)} verified</span>
                <span>Device generation {pack.generation} · shell build {pack.shellBuildFingerprint.slice(0, 12)}</span>
                {pack.detail === null ? null : <span>{pack.detail}</span>}
                <div className="question-controls">
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" &&
                  pack.packId === descriptor.id &&
                  (pack.status === "staged" || pack.status === "retained") ? (
                    <button
                      aria-label={`Activate stored ${pack.descriptor.label} version ${pack.descriptor.packVersion}`}
                      className="button button-primary"
                      disabled={busy !== null}
                      onClick={() => void activate(pack.id)}
                      type="button"
                    >
                      Activate stored pack
                    </button>
                  ) : null}
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" &&
                  pack.packId === descriptor.id && pack.status === "quarantined" ? (
                    <button
                      aria-label={`Retry ${pack.descriptor.label} version ${pack.descriptor.packVersion}`}
                      className="button button-secondary"
                      disabled={busy !== null}
                      onClick={() => void stage(pack.descriptor)}
                      type="button"
                    >
                      Retry download and verification
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
                  ) : <span>Reload to reconcile this interrupted operation before choosing another action.</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="local-data-state" aria-labelledby="pack-storage-heading">
        <h2 id="pack-storage-heading">Browser storage diagnostics</h2>
        <p>{storage.usage === null || storage.quota === null
          ? "The browser did not provide a storage estimate."
          : `${formatBytes(storage.usage)} used of approximately ${formatBytes(storage.quota)}.`}</p>
        {storage.availability === "estimate-unavailable" ? (
          <p className="source-note" role="status">
            Storage capacity could not be estimated. A write may still fail; no successful save will be claimed unless it commits.
          </p>
        ) : null}
        {insufficientCapacity ? (
          <div className="local-data-error" role="alert">
            <p>
              Storage capacity appears insufficient for this exact download. The download is disabled until space is available.
            </p>
            <p>
              <a href="#stored-packs-heading">Inspect and remove an inactive pack</a> or{" "}
              <a href="/settings/#export-local-data">export local records before freeing browser storage</a>.
            </p>
          </div>
        ) : null}
        <p>{storage.persisted === true
          ? "The browser reports durable storage."
          : "The browser may evict offline bytes under storage pressure."}</p>
        <button className="button button-secondary" onClick={() => void requestPersistence()} type="button">
          Request durable browser storage
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
  `Remove ${pack.descriptor.label} version ${pack.descriptor.packVersion}? ` +
  `${impact.historicalAttempts} historical attempt(s) will remain, but their offline content may become unavailable. ` +
  "This does not delete study events."
)
