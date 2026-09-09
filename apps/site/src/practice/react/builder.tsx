import { SetupNavigation } from "./setup-navigation.tsx"
import { useMemo, useState } from "react"
import type { ReviewQuestionSource } from "../../review/model.ts"
import { practiceInventoryFromReview } from "../review-source.ts"
import { assemblePracticeQuestions } from "../question-set.ts"
import { practiceSetSeedLimit } from "../set.ts"

const categoryDescriptions: Readonly<Record<string, string>> = {
  "Cleaning tools and uses": "Recognizing cleaning tools and matching each one to the job.",
  "Minor maintenance and repair": "Hand tools for small repairs, including safe use and condition.",
  "Health and safety": "Safe work practices and identifying workplace hazards.",
  "Mixed-domain and scenario questions": "Questions that combine skills or present a workplace scenario."
}

export const PracticeBuilder = ({ sources }: { readonly sources: ReadonlyArray<ReviewQuestionSource> }) => {
  const inventory = useMemo(() => practiceInventoryFromReview(sources), [sources])
  const categories = useMemo(() => [...new Set(inventory.map(({ category }) => category))].sort(), [inventory])
  const [selected, setSelected] = useState<ReadonlyArray<string>>(categories)
  const [length, setLength] = useState(45)
  const [seed, setSeed] = useState("practice")
  const [failure, setFailure] = useState<string | null>(null)
  const capacity = inventory.filter(({ category }) => selected.includes(category)).length
  const lengths = [...new Set([45, 60, 90, length, ...(capacity > 0 ? [capacity] : [])])].sort((a, b) => a - b)
  const valid = Number.isSafeInteger(length) && length > 0 && length <= capacity && seed.trim().length > 0 && seed.trim().length <= practiceSetSeedLimit
  if (inventory.length === 0) return null
  return <section className="study-section practice-setup-section" id="practice-builder" tabIndex={-1} aria-labelledby="practice-builder-heading">
    <p className="eyebrow">Set up</p>
    <SetupNavigation current="practice" />
    <div className="simulation-setup-panel practice-builder">
    <aside className="setup-scope-note"><h3>What every set draws on</h3><p>One bank of {inventory.length} original questions for the New York Entry-Level Custodians and Janitors series. Your choices change the number of questions and the areas they come from.</p><p><a href="#covers">What practice covers</a>{" · "}<a href="/exams/">Compare with your announcement</a></p></aside>
    <h2 id="practice-builder-heading">Build a practice set</h2>
    <form className="simulation-settings" onSubmit={(event) => {
      event.preventDefault()
      if (!valid) return
      try {
        const first = assemblePracticeQuestions(inventory, { seed, categories: selected, length })[0]
        if (first === undefined) throw new Error("No matching items")
        window.location.assign(first.href)
      } catch {
        setFailure("This set could not be prepared from the available study material. Check your choices and try again.")
      }
    }}>
      <fieldset className="simulation-mix-fields"><legend>Content mix</legend>
        {categories.map((category) => <label key={category}><input type="checkbox" checked={selected.includes(category)} onChange={(event) => setSelected(event.target.checked ? [...selected, category] : selected.filter((value) => value !== category))} /><span className="practice-area-copy"><strong>{category}</strong><span>{categoryDescriptions[category]}</span></span><span className="practice-area-count">{inventory.filter((item) => item.category === category).length} questions</span></label>)}
        <p className="field-hint">Questions are shuffled across your chosen areas. No missed-question weighting or illustrated/written quotas.</p>
      </fieldset>
      <fieldset className="simulation-length-fields"><legend>Practice set length</legend>
        <p>45, 60 and 90 are presets. You can also use all matching questions, even when fewer than 45 match.</p>
        {capacity === 0 ? <p role="status">Select at least one content area.</p> : length > capacity ? <p className="notice notice-warning" role="status">Your chosen length of {length} no longer fits: {capacity} questions match. Choose a replacement before starting.</p> : null}
        <div className="answer-list">{lengths.map((count) => <label className="answer-option" key={count}><input type="radio" name="practice-builder-length" checked={count === length && length <= capacity} disabled={count > capacity} onChange={() => setLength(count)} /> <span>{count} questions{count === capacity ? " — all matching" : ""}{count > capacity ? " — unavailable" : ""}</span></label>)}</div>
      </fieldset>
      <section className="simulation-preview reference-card setup-summary" aria-labelledby="practice-summary-heading">
        <h3 id="practice-summary-heading">Your set, before you start</h3>
        <dl className="simulation-preview-facts">
          <div><dt>Task</dt><dd>Original multiple-choice questions</dd></div>
          <div><dt>Length</dt><dd>{length <= capacity ? `${length} of ${capacity} matching questions` : `${length} requested; choose a replacement length`}</dd></div>
          <div><dt>Content</dt><dd>{selected.length === 0 ? "No areas selected" : selected.join("; ")}</dd></div>
          <div><dt>Timing</dt><dd>Untimed — work at your own pace</dd></div>
          <div><dt>Feedback</dt><dd>After each saved answer</dd></div>
          <div><dt>Saved</dt><dd>Answers and flags for this set, on this device</dd></div>
        </dl>
        <p>Questions appear once in this set. Returning to the same set keeps answers you have already saved.</p>
      </section>
      <details className="simulation-repeat-fields practice-repeat"><summary>Repeat a set</summary><label htmlFor="practice-set-code">Set code</label><input className="text-input" id="practice-set-code" value={seed} maxLength={practiceSetSeedLimit} onChange={(event) => setSeed(event.target.value)} required /><p>The same release, areas, length and code reproduce the same set. Saved answers for that set remain saved on this device.</p></details>
      {failure === null ? null : <p role="alert" className="notice notice-warning">{failure}</p>}
      <button type="submit" className="button button-primary" disabled={!valid}>Start this practice set</button>
      <p className="field-hint">Original, unofficial practice. Set lengths and content mix do not describe an official exam.</p>
    </form>
    </div>
  </section>
}
