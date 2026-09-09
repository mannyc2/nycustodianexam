import type { Effect as EffectType } from "effect"
import { Effect } from "effect"
import { useEffect, useRef, useState, type RefObject } from "react"
import type { HazardPersistence } from "../../hazard-player/persistence.ts"
import {
  localFailureReport,
  type LocalFailureReport
} from "../../local-failure-detail.ts"
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

type DisplayPreference = "largeText" | "reduceMotion"

interface SettingsTaskCard {
  readonly id?: string
  readonly title: string
  readonly description: string
  readonly icon: string
  readonly label: string
  readonly run: () => void | Promise<void>
  readonly expanded?: boolean
  readonly controls?: string
}

interface SettingsEffectRunner {
  readonly runPromise: <A, E>(
    effect: EffectType.Effect<A, E, SettingsRequirements>
  ) => Promise<A>
}

const loadPreferences = Effect.flatMap(SettingsPersistence, (settings) => settings.loadPreferences())

const useResultFocus = (result: unknown, heading: RefObject<HTMLHeadingElement | null>): void => {
  useEffect(() => {
    if (result !== null) heading.current?.focus()
  }, [result, heading])
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
  const [preferenceRead, setPreferenceRead] = useState<"loading" | "ready" | "unavailable">("loading")
  const preferenceWrite = useRef(false)
  const preferenceFocus = useRef<HTMLInputElement | null>(null)
  const [preferenceStatus, setPreferenceStatus] = useState<Partial<Record<DisplayPreference, LocalFailureReport>>>({})
  const [dataAction, setDataAction] = useState<"import" | "delete" | null>(null)
  const actionHeading = useRef<HTMLHeadingElement>(null)
  const [includeDrafts, setIncludeDrafts] = useState(false)
  const [importText, setImportText] = useState<string | null>(null)
  const importFileGeneration = useRef(0)
  const [importPlan, setImportPlan] = useState<ImportPlan | null>(null)
  const [importConfirmed, setImportConfirmed] = useState(false)
  const [resetScope, setResetScope] = useState<ResetScope>("study-events")
  const [resetPreview, setResetPreview] = useState<ResetPreview | null>(null)
  const [resetConfirmed, setResetConfirmed] = useState(false)
  const [reviewRebuild, setReviewRebuild] = useState<ReviewRebuildState>({ tag: "idle" })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("Loading local settings…")
  const [problem, setProblem] = useState<LocalFailureReport | null>(null)
  const [completion, setCompletion] = useState<string | null>(null)
  const problemHeading = useRef<HTMLHeadingElement>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const resetResultHeading = useRef<HTMLHeadingElement>(null)
  const rebuildErrorHeading = useRef<HTMLHeadingElement>(null)
  const rebuildResultHeading = useRef<HTMLHeadingElement>(null)
  const completionHeading = useRef<HTMLHeadingElement>(null)

  const applySavedPreferences = (stored: SitePreferencesRecord): string | null => {
    lastAuthoritativePreferences.current = stored
    setPreferences(stored)
    const result = stored.updatedAt === 0
      ? clearBootPreferences()
      : saveBootPreferences({
          schemaVersion: 1,
          largeText: stored.largeText,
          reduceMotion: stored.reduceMotion
        })
    return result.detail
  }

  const beginOperation = (): void => {
    setBusy(true)
    setProblem(null)
    setCompletion(null)
  }

  useEffect(() => {
    let active = true
    void runtime.runPromise(loadPreferences).then((stored) => {
      if (!active) return
      setPreferenceRead("ready")
      const mirrorDetail = applySavedPreferences(stored)
      setNotice((stored.updatedAt === 0
        ? "Default preferences are shown."
        : "Your saved preferences loaded.") +
        (mirrorDetail === null ? "" : ` ${mirrorDetail} Saved preferences remain authoritative.`))
    }).catch((cause) => {
      if (active) {
        setPreferenceRead("unavailable")
        setNotice("Preferences unavailable. Saved-work controls remain available.")
        setProblem(localFailureReport(cause, "Saved settings could not be read."))
      }
    })
    return () => {
      active = false
    }
  }, [runtime])

  useResultFocus(problem, problemHeading)
  useResultFocus(importPlan, resultHeading)
  useResultFocus(resetPreview, resetResultHeading)
  useResultFocus(completion, completionHeading)
  useResultFocus(reviewRebuild.tag === "recoverable_error" ? reviewRebuild : null, rebuildErrorHeading)
  useResultFocus(reviewRebuild.tag === "complete" ? reviewRebuild : null, rebuildResultHeading)
  useResultFocus(dataAction, actionHeading)

  useEffect(() => {
    if (busy || preferenceFocus.current === null) return
    if (document.activeElement === document.body) preferenceFocus.current.focus()
    preferenceFocus.current = null
  }, [busy])

  const savePreference = async (field: DisplayPreference, value: boolean, control: HTMLInputElement): Promise<void> => {
    if (preferenceWrite.current || busy || preferenceRead !== "ready") return
    control.focus()
    preferenceWrite.current = true
    preferenceFocus.current = control
    setBusy(true)
    const next = new SitePreferencesRecord({ ...lastAuthoritativePreferences.current, [field]: value })
    setPreferences(next)
    const report = (message: string, diagnostic: string | null = null): void => {
      setPreferenceStatus((current) => ({ ...current, [field]: { message, diagnostic } }))
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
      const writeFailure = localFailureReport(cause, "Preference save failed.")
      try {
        const stored = await runtime.runPromise(loadPreferences)
        const mirrorDetail = applySavedPreferences(stored)
        report(`${writeFailure.message} Your saved choices were restored.` +
            (mirrorDetail === null ? "" : ` ${mirrorDetail}`),
          writeFailure.diagnostic)
      } catch (restoreCause) {
        console.error("Unable to reload the saved preferences", restoreCause)
        const mirrorDetail = applySavedPreferences(lastAuthoritativePreferences.current)
        report(`${writeFailure.message} Reload failed too; your last saved choices are shown.` +
            (mirrorDetail === null ? "" : ` ${mirrorDetail}`),
          writeFailure.diagnostic)
      }
    } finally {
      preferenceWrite.current = false
      setBusy(false)
    }
  }

  const exportData = async (): Promise<void> => {
    beginOperation()
    try {
      const envelope = await runtime.runPromise(Effect.flatMap(DataTransfer,
        (transfer) => transfer.createExport(includeDrafts)))
      const blob = new Blob([serializeDataExport(envelope)], { type: "application/json" })
      const href = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = href
      anchor.download = `nycustodian-local-data-${new Date(envelope.payload.exportedAt).toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(href)
      setNotice(`Export ready: ${envelope.payload.questionAttempts.length + envelope.payload.hazardAttempts.length + envelope.payload.reviewAcknowledgements.length} event records. Correction drafts ${includeDrafts ? "included" : "excluded"}.`)
      setCompletion("Export ready")
    } catch (cause) {
      setProblem(localFailureReport(cause, "Export failed. Saved data is unchanged."))
    } finally {
      setBusy(false)
    }
  }

  const chooseImportFile = async (file: File | undefined): Promise<void> => {
    const generation = ++importFileGeneration.current
    setImportPlan(null)
    setImportConfirmed(false)
    setCompletion(null)
    setProblem(null)
    setImportText(null)
    if (file === undefined) {
      return
    }
    if (file.size > 10 * 1_024 * 1_024) {
      setProblem({ message: "Import files are limited to 10 MiB.", diagnostic: null })
      setImportText(null)
      return
    }
    try {
      const text = await file.text()
      if (generation !== importFileGeneration.current) return
      setImportText(text)
      setNotice("File loaded. Preview it before importing; nothing is saved yet.")
    } catch (cause) {
      if (generation !== importFileGeneration.current) return
      setProblem(localFailureReport(
        cause,
        "File read failed. Choose the export again."
      ))
    }
  }

  const previewImport = async (): Promise<void> => {
    if (importText === null) return
    beginOperation()
    try {
      const plan = await runtime.runPromise(Effect.flatMap(DataTransfer,
        (transfer) => transfer.previewImport(importText, bootstrap.trustedReleaseContentRegistry)))
      setImportPlan(plan)
      setImportConfirmed(false)
      setNotice("File checked. Review the preview; nothing is saved yet.")
    } catch (cause) {
      setProblem(localFailureReport(cause, "File check failed. Nothing imported."))
      setImportPlan(null)
    } finally {
      setBusy(false)
    }
  }

  const applyImport = async (): Promise<void> => {
    if (importPlan === null || !importConfirmed) return
    beginOperation()
    let importApplied = false
    try {
      const result = await runtime.runPromise(Effect.flatMap(DataTransfer,
        (transfer) => transfer.applyImport(importPlan, bootstrap.trustedReleaseContentRegistry)))
      importApplied = true
      setNotice(`Import saved: ${result.imported} added, ${result.matched} already present, ${result.quarantined} set aside. Existing records kept.`)
      setImportPlan(null)
      setImportText(null)
      setImportConfirmed(false)
      const loaded = await runtime.runPromise(loadPreferences)
      const mirrorDetail = applySavedPreferences(loaded)
      setPreferenceRead("ready")
      setPreferenceStatus({})
      if (mirrorDetail !== null) {
        setNotice((current) => `${current} ${mirrorDetail} Imported preferences remain authoritative.`)
      }
      setCompletion("Import complete")
    } catch (cause) {
      if (importApplied) {
        setPreferenceRead("unavailable")
        setPreferenceStatus({})
      }
      setProblem(localFailureReport(
        cause,
        importApplied
          ? "Import saved. Preferences could not reload; reload this page before changing them."
          : "Import failed. Existing records are unchanged."
      ))
    } finally {
      setBusy(false)
    }
  }

  const rebuildReviewQueue = async (): Promise<void> => {
    beginOperation()
    setReviewRebuild({ tag: "pending" })
    try {
      const receipt = await runtime.runPromise(
        rebuildReviewProjection(bootstrap.reviewQueue)
      )
      setReviewRebuild({ tag: "complete", receipt })
    } catch (cause) {
      console.error("Unable to rebuild the review queue", cause)
      setReviewRebuild({
        tag: "recoverable_error",
        detail: "Could not rebuild from this device’s storage."
      })
    } finally {
      setBusy(false)
    }
  }

  const previewResetOperation = async (): Promise<void> => {
    beginOperation()
    try {
      const preview = await runtime.runPromise(Effect.flatMap(SettingsPersistence,
        (settings) => settings.previewReset(resetScope)))
      setResetPreview(preview)
      setResetConfirmed(false)
      setNotice("Delete preview ready. Nothing changed.")
    } catch (cause) {
      setProblem(localFailureReport(cause, "Could not preview deletion. Nothing changed."))
    } finally {
      setBusy(false)
    }
  }

  const applyReset = async (): Promise<void> => {
    if (resetPreview === null || !resetConfirmed) return
    beginOperation()
    try {
      const receipt = await runtime.runPromise(Effect.flatMap(SettingsPersistence,
        (settings) => settings.reset(resetPreview)))
      setNotice(`Delete complete: ${receipt.records} record(s) removed. Offline downloads unchanged.`)
      setResetPreview(null)
      setResetConfirmed(false)
      if (resetPreview.scope === "preferences" || resetPreview.scope === "all-portable-data") {
        const mirrorDetail = applySavedPreferences(defaultSitePreferences())
        setPreferenceRead("ready")
        setPreferenceStatus({})
        if (mirrorDetail !== null) {
          setNotice((current) => `${current} ${mirrorDetail} Defaults applied in this tab.`)
        }
      }
      setCompletion("Delete complete")
    } catch (cause) {
      setProblem(localFailureReport(cause, "Delete failed. Records outside the preview were not touched."))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="local-data-stack">
      {problem === null ? null : (
        <section className="local-data-error" role="alert" aria-labelledby="settings-error-heading">
          <h2 id="settings-error-heading" ref={problemHeading} tabIndex={-1}>This didn’t finish</h2>
          <p>{problem.message}</p>
          {problem.diagnostic === null ? null : (
            <details className="feedback-sources"><summary>Technical details</summary>
              <p><code>{problem.diagnostic}</code></p>
            </details>
          )}
        </section>
      )}

      <section className="settings-reading" aria-labelledby="preferences-heading">
        <div className="section-header">
          <h2 id="preferences-heading">Reading and motion</h2>
          <p>Changes save automatically on this device.</p>
        </div>
        <fieldset className="preference-list" disabled={busy || preferenceRead !== "ready"}>
          <legend className="sr-only">Reading and motion choices</legend>
          <div className="preference-row">
            <div><h3>Language</h3><p>All content is published in English.</p></div>
            <strong>English</strong>
          </div>
          {([
            ["largeText", "Larger text", "125% text with full-size answer controls and reflowing pages."],
            ["reduceMotion", "Reduce motion", "Turns off nonessential transitions. System motion preferences also apply."]
          ] as const).map(([field, label, description]) => (
            <div className="preference-row" key={field}>
              <div>
                <h3><label htmlFor={`settings-${field}`}>{label}</label></h3>
                <p id={`settings-${field}-description`}>{description}</p>
                <p role="status" aria-live="polite" aria-atomic="true" className="preference-status">
                  {preferenceStatus[field]?.message ?? ""}
                </p>
                {preferenceStatus[field]?.diagnostic ? <details className="technical-details"><summary>Technical details</summary>
                  <p>{preferenceStatus[field]?.diagnostic}</p>
                </details> : null}
              </div>
              <input id={`settings-${field}`} type="checkbox" checked={preferences[field]}
                aria-describedby={`settings-${field}-description`}
                onChange={(event) => void savePreference(field, event.target.checked, event.currentTarget)} />
            </div>
          ))}
        </fieldset>
      </section>

      <section className="settings-data" aria-labelledby="saved-work-heading">
        <div className="section-header"><h2 id="saved-work-heading">Your saved work</h2></div>
        <ul className="task-cards settings-task-cards">
          {[
            {
              id: "export-local-data", title: "Export",
              description: "History and preferences. Excludes offline downloads.",
              icon: "export", label: "Export a file", run: exportData
            },
            {
              title: "Import",
              description: "Preview another device’s export, then confirm.",
              icon: "import", label: "Choose a file", run: () => setDataAction("import"),
              expanded: dataAction === "import", controls: "settings-import"
            },
            {
              id: "rebuild-review-projection", title: "Rebuild review",
              description: "From saved attempts and finished reviews. History stays unchanged.",
              icon: "rebuild",
              label: reviewRebuild.tag === "pending" ? "Rebuilding review queue…" : "Rebuild review queue", run: rebuildReviewQueue
            },
            {
              title: "Delete",
              description: "Preview counts, then confirm. Export first if needed.",
              icon: "delete", label: "Choose what to delete", run: () => setDataAction("delete"),
              expanded: dataAction === "delete", controls: "settings-delete"
            }
          ].map((task: SettingsTaskCard) => {
            const exporting = task.id === "export-local-data"
            const action = <button className={exporting ? "button button-primary" : "button button-secondary"} type="button" disabled={busy || preferenceRead === "loading"}
              aria-expanded={task.expanded} aria-controls={task.controls} onClick={task.run}>{task.label}</button>
            return <li id={task.id} className="task-card" aria-labelledby={exporting ? "export-heading" : undefined} key={task.title}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><use href={`#settings-icon-${task.icon}`} /></svg>
              <h3 id={exporting ? "export-heading" : undefined}>{task.title}</h3><p>{task.description}</p>
              {exporting ? <div className="settings-card-action">
                <label className="affirmation-control"><input type="checkbox" disabled={busy || preferenceRead === "loading"} checked={includeDrafts} onChange={(event) => setIncludeDrafts(event.target.checked)} />
                  <span>Include correction drafts (may contain sensitive text)</span>
                </label>
                {action}
              </div> : action}
            </li>
          })}
        </ul>
      </section>

      <section id="settings-import" className="reference-card" aria-labelledby="import-heading" hidden={dataAction !== "import"}>
        <h2 id="import-heading" ref={dataAction === "import" ? actionHeading : undefined} tabIndex={-1}>Import exported data</h2>
        <p>Conflicts and unknown references are set aside; saved records stay.</p>
        <fieldset className="form-field-group" disabled={busy}>
          <legend>Import file and confirmation</legend>
          <div className="form-field">
            <label htmlFor="settings-import-file">Local export JSON</label>
            <input id="settings-import-file" type="file" accept="application/json,.json" onChange={(event) =>
              void chooseImportFile(event.target.files?.[0])} />
          </div>
          <button className="button button-secondary" type="button" disabled={busy || importText === null} onClick={previewImport}>
            Check and preview import
          </button>
          {importPlan === null ? null : (
            <div className="operation-preview">
              <h3 ref={resultHeading} tabIndex={-1}>Import preview — nothing written yet</h3>
              <dl className="fact-list">
                <dt>New records</dt><dd>{importPlan.preview.insert}</dd>
                <dt>Identical matches</dt><dd>{importPlan.preview.matched}</dd>
                <dt>Conflicts set aside</dt><dd>{importPlan.preview.conflicts}</dd>
                <dt>Unknown references set aside</dt><dd>{importPlan.preview.unknownReferences}</dd>
                <dt>Correction drafts</dt><dd>{importPlan.preview.includesCorrectionDrafts ? "Included" : "Excluded"}</dd>
              </dl>
              <details className="source-note"><summary>Technical details</summary><p>Checksum <code>{importPlan.preview.checksum}</code></p></details>
              <label className="affirmation-control"><input type="checkbox"  checked={importConfirmed} onChange={(event) => setImportConfirmed(event.target.checked)} />
                Apply exactly this preview without overwriting existing records
              </label>
              <button className="button button-primary" type="button" disabled={busy || !importConfirmed} onClick={applyImport}>
                Apply import
              </button>
            </div>
          )}
        </fieldset>
      </section>

      <section className="settings-rebuild-result" aria-label="Review rebuild result" hidden={reviewRebuild.tag === "idle"}>
        {reviewRebuild.tag === "pending" ? (
          <p role="status" aria-live="polite" aria-atomic="true">
            Rebuilding from saved events…
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
            <p>History is unchanged. Try rebuilding again.</p>
          </section>
        ) : null}
        {reviewRebuild.tag === "complete" ? (
          <div className="operation-preview">
            <h3 ref={rebuildResultHeading} tabIndex={-1}>Review queue rebuild complete</h3>
            <p role="status" aria-live="polite" aria-atomic="true">
              Read {reviewRebuild.receipt.attemptsRead} attempts: {reviewRebuild.receipt.dueItems} ready for review; {" "}
              {reviewRebuild.receipt.quarantinedAttempts} could not be checked. History unchanged.
            </p>
          </div>
        ) : null}
      </section>

      <section id="settings-delete" className="reference-card" aria-labelledby="reset-heading" hidden={dataAction !== "delete"}>
        <h2 id="reset-heading" ref={dataAction === "delete" ? actionHeading : undefined} tabIndex={-1}>Delete local data</h2>
        <p><a href="#export-local-data">Export your progress first</a> if needed. Manage offline downloads on the <a href="/offline/">Use offline page</a>; they are never deleted here.</p>
        <fieldset className="form-field-group" disabled={busy}>
          <legend>Reset scope and confirmation</legend>
          <div className="form-field">
            <label htmlFor="reset-scope">What to delete</label>
            <select id="reset-scope" value={resetScope} onChange={(event) => {
              setResetScope(event.target.value as ResetScope)
              setResetPreview(null)
              setResetConfirmed(false)
            }}>
              <option value="study-events">Study and review events</option>
              <option value="preferences">Preferences</option>
              <option value="correction-drafts">Correction drafts and receipts</option>
              <option value="transfer-quarantine">Records set aside during import</option>
              <option value="all-portable-data">All portable local data</option>
            </select>
          </div>
          <button className="button button-secondary" type="button" disabled={busy} onClick={previewResetOperation}>
            Preview delete
          </button>
          {resetPreview === null ? null : (
            <div className="operation-preview">
              <h3 ref={resetResultHeading} tabIndex={-1}>Delete preview — nothing changed yet</h3>
              <p>{resetPreview.records} record(s) in the selected scope will be removed.</p>
              <p>Offline downloads are not included.</p>
              <details className="source-note"><summary>Technical details</summary><ul>{resetPreview.stores.map((store) => <li key={store.name}><code>{store.name}</code>: {store.records}</li>)}</ul></details>
              <label className="affirmation-control"><input type="checkbox"  checked={resetConfirmed} onChange={(event) => setResetConfirmed(event.target.checked)} />
                Delete exactly these previewed records from this device
              </label>
              <button className="button button-primary" type="button" disabled={busy || !resetConfirmed} onClick={applyReset}>
                Delete these records
              </button>
            </div>
          )}
        </fieldset>
      </section>
      {completion === null ? (
        <p role="status" aria-live="polite" aria-atomic="true">{notice}</p>
      ) : (
        <section className="local-data-state" aria-labelledby="settings-completion-heading">
          <h2 id="settings-completion-heading" ref={completionHeading} tabIndex={-1}>{completion}</h2>
          <p role="status" aria-live="polite" aria-atomic="true">{notice}</p>
        </section>
      )}
    </div>
  )
}
