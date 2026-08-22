const form = document.querySelector("#question-form")
const status = document.querySelector("#status")
const outcome = document.querySelector("#outcome")

let failNextCommit = true

const persistAttempt = async (selectedOptionId) => {
  if (failNextCommit) {
    failNextCommit = false
    throw new Error("Injected persistence failure")
  }
  return { attemptId: "fixture-attempt-1", selectedOptionId }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  const selected = new FormData(form).get("answer")
  if (typeof selected !== "string") return

  status.textContent = "Saving answer..."
  outcome.hidden = true
  outcome.textContent = ""

  try {
    await persistAttempt(selected)
    status.textContent = "Answer saved."
    outcome.textContent = selected === "b" ? "Correct" : "Incorrect"
    outcome.hidden = false
    outcome.focus()
  } catch {
    status.textContent = "Answer was not saved. Retry."
    outcome.hidden = true
    outcome.textContent = ""
  }
})
