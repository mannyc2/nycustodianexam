import { PrecommitQuestion } from "@nycustodian/content/model"
import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { QuestionAttemptReceipt } from "../../attempt-receipt.ts"
import { installSessionNavigation } from "../../session-navigation.ts"
import { createQuestionController } from "../controller.ts"
import { PracticeNonvisualQuestion, QuestionPlayer } from "./player.tsx"

const mount = document.querySelector<HTMLElement>("[data-question-player]")
const data = document.querySelector<HTMLScriptElement>("#question-data")
const receiptData = document.querySelector<HTMLScriptElement>("#question-receipt-data")

if (
  mount === null ||
  data?.textContent === undefined ||
  data.textContent === null ||
  receiptData?.textContent === undefined ||
  receiptData.textContent === null
) {
  throw new Error("Question player bootstrap contract is incomplete")
}

const question = Schema.decodeUnknownSync(PrecommitQuestion)(JSON.parse(data.textContent))
const receipt = Schema.decodeUnknownSync(QuestionAttemptReceipt)(JSON.parse(receiptData.textContent))
if (receipt.questionId !== question.id) {
  throw new Error("Question receipt does not match the released precommit item")
}
const controller = createQuestionController(question, appRuntime, receipt)

const root = createRoot(mount)
const removeSessionNavigation = installSessionNavigation()
root.render(
  <QuestionPlayer.Provider controller={controller}>
    <PracticeNonvisualQuestion />
  </QuestionPlayer.Provider>
)

queueMicrotask(() => controller.start())

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js")
  })
}

let cleanedUp = false
const cleanup = (): void => {
  if (cleanedUp) return
  cleanedUp = true
  removeSessionNavigation()
  root.unmount()
  controller.dispose()
  void disposeAppRuntime()
}

window.addEventListener("pagehide", (event) => {
  if (event.persisted) return
  cleanup()
})
