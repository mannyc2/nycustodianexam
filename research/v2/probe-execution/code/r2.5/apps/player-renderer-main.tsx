import { render } from "preact"
import { useState } from "preact/hooks"
import { fixtureQuestion } from "@r25/fixture-content"
import { commitAttempt } from "@r25/fixture-effect-services"

const Player = () => {
  const [selected, setSelected] = useState(-1)
  const [outcome, setOutcome] = useState<string | null>(null)
  const commit = () => {
    void commitAttempt(fixtureQuestion.id, selected, fixtureQuestion.correctIndex).then(
      (attempt) => setOutcome(attempt.correct ? "Correct" : "Incorrect"),
      () => setOutcome("Select an option first")
    )
  }
  return (
    <div>
      <h1>{fixtureQuestion.prompt}</h1>
      <div role="radiogroup">
        {fixtureQuestion.choices.map((choice, index) => (
          <label key={choice}>
            <input type="radio" name="choice" value={index} onChange={() => setSelected(index)} />
            {choice}
          </label>
        ))}
      </div>
      <button id="commit" onClick={commit}>Commit answer</button>
      {outcome === null ? null : <p id="outcome">{outcome}</p>}
    </div>
  )
}

render(<Player />, document.querySelector("#app")!)
