import { ReviewQuestionBootstrap } from "../../review/model.ts"
import { practiceInventoryFromReview } from "../../practice/review-source.ts"
import { assemblePracticeQuestions } from "../../practice/question-set.ts"
import { parsePracticeSetId } from "../../practice/set.ts"
import { PrecommitQuestion } from "@nycustodian/content/model"
import { Schema } from "effect"
import { createRoot } from "react-dom/client"
import { appRuntime, disposeAppRuntime } from "../../app-runtime.ts"
import { QuestionAttemptReceipt, questionAttemptId, sameQuestionReceipt } from "../../attempt-receipt.ts"
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

const mountPlayer = (): void => {
  const question = Schema.decodeUnknownSync(PrecommitQuestion)(JSON.parse(data.textContent))
  let receipt = Schema.decodeUnknownSync(QuestionAttemptReceipt)(JSON.parse(receiptData.textContent))
  if (receipt.questionId !== question.id) {
    throw new Error("Question receipt does not match the released precommit item")
  }
  let positionLabel = mount.dataset.positionLabel
  const params = new URLSearchParams(window.location.search)
  if (params.has("set") || params.has("position")) {
    try {
      if (params.getAll("set").length !== 1 || params.getAll("position").length !== 1) throw new Error("Ambiguous set link")
      const setId = params.get("set")!
      const positionText = params.get("position")!
      const position = Schema.decodeUnknownSync(Schema.Int.check(Schema.isGreaterThan(0)))(Number(positionText))
      if (String(position) !== positionText) throw new Error("Invalid set position")
      const inventoryData = document.querySelector<HTMLScriptElement>("#practice-inventory-data")
      const sources = Schema.decodeUnknownSync(Schema.Array(ReviewQuestionBootstrap))(JSON.parse(inventoryData?.textContent ?? "null"))
      const inventory = practiceInventoryFromReview(sources)
      const spec = parsePracticeSetId(setId, [...new Set(inventory.map(({ category }) => category))])
      if (spec === undefined) throw new Error("Unavailable set configuration")
      const steps = assemblePracticeQuestions(inventory, spec)
      const step = steps[position - 1]
      if (step === undefined || step.source.id !== question.id || step.source.itemUrl !== window.location.pathname ||
        !sameQuestionReceipt(step.source.receipt, receipt) ||
        step.source.optionIds.length !== question.options.length ||
        !step.source.optionIds.every((id, index) => id === question.options[index]?.id)) throw new Error("Set item does not match this document")
      receipt = step.receipt
      positionLabel = `Question ${position} of ${steps.length}`
      document.title = `${positionLabel} — NY Custodian Exam`
      const navigation = document.querySelector<HTMLElement>('.directional-nav[aria-label="Question navigation"]')
      if (navigation !== null) {
        navigation.replaceChildren()
        for (const [target, label] of [[steps[position - 2], "← Previous question"], [steps[position], "Next question →"]] as const) {
          const node = document.createElement(target === undefined ? "span" : "a")
          node.textContent = target === undefined ? (label.startsWith("Next") ? "End of set" : "") : label
          if (node instanceof HTMLAnchorElement && target !== undefined) {
            node.href = target.href
            node.dataset.sessionHistory = "replace"
          }
          navigation.append(node)
        }
      }
    } catch {
      const heading = document.createElement("h1")
      heading.textContent = "This practice set is unavailable"
      const detail = document.createElement("p")
      detail.textContent = "The set link does not match this released question. No answer was saved. Return to Practice to build another set."
      const link = document.createElement("a")
      link.href = "/practice/"
      link.textContent = "Return to Practice"
      mount.replaceChildren(heading, detail, link)
      document.querySelector('.directional-nav[aria-label="Question navigation"]')?.remove()
      return
    }
  }
  mount.dataset.questionAttemptId = questionAttemptId(receipt)
  const controller = createQuestionController(question, appRuntime, receipt)

  const nextHref = [...document.querySelectorAll<HTMLAnchorElement>('.directional-nav[aria-label="Question navigation"] a')]
    .find((anchor) => anchor.textContent?.startsWith("Next question"))?.getAttribute("href") ?? undefined
  const root = createRoot(mount)
  const removeSessionNavigation = installSessionNavigation()
  root.render(
    <QuestionPlayer.Provider controller={controller}>
      <PracticeNonvisualQuestion {...(positionLabel === undefined ? {} : { positionLabel })} {...(nextHref === undefined ? {} : { nextHref })} />
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

}
mountPlayer()
