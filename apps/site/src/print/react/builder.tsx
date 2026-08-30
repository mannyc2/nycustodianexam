import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent
} from "react"
import type { PrintBuilderController } from "../controller.ts"
import {
  printProductAvailability,
  printProductCapacity,
  printProductFilterOptions
} from "../generation.ts"
import {
  PrintSettings,
  type PrintBuilderBootstrap,
  type PrintProduct,
  type SupportedPrintProduct
} from "../model.ts"
import { deterministicSeedMaxLength } from "../../deterministic-seed.ts"

const products: ReadonlyArray<{ readonly id: PrintProduct; readonly label: string }> = [
  { id: "blank-answer-sheet", label: "Blank answer sheet" },
  { id: "multiple-choice-questions", label: "Original multiple-choice questions" },
  { id: "answer-key", label: "Separate answer key" },
  { id: "explanations-and-sources", label: "Separate explanations and source references" },
  { id: "tool-family-contrast-cards", label: "Tool-family contrast cards" },
  { id: "hazard-worksheet", label: "Blank hazard worksheet" },
  { id: "annotated-hazard-answer-packet", label: "Annotated hazard-answer packet" },
  { id: "text-equivalent-set", label: "Text-equivalent/nonvisual set" },
  { id: "announcement-profile-fact-sheet", label: "Announcement-profile fact sheet" },
  { id: "correction-change-log-excerpt", label: "Correction/change-log excerpt" }
]

export const PrintBuilder = ({
  bootstrap,
  controller
}: {
  readonly bootstrap: PrintBuilderBootstrap
  readonly controller: PrintBuilderController
}) => {
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getHydrationSnapshot
  )
  const [profileId, setProfileId] = useState("")
  const selectedProfile = bootstrap.profiles.find((profile) => profile.id === profileId)
  const [product, setProduct] = useState<SupportedPrintProduct>("multiple-choice-questions")
  const [count, setCount] = useState(Math.min(10, bootstrap.questions.length))
  const [seed, setSeed] = useState("practice-1")
  const [paper, setPaper] = useState<"us-letter" | "a4">("us-letter")
  const [margin, setMargin] = useState<"standard" | "wide">("standard")
  const [printSize, setPrintSize] = useState<"normal" | "large">("normal")
  const [grayscalePreview, setGrayscalePreview] = useState(true)
  const [includeImages, setIncludeImages] = useState(true)
  const [answerKeyPlacement, setAnswerKeyPlacement] = useState<"separate-job" | "new-section">("separate-job")
  const [includeExplanations, setIncludeExplanations] = useState(false)
  const [includeSources, setIncludeSources] = useState(true)
  const [filter, setFilter] = useState("")
  const errorRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (snapshot.focusRequest?.target === "error-summary") errorRef.current?.focus()
    if (snapshot.focusRequest !== null) {
      controller.acknowledgeViewRequest(snapshot.focusRequest.id)
    }
  }, [controller, snapshot.focusRequest])

  useEffect(() => {
    if (snapshot.announcementRequest !== null) {
      controller.acknowledgeViewRequest(snapshot.announcementRequest.id)
    }
  }, [controller, snapshot.announcementRequest])

  const availability = useMemo(
    () => new Map(products.map(({ id }) => [id, printProductAvailability(id, bootstrap, profileId)])),
    [bootstrap, profileId]
  )
  const filterOptions = useMemo(
    () => printProductFilterOptions(product, bootstrap, profileId),
    [bootstrap, product, profileId]
  )
  useEffect(() => {
    if (filter !== "" && !filterOptions.includes(filter)) setFilter("")
  }, [filter, filterOptions])
  const capacity = printProductCapacity(product, bootstrap, profileId, filter === "" ? [] : [filter])
  const countUnit = product === "tool-family-contrast-cards"
    ? "families"
    : product === "hazard-worksheet" || product === "annotated-hazard-answer-packet" || product === "text-equivalent-set"
      ? "scenes"
      : product === "announcement-profile-fact-sheet"
        ? "profiles"
        : product === "correction-change-log-excerpt"
          ? "records"
          : "questions"
  const imageProduct = product === "tool-family-contrast-cards" ||
    product === "hazard-worksheet" || product === "annotated-hazard-answer-packet"
  const appendedQuestionAnswers = product === "multiple-choice-questions" &&
    answerKeyPlacement === "new-section"
  const sourceProduct = product === "explanations-and-sources" ||
    product === "annotated-hazard-answer-packet" ||
    product === "text-equivalent-set" ||
    appendedQuestionAnswers && includeExplanations
  useEffect(() => {
    if (selectedProfile === undefined || capacity === 0) return
    setCount((current) => Math.max(1, Math.min(current, Math.max(1, capacity))))
  }, [capacity, selectedProfile])
  const disabled = selectedProfile === undefined || capacity === 0 ||
    snapshot.state.tag === "generating"

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength) return
    controller.generate(new PrintSettings({
      profileId,
      product,
      count,
      seed: seed.trim(),
      paper,
      margin,
      printSize,
      grayscalePreview,
      includeImages: imageProduct && includeImages,
      answerKeyPlacement: product === "multiple-choice-questions"
        ? answerKeyPlacement
        : "separate-job",
      includeExplanations: product === "explanations-and-sources" ||
        appendedQuestionAnswers && includeExplanations,
      includeSources: sourceProduct && includeSources,
      filters: filter === "" ? [] : [filter]
    }))
  }

  return (
    <section aria-labelledby="print-builder-heading" className="print-builder screen-only">
      <p aria-live="polite" className="sr-only">{snapshot.announcementRequest?.message ?? ""}</p>
      <h2 id="print-builder-heading">Choose what to print</h2>
      <p>
        Counts are limited by what this release contains. Each product is saved separately so
        questions, keys, and explanations can begin on distinct sheets.
      </p>
      {snapshot.state.tag === "recoverable-error" ? (
        <section className="status-panel status-panel-danger" role="alert" aria-labelledby="print-error-heading">
          <h3 id="print-error-heading" ref={errorRef} tabIndex={-1}>Print preview was not generated</h3>
          <p>{snapshot.state.detail}</p>
        </section>
      ) : null}
      <form onSubmit={submit}>
        <label htmlFor="print-profile">Practicing for</label>
        <select id="print-profile" value={profileId} onChange={(event) => setProfileId(event.target.value)}>
          <option disabled value="">Choose a study profile</option>
          {bootstrap.profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>{profile.label}</option>
          ))}
        </select>
        {selectedProfile === undefined
          ? <p className="source-note">Choose the statewide series or a jurisdiction-specific profile before building a packet. The choice controls which content can be printed.</p>
          : <p className="source-note"><strong>Practicing for: {selectedProfile.label}.</strong> {selectedProfile.disclaimer}</p>}

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

        <label htmlFor="print-filter">Content filter</label>
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
          : "Filter by the published question category, tool family, or scene environment."}</p>

        <div className="print-control-grid">
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

        <details className="source-note">
          <summary>Repeat this exact set</summary>
          <label htmlFor="print-seed">
            Set code
            <input id="print-seed" maxLength={deterministicSeedMaxLength} value={seed} onChange={(event) => setSeed(event.target.value)} />
            <span className="field-hint">The same settings and code always produce the same items.</span>
          </label>
        </details>

        <fieldset>
          <legend>Accessibility and output</legend>
          <label><input type="checkbox" checked={printSize === "large"} onChange={(event) => setPrintSize(event.target.checked ? "large" : "normal")} /> Large print (at least 18pt)</label>
          <label><input type="checkbox" checked={grayscalePreview} onChange={(event) => setGrayscalePreview(event.target.checked)} /> Grayscale preview</label>
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
        </fieldset>

        <p className="status-text" role="status" aria-live="polite">
          {snapshot.state.tag === "generating" ? "Generating and saving preview…" : ""}
        </p>
        <button className="button" type="submit" disabled={disabled || seed.trim().length === 0 || seed.trim().length > deterministicSeedMaxLength || count < 1 || count > capacity}>
          Generate preview
        </button>
      </form>
    </section>
  )
}
