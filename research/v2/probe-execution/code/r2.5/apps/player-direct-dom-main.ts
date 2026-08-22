import { fixtureQuestion } from "@r25/fixture-content"
import { commitAttempt } from "@r25/fixture-effect-services"

const app = document.querySelector("#app")!
const heading = document.createElement("h1")
heading.textContent = fixtureQuestion.prompt
const list = document.createElement("div")
list.setAttribute("role", "radiogroup")
let selected = -1
fixtureQuestion.choices.forEach((choice, index) => {
  const label = document.createElement("label")
  const input = document.createElement("input")
  input.type = "radio"
  input.name = "choice"
  input.value = String(index)
  input.addEventListener("change", () => { selected = index })
  label.append(input, document.createTextNode(choice))
  list.append(label)
})
const commit = document.createElement("button")
commit.id = "commit"
commit.textContent = "Commit answer"
const outcome = document.createElement("p")
outcome.id = "outcome"
outcome.hidden = true
commit.addEventListener("click", () => {
  void commitAttempt(fixtureQuestion.id, selected, fixtureQuestion.correctIndex).then((attempt) => {
    outcome.hidden = false
    outcome.textContent = attempt.correct ? "Correct" : "Incorrect"
  }, () => {
    outcome.hidden = false
    outcome.textContent = "Select an option first"
  })
})
app.append(heading, list, commit, outcome)
