import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState } from "react"
import type { HazardPersistence } from "../../hazard-player/persistence.ts"
import { localFailureDetail } from "../../local-failure-detail.ts"
import type { QuestionPersistence } from "../../question-player/persistence.ts"
import type { ReviewPersistence } from "../../review/persistence.ts"
import type { VerifiedContent } from "../../verified-content.ts"
import {
  DataTransfer,
  serializeDataExport,
  type ImportPlan
} from "../data-transfer.ts"
import {
  SitePreferencesRecord,
  defaultSitePreferences,
  type ResetPreview,
  type ResetScope,
  type SettingsBootstrap
} from "../model.ts"
import { SettingsPersistence } from "../persistence.ts"
import {
  clearBootPreferences,
  saveBootPreferences
} from "../preferences-boot.ts"
import {
  rebuildReviewProjection,
  type ReviewRebuildReceipt
} from "../review-rebuild.ts"

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

interface SettingsEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, SettingsRequirements>
  ) => Promise<A>
}

export const SettingsIsland = ({
  bootstrap,
  runtime
}: {
  readonly bootstrap: SettingsBootstrap
  readonly runtime: SettingsEffectRunner
}) => {
  const [preferences, setPreferences] = useState(defaultSitePreferences)
  const lastAuthoritativePreferences = useRef(preferences)
  const [includeDrafts, setIncludeDrafts] = useState(false)
  const [importText, setImportText] = useState<string | null>(null)
  const [importPlan, setImportPlan] = useState<ImportPlan | null>(null)
  const [importConfirmed, setImportConfirmed] = useState(false)
  const [resetScope, setResetScope] = useState<ResetScope>("study-events")
  const [resetPreview, setResetPreview] = useState<ResetPreview | null>(null)
  const [resetConfirmed, setResetConfirmed] = useState(false)
  const [reviewRebuild, setReviewRebuild] = useState<ReviewRebuildState>({ tag: "idle" })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("Loading local settings…")
  const [problem, setProblem] = useState<string | null>(null)
  const [completion, setCompletion] = useState<string | null>(null)
  const problemHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const resetResultHeading = useRef<HTMLHeadingElement>(null)
  const rebuildErrorHeading = useRef<HTMLHeadingElement>(null)
  const rebuildResultHeading = useRef<HTMLHeadingElement>(null)
  const completionHeading = useRef<HTMLHeadingElement>(null)

  const synchronizeBootMirror = (stored: SitePreferencesRecord): string | null => {
    const result = stored.updatedAt === 0
      ? clearBootPreferences()
      : saveBootPreferences({
          schemaVersion: 1,
          largeText: stored.largeText,
          reduceMotion: stored.reduceMotion
        })
    return result.detail
  }

  useEffect(() => {
    let active = true
    void runtime.runPromise(Effect.gen(function*() {
      const settings = yield* SettingsPersistence
      return yield* settings.loadPreferences()
    })).then((stored) => {
      if (!active) return
      lastAuthoritativePreferences.current = stored
      setPreferences(stored)
      const mirrorDetail = synchronizeBootMirror(stored)
      setNotice((stored.updatedAt === 0
        ? "Default preferences are shown; no preference record has been saved."
        : "Saved local preferences loaded.") +
        (mirrorDetail === null ? "" : ` ${mirrorDetail} The IndexedDB preference remains authoritative.`))
    }).catch((cause) => {
      if (active) setProblem(localFailureDetail(cause, "The local-data operation failed."))
    })
    return () => {
      active = false
    }
  }, [runtime])

  useEffect(() => {
    if (problem !== null) problemHeading.current?.focus()
  }, [problem])

  useEffect(() => {
    if (importPlan !== null) resultHeading.current?.focus()
  }, [importPlan])

  useEffect(() => {
    if (resetPreview !== null) resetResultHeading.current?.focus()
  }, [resetPreview])

  useEffect(() => {
    if (completion !== null) completionHeading.current?.focus()
  }, [completion])

  useEffect(() => {
    if (reviewRebuild.tag === "recoverable_error") rebuildErrorHeading.current?.focus()
    if (reviewRebuild.tag === "complete") rebuildResultHeading.current?.focus()
  }, [reviewRebuild])

  const savePreferences = async (): Promise<void> => {
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    try {
      const saved = await runtime.runPromise(Effect.gen(function*() {
        const settings = yield* SettingsPersistence
        return yield* settings.savePreferences(preferences)
      }))
      lastAuthoritativePreferences.current = saved
      setPreferences(saved)
      const mirror = saveBootPreferences({
        schemaVersion: 1,
        largeText: saved.largeText,
        reduceMotion: saved.reduceMotion
      })
      setNotice(mirror.mirrored
        ? "Preferences saved in IndexedDB on this device."
        : `Preferences saved in IndexedDB and applied in this tab. ${mirror.detail} Cross-tab and early reload application may be delayed.`)
      setCompletion("Preferences saved")
    } catch (cause) {
      const writeFailure = localFailureDetail(cause, "The local-data operation failed.")
      try {
        const stored = await runtime.runPromise(Effect.gen(function*() {
          const settings = yield* SettingsPersistence
          return yield* settings.loadPreferences()
        }))
        lastAuthoritativePreferences.current = stored
        setPreferences(stored)
        const mirrorDetail = synchronizeBootMirror(stored)
        setProblem(
          `${writeFailure} The unsaved choices were discarded; controls and applied preferences ` +
          "were restored from authoritative IndexedDB storage." +
          (mirrorDetail === null
            ? ""
            : ` ${mirrorDetail} The IndexedDB preference remains authoritative.`)
        )
      } catch (restoreCause) {
        const stored = lastAuthoritativePreferences.current
        setPreferences(stored)
        const mirrorDetail = synchronizeBootMirror(stored)
        setProblem(
          `${writeFailure} ` +
          localFailureDetail(
            restoreCause,
            "The authoritative IndexedDB preferences could not be restored."
          ) +
          " Controls and applied preferences were restored from the last known authoritative " +
          "IndexedDB snapshot." +
          (mirrorDetail === null
            ? ""
            : ` ${mirrorDetail} The last known IndexedDB preference remains authoritative.`)
        )
      }
    } finally {
      setBusy(false)
    }
  }

  const exportData = async (): Promise<void> => {
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    try {
      const envelope = await runtime.runPromise(Effect.gen(function*() {
        const transfer = yield* DataTransfer
        return yield* transfer.createExport(includeDrafts)
      }))
      const blob = new Blob([serializeDataExport(envelope)], { type: "application/json" })
      const href = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = href
      anchor.download = `nycustodian-local-data-${new Date(envelope.payload.exportedAt).toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(href)
      setNotice(`Export prepared with ${envelope.payload.questionAttempts.length + envelope.payload.hazardAttempts.length + envelope.payload.reviewAcknowledgements.length} event records. Correction drafts were ${includeDrafts ? "included by explicit choice" : "excluded"}.`)
      setCompletion("Validated export ready")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "The local-data operation failed."))
    } finally {
      setBusy(false)
    }
  }

  const chooseImportFile = async (file: File | undefined): Promise<void> => {
    setImportPlan(null)
    setImportConfirmed(false)
    setCompletion(null)
    if (file === undefined) {
      setImportText(null)
      return
    }
    if (file.size > 10 * 1_024 * 1_024) {
      setProblem("Import files are limited to 10 MiB before parsing.")
      setImportText(null)
      return
    }
    setImportText(await file.text())
    setNotice("File loaded locally. It has not been validated or written.")
  }

  const previewImport = async (): Promise<void> => {
    if (importText === null) return
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    try {
      const plan = await runtime.runPromise(Effect.gen(function*() {
        const transfer = yield* DataTransfer
        return yield* transfer.previewImport(
          importText,
          bootstrap.trustedReleaseContentRegistry
        )
      }))
      setImportPlan(plan)
      setImportConfirmed(false)
      setNotice("Checksum and schema validation passed. Review the no-write preview below.")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "The local-data operation failed."))
      setImportPlan(null)
    } finally {
      setBusy(false)
    }
  }

  const applyImport = async (): Promise<void> => {
    if (importPlan === null || !importConfirmed) return
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    try {
      const result = await runtime.runPromise(Effect.gen(function*() {
        const transfer = yield* DataTransfer
        return yield* transfer.applyImport(
          importPlan,
          bootstrap.trustedReleaseContentRegistry
        )
      }))
      setNotice(`Import committed atomically: ${result.imported} inserted, ${result.matched} matched, ${result.quarantined} quarantined. No existing record was overwritten.`)
      setImportPlan(null)
      setImportText(null)
      setImportConfirmed(false)
      const loaded = await runtime.runPromise(Effect.gen(function*() {
        const settings = yield* SettingsPersistence
        return yield* settings.loadPreferences()
      }))
      lastAuthoritativePreferences.current = loaded
      setPreferences(loaded)
      const mirrorDetail = synchronizeBootMirror(loaded)
      if (mirrorDetail !== null) {
        setNotice((current) => `${current} ${mirrorDetail} Imported IndexedDB preferences remain authoritative.`)
      }
      setCompletion("Portable import complete")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "The local-data operation failed."))
    } finally {
      setBusy(false)
    }
  }

  const rebuildReviewQueue = async (): Promise<void> => {
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    setReviewRebuild({ tag: "pending" })
    try {
      const receipt = await runtime.runPromise(
        rebuildReviewProjection(bootstrap.reviewQueue)
      )
      setReviewRebuild({ tag: "complete", receipt })
    } catch (cause) {
      setReviewRebuild({
        tag: "recoverable_error",
        detail: localFailureDetail(cause, "The review projection could not be rebuilt.")
      })
    } finally {
      setBusy(false)
    }
  }

  const previewResetOperation = async (): Promise<void> => {
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    try {
      const preview = await runtime.runPromise(Effect.gen(function*() {
        const settings = yield* SettingsPersistence
        return yield* settings.previewReset(resetScope)
      }))
      setResetPreview(preview)
      setResetConfirmed(false)
      setNotice("Reset preview is ready. No record was changed.")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "The local-data operation failed."))
    } finally {
      setBusy(false)
    }
  }

  const applyReset = async (): Promise<void> => {
    if (resetPreview === null || !resetConfirmed) return
    setBusy(true)
    setProblem(null)
    setCompletion(null)
    try {
      const receipt = await runtime.runPromise(Effect.gen(function*() {
        const settings = yield* SettingsPersistence
        return yield* settings.reset(resetPreview)
      }))
      setNotice(`Scoped reset completed for ${receipt.records} record(s). Offline packs and their caches were not included.`)
      setResetPreview(null)
      setResetConfirmed(false)
      if (resetPreview.scope === "preferences" || resetPreview.scope === "all-portable-data") {
        const defaults = defaultSitePreferences()
        lastAuthoritativePreferences.current = defaults
        setPreferences(defaults)
        const mirror = clearBootPreferences()
        if (!mirror.mirrored) {
          setNotice((current) => `${current} ${mirror.detail} Defaults were applied in this tab.`)
        }
      }
      setCompletion("Scoped reset complete")
    } catch (cause) {
      setProblem(localFailureDetail(cause, "The local-data operation failed."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="local-data-stack">
      {problem === null ? null : (
        <section className="local-data-error" role="alert" aria-labelledby="settings-error-heading">
          <h2 id="settings-error-heading" ref={problemHeading} tabIndex={-1}>Local-data operation stopped</h2>
          <p>{problem}</p>
        </section>
      )}

      <section className="reference-card" aria-labelledby="preferences-heading">
        <h2 id="preferences-heading">Preferences on this device</h2>
        <fieldset className="form-field-group">
          <legend>Preference choices</legend>
          <div className="form-field">
            <label htmlFor="settings-language">Preferred content language</label>
            <select
              id="settings-language"
              value={preferences.preferredLocale}
              onChange={(event) => setPreferences(new SitePreferencesRecord({
                ...preferences,
                preferredLocale: event.target.value as "en" | "es"
              }))}
            >
              <option value="en">English (launch content available)</option>
              <option value="es" disabled>Spanish (architecture ready; reviewed pages not launched)</option>
            </select>
          </div>
          <label className="affirmation-control">
            <input type="checkbox" checked={preferences.lowDataMode} disabled />
            Low-data media preference (not enabled until a real media policy consumes it)
          </label>
          <label className="affirmation-control">
            <input type="checkbox" checked={preferences.largeText} onChange={(event) =>
              setPreferences(new SitePreferencesRecord({ ...preferences, largeText: event.target.checked }))} />
            Prefer larger application text
          </label>
          <label className="affirmation-control">
            <input type="checkbox" checked={preferences.reduceMotion} onChange={(event) =>
              setPreferences(new SitePreferencesRecord({ ...preferences, reduceMotion: event.target.checked }))} />
            Reduce nonessential application motion
          </label>
          <button className="button button-primary" disabled={busy} onClick={() => void savePreferences()} type="button">
            Save preferences locally
          </button>
        </fieldset>
      </section>

      <section id="export-local-data" className="reference-card" aria-labelledby="export-heading">
        <h2 id="export-heading">Export portable local data</h2>
        <p>Exports append-only study/review events and preferences with a schema version and SHA-256 checksum. Rebuildable session projections and offline-pack bytes are excluded.</p>
        <fieldset className="form-field-group">
          <legend>Export options</legend>
          <label className="affirmation-control">
            <input type="checkbox" checked={includeDrafts} onChange={(event) => setIncludeDrafts(event.target.checked)} />
            Include correction drafts, which may contain sensitive free-form text
          </label>
          <button className="button button-secondary" disabled={busy} onClick={() => void exportData()} type="button">
            Download validated export
          </button>
        </fieldset>
      </section>

      <section className="reference-card" aria-labelledby="import-heading">
        <h2 id="import-heading">Import with preview and quarantine</h2>
        <p>No record is written until the file checksum and schema validate, references are classified, a preview is shown, and you confirm.</p>
        <fieldset className="form-field-group">
          <legend>Import file and confirmation</legend>
          <div className="form-field">
            <label htmlFor="settings-import-file">Local export JSON</label>
            <input id="settings-import-file" type="file" accept="application/json,.json" onChange={(event) =>
              void chooseImportFile(event.target.files?.[0])} />
          </div>
          <button className="button button-secondary" disabled={busy || importText === null} onClick={() => void previewImport()} type="button">
            Validate and preview import
          </button>
          {importPlan === null ? null : (
            <div className="operation-preview">
              <h3 ref={resultHeading} tabIndex={-1}>No-write import preview</h3>
              <dl className="fact-list">
                <dt>New records</dt><dd>{importPlan.preview.insert}</dd>
                <dt>Identical matches</dt><dd>{importPlan.preview.matched}</dd>
                <dt>Conflicts to quarantine</dt><dd>{importPlan.preview.conflicts}</dd>
                <dt>Unknown references to quarantine</dt><dd>{importPlan.preview.unknownReferences}</dd>
                <dt>Correction drafts</dt><dd>{importPlan.preview.includesCorrectionDrafts ? "Included" : "Excluded"}</dd>
                <dt>Checksum</dt><dd><code>{importPlan.preview.checksum}</code></dd>
              </dl>
              <label className="affirmation-control">
                <input type="checkbox" checked={importConfirmed} onChange={(event) => setImportConfirmed(event.target.checked)} />
                Apply this exact preview without overwriting existing records
              </label>
              <button className="button button-primary" disabled={busy || !importConfirmed} onClick={() => void applyImport()} type="button">
                Apply validated import
              </button>
            </div>
          )}
        </fieldset>
      </section>

      <section
        id="rebuild-review-projection"
        className="reference-card"
        aria-labelledby="review-rebuild-heading"
      >
        <h2 id="review-rebuild-heading">Rebuild the local review projection</h2>
        <p>
          Derive the due queue again from validated, append-only attempts and explicit review
          acknowledgements. This read-only recovery does not edit study history or mark anything
          reviewed.
        </p>
        <button
          className="button button-secondary"
          disabled={busy}
          onClick={() => void rebuildReviewQueue()}
          type="button"
        >
          {reviewRebuild.tag === "pending"
            ? "Rebuilding review queue…"
            : "Rebuild review queue"}
        </button>
        {reviewRebuild.tag === "pending" ? (
          <p role="status" aria-live="polite" aria-atomic="true">
            Rebuilding the review projection from saved local events…
          </p>
        ) : null}
        {reviewRebuild.tag === "recoverable_error" ? (
          <section
            className="local-data-error"
            role="alert"
            aria-labelledby="review-rebuild-error-heading"
          >
            <h3
              id="review-rebuild-error-heading"
              ref={rebuildErrorHeading}
              tabIndex={-1}
            >
              Review queue rebuild stopped
            </h3>
            <p>{reviewRebuild.detail}</p>
            <p>No saved attempt or review acknowledgement was changed. The rebuild control is available again.</p>
          </section>
        ) : null}
        {reviewRebuild.tag === "complete" ? (
          <div className="operation-preview">
            <h3 ref={rebuildResultHeading} tabIndex={-1}>Review queue rebuild complete</h3>
            <p role="status" aria-live="polite" aria-atomic="true">
              Read {reviewRebuild.receipt.attemptsRead} validated attempt(s), derived {" "}
              {reviewRebuild.receipt.dueItems} due item(s), and classified {" "}
              {reviewRebuild.receipt.quarantinedAttempts} unavailable or inconsistent attempt(s)
              for truthful review recovery. No study event or acknowledgement was written.
            </p>
          </div>
        ) : null}
      </section>

      <section className="reference-card" aria-labelledby="reset-heading">
        <h2 id="reset-heading">Scoped local reset</h2>
        <p>Export first if you may need these records. Offline packs are never deleted here; preview or remove them on the <a href="/offline/">Offline packs page</a>.</p>
        <fieldset className="form-field-group">
          <legend>Reset scope and confirmation</legend>
          <div className="form-field">
            <label htmlFor="reset-scope">Reset scope</label>
            <select id="reset-scope" value={resetScope} onChange={(event) => {
              setResetScope(event.target.value as ResetScope)
              setResetPreview(null)
              setResetConfirmed(false)
            }}>
              <option value="study-events">Study and review events</option>
              <option value="preferences">Preferences</option>
              <option value="correction-drafts">Correction drafts and receipts</option>
              <option value="transfer-quarantine">Import quarantine</option>
              <option value="all-portable-data">All portable local data</option>
            </select>
          </div>
          <button className="button button-secondary" disabled={busy} onClick={() => void previewResetOperation()} type="button">
            Preview reset
          </button>
          {resetPreview === null ? null : (
            <div className="operation-preview">
              <h3 ref={resetResultHeading} tabIndex={-1}>Reset preview: {resetPreview.records} record(s)</h3>
              <ul>{resetPreview.stores.map((store) => <li key={store.name}><code>{store.name}</code>: {store.records}</li>)}</ul>
              <p>Offline packs and cache bytes: excluded.</p>
              <label className="affirmation-control">
                <input type="checkbox" checked={resetConfirmed} onChange={(event) => setResetConfirmed(event.target.checked)} />
                Delete exactly this reset scope from this device
              </label>
              <button className="button button-primary" disabled={busy || !resetConfirmed} onClick={() => void applyReset()} type="button">
                Confirm scoped reset
              </button>
            </div>
          )}
        </fieldset>
      </section>
      {completion === null ? (
        <p role="status" aria-live="polite">{notice}</p>
      ) : (
        <section className="local-data-state" aria-labelledby="settings-completion-heading">
          <h2 id="settings-completion-heading" ref={completionHeading} tabIndex={-1}>{completion}</h2>
          <p role="status" aria-live="polite">{notice}</p>
        </section>
      )}
    </div>
  )
}
