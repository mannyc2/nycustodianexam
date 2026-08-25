import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState } from "react"
import { localFailureDetail } from "../../local-failure-detail.ts"
import { OfflinePackManager, type OfflinePackManagerError } from "../manager.ts"
import type {
  OfflinePackDescriptor,
  OfflinePackRecord,
  OfflinePackRemovalImpact
} from "../model.ts"

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
    readonly persisted: boolean | null
    readonly quota: number | null
    readonly usage: number | null
  }>({ persisted: null, quota: null, usage: null })
  const errorHeading = useRef<HTMLHeadingElement>(null)
  const completionHeading = useRef<HTMLHeadingElement>(null)

  const run = <A,>(effect: EffectType.Effect<A, OfflinePackManagerError, OfflinePackManager>): Promise<A> =>
    runtime.runPromise(effect)

  const refresh = async (): Promise<void> => {
    const records = await run(Effect.gen(function*() {
      const manager = yield* OfflinePackManager
      return yield* manager.list()
    }))
    setPacks(records)
  }

  useEffect(() => {
    let active = true
    void refresh().then(() => {
      if (active) setNotice("Pack records reconciled. No download or activation occurred.")
    }).catch((cause: OfflinePackManagerError) => {
      if (active) setProblem(cause.detail)
    })
    void (async () => {
      const estimate = await navigator.storage?.estimate?.()
      const persisted = await navigator.storage?.persisted?.()
      if (!active) return
      setStorage({
        persisted: persisted ?? null,
        quota: estimate?.quota ?? null,
        usage: estimate?.usage ?? null
      })
    })().catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (problem !== null) errorHeading.current?.focus()
  }, [problem])

  useEffect(() => {
    if (completion !== null) completionHeading.current?.focus()
  }, [completion])

  const stage = async (target: OfflinePackDescriptor): Promise<void> => {
    setBusy(target.id)
    setProblem(null)
    setCompletion(null)
    setNotice("Downloading only because you explicitly requested this pack…")
    try {
      if (navigator.onLine === false) throw new Error("Go online before downloading or updating a pack.")
      await ensureServiceWorker()
      await run(Effect.gen(function*() {
        const manager = yield* OfflinePackManager
        return yield* manager.stage(target)
      }))
      await refresh()
      setNotice("Every declared object was checksum-verified. The pack is staged, not active.")
      setCompletion("Offline pack verified")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Pack staging failed."))
      setNotice("The prior active pack, if any, remains unchanged.")
      await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
    }
  }

  const activate = async (packId: string): Promise<void> => {
    setBusy(packId)
    setProblem(null)
    setCompletion(null)
    try {
      await ensureServiceWorker()
      await run(Effect.gen(function*() {
        const manager = yield* OfflinePackManager
        return yield* manager.activate(packId)
      }))
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

  const remove = async (pack: OfflinePackRecord): Promise<void> => {
    setBusy(pack.id)
    setProblem(null)
    setCompletion(null)
    try {
      const impact = await run(Effect.gen(function*() {
        const manager = yield* OfflinePackManager
        return yield* manager.previewRemoval(pack.id)
      }))
      if (impact.activeSessionPins > 0) {
        setProblem(`${impact.activeSessionPins} active session pin(s) block removal of this exact pack.`)
        return
      }
      const confirmed = confirmRemoval(pack, impact)
      if (!confirmed) {
        setNotice("Pack removal was cancelled; no bytes or records changed.")
        return
      }
      await run(Effect.gen(function*() {
        const manager = yield* OfflinePackManager
        yield* manager.remove(pack.id, impact.historicalAttempts > 0)
      }))
      await refresh()
      setNotice("The selected pack bytes and activation record were removed. Study events were retained.")
      setCompletion("Offline pack removed")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "Pack removal failed."))
      await refresh().catch(() => undefined)
    } finally {
      setBusy(null)
    }
  }

  const requestPersistence = async (): Promise<void> => {
    if (navigator.storage?.persist === undefined) {
      setNotice("This browser does not expose a durable-storage request.")
      return
    }
    const persisted = await navigator.storage.persist()
    setStorage((current) => ({ ...current, persisted }))
    setNotice(persisted
      ? "The browser reports that storage is durable. Device backup is still not implied."
      : "The browser did not grant durable storage; pack eviction remains possible.")
  }

  const current = packs.find((pack) => pack.id === descriptor.id)

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
          {current === undefined || current.status === "quarantined" ? (
            <button className="button button-primary" disabled={busy !== null} onClick={() => void stage(descriptor)} type="button">
              {current === undefined ? "Download and verify pack" : "Retry download and verification"}
            </button>
          ) : (
            <p className="source-note">This exact pack already has a durable <strong>{statusLabel(current.status).toLowerCase()}</strong> record.</p>
          )}
          {current?.status === "staged" ? (
            <button className="button button-secondary" disabled={busy !== null} onClick={() => void activate(current.id)} type="button">
              Activate verified pack
            </button>
          ) : null}
        </div>
      </section>

      <section className="local-data-state" aria-labelledby="stored-packs-heading">
        <h2 id="stored-packs-heading">Packs on this device</h2>
        {packs.length === 0 ? <p>No explicit offline pack is stored.</p> : (
          <ul className="pack-record-list">
            {packs.map((pack) => (
              <li key={pack.id}>
                <strong>{pack.descriptor.label} v{pack.descriptor.packVersion}</strong>
                <span>{statusLabel(pack.status)} · {formatBytes(pack.downloadedBytes)} verified</span>
                {pack.detail === null ? null : <span>{pack.detail}</span>}
                <div className="question-controls">
                  {pack.status === "staged" || pack.status === "retained" ? (
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
                  {pack.status === "quarantined" ? (
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
                  {pack.status === "active" ? (
                    <span>Activate another verified pack before removing this active generation.</span>
                  ) : pack.status === "staged" || pack.status === "retained" || pack.status === "quarantined" ? (
                    <button className="button button-secondary" disabled={busy !== null} onClick={() => void remove(pack)} type="button">
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
          <h2 id="pack-completion-heading" ref={completionHeading} tabIndex={-1}>{completion}</h2>
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
