import { useState } from "react"
import type { ReviewSceneSource } from "../../review/model.ts"
import { assembleHazardDrill, type HazardPracticeMode } from "../hazard-set.ts"
import { practiceSetSeedLimit } from "../set.ts"

export const HazardBuilder = ({ sources }: { readonly sources: ReadonlyArray<ReviewSceneSource> }) => {
  const [length, setLength] = useState(1)
  const [mode, setMode] = useState<HazardPracticeMode>("visual")
  const [seed, setSeed] = useState("practice")
  const [failure, setFailure] = useState(false)
  const counts = [...new Set([1, 5, 10, ...(sources.length > 0 ? [sources.length] : [])])].sort((a, b) => a - b)
  return <section className="simulation-setup-panel practice-builder" aria-labelledby="hazard-builder-heading">
    <aside className="setup-scope-note"><h2>What every drill draws on</h2><p>All {sources.length} original workplace scenes are available. Choose how many to practice and how you will respond. The two response modes are saved separately.</p><a href="/practice/#covers">What practice covers</a></aside>
    <h2 id="hazard-builder-heading">Build a hazard drill</h2>
    <form className="simulation-settings" onSubmit={(event) => {
      event.preventDefault()
      try {
        const step = assembleHazardDrill(sources, { seed, length, mode })[0]
        if (step === undefined) throw new Error("Unavailable drill")
        window.location.assign(step.href)
      } catch { setFailure(true) }
    }}>
      <fieldset className="simulation-length-fields"><legend>How many scenes</legend><div className="answer-list">
        {counts.map((count) => <label className="answer-option" key={count}><input type="radio" name="drill-length" checked={length === count} disabled={count > sources.length} onChange={() => setLength(count)} /><span>{count} {count === 1 ? "scene" : "scenes"}{count === sources.length ? " — all available" : ""}</span></label>)}
      </div><p className="field-hint">Each scene appears once. There is no official-length claim.</p></fieldset>
      <fieldset className="simulation-format-fields"><legend>How you answer</legend>
        <label><input type="radio" name="drill-mode" checked={mode === "visual"} onChange={() => setMode("visual")} /><span><strong>Mark the picture</strong><br />Place markers on the scene with a pointer or keyboard.</span></label>
        <label><input type="radio" name="drill-mode" checked={mode === "nonvisual"} onChange={() => setMode("nonvisual")} /><span><strong>Read and select zones</strong><br />Use written scene zones without an image.</span></label>
        <p className="field-hint">Both tasks are keyboard operable. Written zones cover the same knowledge but are a different task from marking a picture.</p>
      </fieldset>
      <section className="simulation-preview reference-card setup-summary" aria-labelledby="hazard-summary-heading">
        <h3 id="hazard-summary-heading">Your drill, before you start</h3>
        <dl className="simulation-preview-facts">
          <div><dt>Task</dt><dd>{mode === "visual" ? "Hazard scenes — marking the picture" : "Hazard scenes — selecting written zones"}</dd></div>
          <div><dt>Length</dt><dd>{length} of {sources.length} reviewed scenes</dd></div>
          <div><dt>Timing</dt><dd>Untimed — work at your own pace</dd></div>
          <div><dt>Feedback</dt><dd>After each saved response</dd></div>
          <div><dt>Saved</dt><dd>One record per scene response in this drill, on this device</dd></div>
        </dl>
        <p>Visual and written-zone drills are different tasks. Their responses are saved separately, and neither is scored against the other.</p>
      </section>
      <details className="practice-repeat"><summary>Repeat a drill</summary><label htmlFor="hazard-set-code">Drill code</label><input className="text-input" id="hazard-set-code" value={seed} required maxLength={practiceSetSeedLimit} onChange={(event) => setSeed(event.target.value)} /><p>The same release, scene count and code reproduce the same scene order. Responses already saved for this drill remain saved on this device.</p></details>
      {failure ? <p role="alert">This drill could not be prepared. Check your choices and try again.</p> : null}
      <button className="button button-primary" type="submit" disabled={sources.length < length || seed.trim().length === 0}>Start drill</button>
    </form>
  </section>
}
