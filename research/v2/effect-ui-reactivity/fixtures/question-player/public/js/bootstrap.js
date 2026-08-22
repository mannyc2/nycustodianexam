import { createQuestionController } from "./controller.js"
import { createDirectView } from "./direct-view.js"
import { gradeAttempt } from "./grade-client.js"
import { openPersistence, resetDatabase } from "./persistence.js"
import { question } from "./question.js"

const params = new URLSearchParams(location.search)
if (params.get("reset") === "1") await resetDatabase()
const persistence = await openPersistence()
let failureMode = params.get("failure") ?? "success"
const renderer = document.body.dataset.renderer ?? "direct"
const view = renderer === "lit"
  ? (await import("./lit-view.js")).createLitView()
  : renderer === "template"
  ? (await import("./template-view.js")).createTemplateView()
  : createDirectView()
const controller = createQuestionController({
  question,
  persistence,
  grade: gradeAttempt,
  render: view.render,
  commitMode: () => failureMode
})

window.__fixture = Object.freeze({
  controller,
  setFailureMode(mode) { failureMode = mode },
  state() { return controller.getState() },
  disposed() { return controller.isDisposed() }
})

await controller.start()
