import type { ResetScope } from "../model.ts"
import { useSettings } from "./provider.tsx"

type SettingsTaskCard = {
  readonly id?: string
  readonly title: string
  readonly description: string
  readonly icon: string
  readonly label: string
} & ({
  readonly href: string
} | {
  readonly run: () => void | Promise<void>
  readonly expanded?: boolean
  readonly controls?: string
})

export const SettingsForm = () => {
  const { state, actions, meta } = useSettings()
  const { preferences, preferenceRead, preferenceStatus, dataAction, includeDrafts, importText, importPlan, importConfirmed, resetScope, resetPreview, resetConfirmed, reviewRebuild, savedWork, busy, notice, problem, completion } = state
  const { savePreference, exportData, chooseImportFile, previewImport, applyImport, rebuildReviewQueue, previewResetOperation, applyReset, setIncludeDrafts, setImportConfirmed, setResetConfirmed, setDataAction, setResetScope, cancelReset } = actions
  const { deleteTrigger, actionHeading, problemHeading, resultHeading, resetResultHeading, rebuildErrorHeading, rebuildResultHeading, completionHeading, largeText, reduceMotion } = meta
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
              <input id={`settings-${field}`} ref={field === "largeText" ? largeText : reduceMotion} type="checkbox" checked={preferences[field]}
                aria-describedby={`settings-${field}-description`}
                onChange={(event) => void savePreference(field, event.target.checked)} />
            </div>
          ))}
        </fieldset>
      </section>

      <section className="settings-data" aria-labelledby="saved-work-heading">
        <div className="section-header"><h2 id="saved-work-heading">Your saved work</h2>
          <p data-saved-work-summary="" role="status">{savedWork}</p>
        </div>
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
              title: "Use this site offline",
              description: "Download a study copy, turn it on, or manage copies on this device.",
              icon: "export", label: "Manage downloads", href: "/offline/"
            },
            {
              title: "Delete",
              description: "Preview counts, then confirm. Export first if needed.",
              icon: "delete", label: "Choose what to delete", run: () => setDataAction("delete"),
              expanded: dataAction === "delete", controls: "settings-delete"
            }
          ].map((task: SettingsTaskCard) => {
            const exporting = task.id === "export-local-data"
            const action = "href" in task
              ? <a className="button button-secondary" href={task.href}>{task.label}</a>
              : <button className={exporting ? "button button-primary" : "button button-secondary"} type="button" disabled={busy || preferenceRead === "loading"}
              ref={task.controls === "settings-delete" ? deleteTrigger : undefined}
              aria-expanded={task.expanded} aria-controls={task.controls} onClick={task.run}>{task.label}</button>
            return <li id={task.id} className="task-card" aria-labelledby={exporting ? "export-heading" : undefined} key={task.title}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><use href={`#settings-icon-${task.icon}`} /></svg>
              <h3 id={exporting ? "export-heading" : undefined}>{task.title}</h3><p>{task.description}</p>
              {exporting ? <div className="settings-card-action">
                <details className="settings-export-contents">
                  <summary>What the file includes</summary>
                  <p>Saved answers, reviews, settings, simulations and print jobs. Excludes downloads and import quarantine; review is rebuilt. A readable file, never uploaded.</p>
                </details>
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
          <button className="button button-secondary" type="button" onClick={cancelReset}>Cancel</button>
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
