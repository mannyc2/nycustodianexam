import type { SupportedPrintProduct } from "../model.ts"
import { deterministicSeedMaxLength } from "../../deterministic-seed.ts"
import { PrintBuilderProvider, usePrintBuilder, type PrintBuilderProviderProps } from "./builder-provider.tsx"

export const PrintBuilder = (props: PrintBuilderProviderProps) => <PrintBuilderProvider {...props}><PrintBuilderView /></PrintBuilderProvider>
export const PrintBuilderView = () => {
  const { state, actions, meta: { errorRef } } = usePrintBuilder()
  const { snapshot } = state
  const { generate } = actions
  return (
    <section aria-labelledby="print-builder-heading" className="print-builder screen-only">
      <p aria-live="polite" className="sr-only">{snapshot.announcementRequest?.message ?? ""}</p>
      <h2 id="print-builder-heading">Choose what to print</h2>
      <p>
        Choose your material and page settings, then review the packet before printing.
      </p>
      {snapshot.state.tag === "recoverable-error" || snapshot.state.tag === "download-required" ? (
        <section className="status-panel status-panel-danger" role="alert" aria-labelledby="print-error-heading">
          <h3 id="print-error-heading" ref={errorRef} tabIndex={-1}>Print preview was not generated</h3>
          {snapshot.state.tag === "download-required" ? <>
            <p>This packet needs images or answer references that have not been downloaded and checked on this device. Download the study copy, then return here and choose Generate preview again. Your settings stay in this tab.</p>
            <a className="button button-secondary" href="/offline/" target="_blank" rel="noopener">Open downloads in a new tab</a>
          </> : <p>{snapshot.state.detail}</p>}
        </section>
      ) : null}
      <form onSubmit={(event) => { event.preventDefault(); generate() }}>
        <fieldset className="print-config-fields" disabled={snapshot.state.tag === "generating"}><legend className="sr-only">Print settings</legend>
        <div className="print-setup-columns">
          <div className="print-material-panel"><PrintProductControls /></div>
          <div className="print-options-panel">
            <section className="print-page-settings" aria-labelledby="print-page-settings-heading"><h3 id="print-page-settings-heading">Page settings</h3><PrintCountControls /></section>
            <PrintOutputControls />
          </div>
        </div>
        <div className="print-submit-row"><PrintGenerateAction /><p className="field-hint">Preview first. Print or save as PDF from the next screen.</p></div>
        </fieldset>
      </form>
    </section>
  )
}

export const PrintProductControls = () => {
  const { state: { products, availability, product, factProfiles, factProfileId, selectedProfile, filterOptions, filter }, actions: { setProduct, setFactProfileId, setFilter } } = usePrintBuilder()
  return <>
        <fieldset>
          <legend>Product type</legend>
          <div className="print-product-list">
            {products.map(({ id, label }) => {
              const status = availability.get(id)
              const unavailable = status?.available !== true
              return (
                <div key={id} className="print-product-option">
                  <label>
                    <input
                      type="radio"
                      name="print-product"
                      value={id}
                      checked={product === id}
                      disabled={unavailable}
                      onChange={() => setProduct(id as SupportedPrintProduct)}
                    /> {label}
                  </label>
                  {unavailable ? <p className="field-hint">Unavailable: {status?.reason}</p> : null}
                </div>
              )
            })}
          </div>
        </fieldset>

        {product === "announcement-profile-fact-sheet" ? factProfiles.length > 1 ? <label htmlFor="print-fact-profile">Announcement document<select id="print-fact-profile" value={factProfileId} onChange={(event) => setFactProfileId(event.target.value)}>{factProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label> : <p className="source-note">Announcement document: {selectedProfile?.label ?? "Unavailable"}</p> : null}
        <div className="print-filter-field"><label htmlFor="print-filter">Content filter</label>
        <select
          disabled={filterOptions.length === 0}
          id="print-filter"
          onChange={(event) => setFilter(event.target.value)}
          value={filter}
        >
          <option value="">All compatible content</option>
          {filterOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <p className="field-hint">{filterOptions.length === 0
          ? "No additional category filter applies to this product."
          : "Choose a question category, tool family, or scene environment."}</p></div></>
}
export const PrintCountControls = () => {
  const { state: { countUnit, capacity, count, paper, margin, seed }, actions: { setCount, setPaper, setMargin, setSeed } } = usePrintBuilder()
  return <><div className="print-control-grid">
          <label htmlFor="print-count">
            Number of {countUnit}
            <input
              id="print-count"
              type="number"
              min={1}
              max={Math.max(1, capacity)}
              value={count}
              onChange={(event) => setCount(event.currentTarget.valueAsNumber)}
            />
            <span className="field-hint">Available {countUnit}: {capacity}</span>
          </label>
          <label htmlFor="print-paper">
            Paper
            <select id="print-paper" value={paper} onChange={(event) => setPaper(event.target.value as "us-letter" | "a4")}>
              <option value="us-letter">US Letter</option>
              <option value="a4">A4</option>
            </select>
          </label>
          <label htmlFor="print-margin">
            Margins
            <select id="print-margin" value={margin} onChange={(event) => setMargin(event.target.value as "standard" | "wide")}>
              <option value="standard">Standard</option>
              <option value="wide">Wide</option>
            </select>
          </label>
        </div>

        <details className="print-repeat-settings">
          <summary>Repeat this exact set</summary>
          <label htmlFor="print-seed">
            Set code
            <input id="print-seed" maxLength={deterministicSeedMaxLength} value={seed} onChange={(event) => setSeed(event.target.value)} />
            <span className="field-hint">The same settings and code always produce the same items.</span>
          </label>
        </details></>
}
export const PrintOutputControls = () => {
  const { state: { product, printSize, grayscalePreview, useNonvisualQuestions, includeImages, imageProduct, includeSources, sourceProduct, answerKeyPlacement, includeExplanations, appendedQuestionAnswers }, actions: { setPrintSize, setGrayscalePreview, setUseNonvisualQuestions, setIncludeImages, setIncludeSources, setAnswerKeyPlacement, setIncludeExplanations } } = usePrintBuilder()
  return <><fieldset>
          <legend>Accessibility and output</legend>
          <label><input type="checkbox" checked={printSize === "large"} onChange={(event) => setPrintSize(event.target.checked ? "large" : "normal")} /> Large print (at least 18pt)</label>
          <label><input type="checkbox" checked={grayscalePreview} onChange={(event) => setGrayscalePreview(event.target.checked)} /> Grayscale preview</label>
          {product === "multiple-choice-questions" ? <>
            <label><input type="checkbox" checked={useNonvisualQuestions} onChange={event => setUseNonvisualQuestions(event.target.checked)} /> Use authored nonvisual versions for illustrated questions</label>
            <p>{useNonvisualQuestions ? "Illustrated questions use their reviewed prompt and observable facts. Other questions keep their original text." : "Illustrations needed to answer a question are included."}</p>
          </> : null}
          <label><input type="checkbox" checked={includeImages} disabled={!imageProduct} onChange={(event) => setIncludeImages(event.target.checked)} /> Include released print images</label>
          <label><input type="checkbox" checked={includeSources} disabled={!sourceProduct} onChange={(event) => setIncludeSources(event.target.checked)} /> Include source references</label>
          <label htmlFor="print-key-placement">
            Answer-key placement
            <select
              disabled={product !== "multiple-choice-questions"}
              id="print-key-placement"
              onChange={(event) => setAnswerKeyPlacement(event.target.value as "separate-job" | "new-section")}
              value={product === "multiple-choice-questions" ? answerKeyPlacement : "separate-job"}
            >
              <option value="separate-job">Separate product and print job</option>
              <option value="new-section">Append a separately labeled new section</option>
            </select>
          </label>
          <label><input
            checked={includeExplanations}
            disabled={!appendedQuestionAnswers}
            onChange={(event) => setIncludeExplanations(event.target.checked)}
            type="checkbox"
          /> Append explanations after the answer key</label>
          <p className="field-hint">Question sheets, answer sheets, keys, and explanations printed with the same settings and code carry the same pairing label, so you can match them later.</p>
        </fieldset></>
}
export const PrintGenerateAction = () => {
  const { state: { snapshot, disabled, count, seed, capacity } } = usePrintBuilder()
  return <><p className="status-text" role="status" aria-live="polite">
          {snapshot.state.tag === "generating" ? "Generating and saving preview…" : ""}
        </p>
        <button className="button button-primary" type="submit" disabled={disabled || !Number.isSafeInteger(count) || seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength || count < 1 || count > capacity}>
          Generate preview
        </button></>
}
