import { useHazardBuilder } from "./hazard-builder-provider.tsx"
import { practiceSetSeedLimit } from "../set.ts"

export const HazardSessionSetup = () => {
  const { actions } = useHazardBuilder()
  return <section className="simulation-setup-panel practice-builder" aria-labelledby="hazard-builder-heading">
      <HazardScope />
    <h2 id="hazard-builder-heading">Build a hazard drill</h2>
    <form className="simulation-settings" onSubmit={(event) => {
      event.preventDefault()
      actions.start()
    }}>
      <HazardLengthControls />
      <HazardModeControls />
      <HazardPreview />
      <HazardRepeatControls />
      <HazardStartAction />
    </form>
  </section>
}

export const HazardScope = () => {
  const { state: { sources } } = useHazardBuilder()
  return <aside className="setup-scope-note"><h2>What every drill draws on</h2><p>All {sources.length} original workplace scenes are available. Choose how many to practice and how you will respond. The two response modes are saved separately.</p><a href="/practice/#covers">What practice covers</a></aside>
}

export const HazardLengthControls = () => {
  const { state: { counts, length, sources }, actions } = useHazardBuilder()
  return <fieldset className="simulation-length-fields"><legend>How many scenes</legend><div className="answer-list">
        {counts.map((count) => <label className="answer-option" key={count}><input type="radio" name="drill-length" checked={length === count} disabled={count > sources.length} onChange={() => actions.setLength(count)} /><span>{count} {count === 1 ? "scene" : "scenes"}{count === sources.length ? " — all available" : ""}</span></label>)}
      </div><p className="field-hint">Each scene appears once. There is no official-length claim.</p></fieldset>
}

export const HazardModeControls = () => {
  const { state: { mode }, actions } = useHazardBuilder()
  return <fieldset className="simulation-format-fields"><legend>How you answer</legend>
        <label><input type="radio" name="drill-mode" checked={mode === "visual"} onChange={() => actions.setMode("visual")} /><span><strong>Mark the picture</strong><br />Place markers on the scene with a pointer or keyboard.</span></label>
        <label><input type="radio" name="drill-mode" checked={mode === "nonvisual"} onChange={() => actions.setMode("nonvisual")} /><span><strong>Read and select zones</strong><br />Use written scene zones without an image.</span></label>
        <p className="field-hint">Both tasks are keyboard operable. Written zones cover the same knowledge but are a different task from marking a picture.</p>
      </fieldset>
}

export const HazardPreview = () => {
  const { state: { mode, length, sources } } = useHazardBuilder()
  return <section className="simulation-preview reference-card setup-summary" aria-labelledby="hazard-summary-heading">
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
}

export const HazardRepeatControls = () => {
  const { state: { seed }, actions } = useHazardBuilder()
  return <details className="practice-repeat"><summary>Repeat a drill</summary><label htmlFor="hazard-set-code">Drill code</label><input className="text-input" id="hazard-set-code" value={seed} required maxLength={practiceSetSeedLimit} onChange={(event) => actions.setSeed(event.target.value)} /><p>The same release, scene count and code reproduce the same scene order. Responses already saved for this drill remain saved on this device.</p></details>
}

export const HazardStartAction = () => {
  const { state: { failure, valid }, meta } = useHazardBuilder()
  return <>
    {failure ? <p ref={meta.failureRef} tabIndex={-1} role="alert">This drill could not be prepared. Check your choices and try again.</p> : null}
      <button className="button button-primary" type="submit" disabled={!valid}>Start drill</button>
  </>
}
