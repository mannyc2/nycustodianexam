import { createPortal } from "react-dom"
import type { OfflinePackRecord, OfflinePackDescriptor } from "../model.ts"
import { useOfflinePacks } from "./provider.tsx"

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

export const OfflinePackManagerView = () => {
  const { state, actions, meta } = useOfflinePacks()
  const { descriptor, packs, downloadsLoaded, busy, notice, problem, completion, storage, removalPreview, availability, currentShellBuildNeedsStage, availableForNewSessions, insufficientCapacity, activePack, blocked } = state
  const { stage, activate, previewRemoval, keepCopy, remove, requestPersistence, reload } = actions
  const { headerMount, removalHeading, errorHeading, storedPacksHeading } = meta
  return (
    <div className="local-data-stack offline-pack-manager">
      {createPortal(<>
        <div className="page-header-copy">
          <h1>{activePack === undefined ? "Study with no connection at all." : "Your practice material is available offline."}</h1>
          <p className="lead">{activePack === undefined
            ? "Download a study copy and let it finish its check, then turn it on yourself. Nothing downloads on page load."
            : "A checked copy is turned on for new offline work. Downloading, turning on and removing a copy each require your action."}</p>
        </div>
        {downloadsLoaded ? <dl className="offline-summary">
          <div><dt>Turned on</dt><dd>{activePack === undefined ? "No copy turned on" : `${activePack.descriptor.label} · version ${activePack.descriptor.packVersion}`}</dd></div>
          <div><dt>What it holds</dt><dd>{activePack === undefined ? "Turn on a checked copy first" : `${activePack.descriptor.counts.questions} questions · ${activePack.descriptor.counts.hazardScenes} scenes · ${activePack.descriptor.counts.tools} tools`}</dd></div>
          <div><dt>Downloaded files</dt><dd>{formatBytes(packs.reduce((total, pack) => total + pack.downloadedBytes, 0))} across {packs.length} {packs.length === 1 ? "copy" : "copies"}</dd></div>
          <div><dt>Estimated space left</dt><dd>{storage.quota === null || storage.usage === null ? "Not available" : formatBytes(Math.max(0, storage.quota - storage.usage))}</dd></div>
        </dl> : <p role="status">{problem === null ? "Checking saved copies…" : "Saved copies could not be checked."}</p>}
        {activePack !== undefined && currentShellBuildNeedsStage && availableForNewSessions ? <a className="button button-primary" href="#stored-packs-heading">Review available download</a> : null}
      </>, headerMount)}
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
                <button className="button button-secondary" type="button" onClick={reload}>Check again</button>
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
                <button className="button button-primary" disabled={blocked || insufficientCapacity} onClick={() => void stage(descriptor)} type="button">Download the {formatBytes(descriptor.estimatedDownloadBytes ?? descriptor.totalBytes)} copy</button>
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
                {busy === descriptor.id ? null : <button className="button button-primary" disabled={blocked || insufficientCapacity} onClick={() => void stage(descriptor)} type="button">Download and check</button>}
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
                    <button aria-label={`Turn on this saved copy of ${pack.descriptor.label}`} className="button button-primary" disabled={blocked} onClick={() => void activate(pack.id)} type="button">Turn on this copy</button>
                  ) : null}
                  {availableForNewSessions && pack.descriptor.lifecycle !== "retired" && pack.packId === descriptor.id && pack.status === "quarantined" ? (
                    <button aria-label={`Retry this saved copy of ${pack.descriptor.label}`} className="button button-secondary" disabled={blocked || insufficientCapacity} onClick={() => void stage(pack.descriptor)} type="button">Retry the download</button>
                  ) : null}
                  {pack.status === "staged" || pack.status === "active" || pack.status === "retained" || pack.status === "quarantined" ? (
                    <button className="button button-secondary" disabled={blocked} onClick={(event) => void previewRemoval(pack.id, event.currentTarget)} type="button">Preview removal</button>
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
          {removalPreview.impact.activeSessionPins > 0 ? <a className="button button-secondary" href="/practice/">Back to studying</a> : <button className="button button-danger-outline" disabled={blocked} onClick={() => void remove()} type="button">Remove this copy</button>}
          <button className="button button-secondary" disabled={blocked} onClick={keepCopy} type="button">Keep it</button>
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
        <button className="button button-secondary" disabled={blocked} onClick={() => void requestPersistence()} type="button">
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
