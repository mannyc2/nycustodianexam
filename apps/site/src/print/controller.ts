import type { Effect } from "effect"
import { LocalActionError } from "../local-failure-detail.ts"
import { makeScreenStore, type ScreenSnapshot } from "../screen/store.ts"
import type { VerifiedContent } from "../verified-content.ts"
import {
  decodePrintJobId,
  printPreviewPath,
  type PrintBuilderBootstrap,
  type PrintJobRecord,
  type PrintSettings
} from "./model.ts"
import type { PrintPersistence } from "./persistence.ts"
import {
  createPrintJob,
  recordSystemPrintRequest,
  restorePrintJob
} from "./workflow.ts"

export interface PrintEffectRunner {
  readonly runPromise: <A, E>(
    effect: Effect.Effect<A, E, PrintPersistence | VerifiedContent>
  ) => Promise<A>
}

export type PrintBuilderState =
  | { readonly tag: "configuring" }
  | { readonly tag: "generating" }
  | { readonly tag: "recoverable-error"; readonly detail: string }

export type PrintBuilderSnapshot = ScreenSnapshot<PrintBuilderState, "error-summary">

export interface PrintBuilderController {
  readonly getSnapshot: () => PrintBuilderSnapshot
  readonly getHydrationSnapshot: () => PrintBuilderSnapshot
  readonly subscribe: (listener: () => void) => () => void
  readonly generate: (settings: PrintSettings) => void
  readonly acknowledgeViewRequest: (requestId: string) => void
  readonly dispose: () => void
}

export type PrintPreviewState =
  | { readonly tag: "restoring" }
  | { readonly tag: "preview-ready"; readonly job: PrintJobRecord }
  | { readonly tag: "stale"; readonly job: PrintJobRecord }
  | { readonly tag: "system-print-requested"; readonly job: PrintJobRecord }
  | { readonly tag: "regenerating"; readonly job: PrintJobRecord }
  | { readonly tag: "regenerate-error"; readonly job: PrintJobRecord; readonly detail: string }
  | { readonly tag: "content-unavailable"; readonly detail: string }
  | { readonly tag: "recoverable-error"; readonly detail: string }

export type PrintPreviewSnapshot = ScreenSnapshot<
  PrintPreviewState,
  "preview-heading" | "error-summary"
>

export interface PrintPreviewController {
  readonly getSnapshot: () => PrintPreviewSnapshot
  readonly getHydrationSnapshot: () => PrintPreviewSnapshot
  readonly subscribe: (listener: () => void) => () => void
  readonly start: () => void
  readonly retryRestore: () => void
  readonly regenerate: () => void
  readonly requestSystemPrint: () => void
  readonly acknowledgeViewRequest: (requestId: string) => void
  readonly dispose: () => void
}

const safeError = (cause: unknown): string => {
  if (cause instanceof LocalActionError) return cause.message
  console.error("Print operation failed", cause)
  return "The print operation could not be completed on this device. The saved preview was not changed — try again."
}

const exactJob = (job: PrintJobRecord, expectedId: string): PrintJobRecord => {
  if (job.id !== expectedId) {
    throw new LocalActionError("Regeneration produced a different print job, so the saved preview was kept unchanged.")
  }
  return job
}

export const createPrintBuilderController = (input: {
  readonly bootstrap: PrintBuilderBootstrap
  readonly runtime: PrintEffectRunner
  readonly createId: () => string
  readonly navigate: (path: string) => void
}): PrintBuilderController => {
  const screen = makeScreenStore<PrintBuilderState, "error-summary">({
    initialState: { tag: "configuring" },
    requestIdPrefix: "print-builder-"
  })
  return {
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    generate: (settings) => {
      if (screen.getSnapshot().state.tag === "generating") return
      let id: string
      try {
        id = decodePrintJobId(input.createId())
      } catch (cause) {
        screen.publish(
          { tag: "recoverable-error", detail: safeError(cause) },
          { focus: "error-summary" }
        )
        return
      }
      screen.publish({ tag: "generating" }, { announce: "Generating and saving the print preview." })
      void input.runtime.runPromise(createPrintJob({ id, bootstrap: input.bootstrap, settings }))
        .then((job) => input.navigate(printPreviewPath(exactJob(job, id).id)))
        .catch((cause: unknown) => {
          screen.publish(
            { tag: "recoverable-error", detail: safeError(cause) },
            { focus: "error-summary" }
          )
        })
    },
    acknowledgeViewRequest: screen.acknowledgeRequest,
    dispose: screen.dispose
  }
}

export const createPrintPreviewController = (input: {
  readonly id: string
  readonly bootstrap?: PrintBuilderBootstrap
  readonly loadBootstrap?: () => Promise<PrintBuilderBootstrap>
  readonly runtime: PrintEffectRunner
  readonly createId: () => string
  readonly replaceLocation: (path: string) => void
  readonly openSystemPrint: () => void
}): PrintPreviewController => {
  const expectedId = decodePrintJobId(input.id)
  const screen = makeScreenStore<
    PrintPreviewState,
    "preview-heading" | "error-summary"
  >({ initialState: { tag: "restoring" }, requestIdPrefix: "print-preview-" })

  const restore = (): void => {
    screen.publish({ tag: "restoring" }, { announce: "Restoring the saved print preview." })
    void input.runtime.runPromise(restorePrintJob(expectedId))
      .then((job) => {
        if (job === undefined) {
          screen.publish(
            {
              tag: "content-unavailable",
              detail: "This print job is not retained on this device. Return to the print center to generate it again."
            },
            { focus: "error-summary" }
          )
          return
        }
        exactJob(job, expectedId)
        screen.publish(
          job.status === "stale"
            ? { tag: "stale", job }
            : job.status === "system-print-requested"
              ? { tag: "system-print-requested", job }
              : { tag: "preview-ready", job },
          { focus: "preview-heading" }
        )
      })
      .catch((cause: unknown) => {
        screen.publish(
          { tag: "recoverable-error", detail: safeError(cause) },
          { focus: "error-summary" }
        )
      })
  }

  const regenerate = (): void => {
    const state = screen.getSnapshot().state
    const job = state.tag === "preview-ready" || state.tag === "stale" ||
        state.tag === "system-print-requested" || state.tag === "regenerate-error"
      ? state.job
      : undefined
    if (job === undefined) return
    let id: string
    try {
      id = decodePrintJobId(input.createId())
    } catch (cause) {
      screen.publish(
        { tag: "regenerate-error", job, detail: safeError(cause) },
        { focus: "error-summary" }
      )
      return
    }
    screen.publish(
      { tag: "regenerating", job },
      { announce: "Regenerating the packet from your saved print settings." }
    )
    const loadBootstrap = input.bootstrap === undefined
      ? input.loadBootstrap
      : () => Promise.resolve(input.bootstrap as PrintBuilderBootstrap)
    if (loadBootstrap === undefined) {
      screen.publish(
        { tag: "regenerate-error", job, detail: "The current printable content is unavailable." },
        { focus: "error-summary" }
      )
      return
    }
    void loadBootstrap().then((bootstrap) => input.runtime.runPromise(createPrintJob({
      id,
      bootstrap,
      settings: job.manifest.settings
    }))).then((created) => {
      input.replaceLocation(printPreviewPath(exactJob(created, id).id))
    }).catch((cause: unknown) => {
        screen.publish(
          { tag: "regenerate-error", job, detail: safeError(cause) },
          {
            focus: "error-summary",
            announce: "The print job was not regenerated. The previous preview remains available."
          }
        )
    })
  }

  return {
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    start: () => screen.start(restore),
    retryRestore: restore,
    regenerate,
    requestSystemPrint: () => {
      const state = screen.getSnapshot().state
      if (state.tag !== "preview-ready" && state.tag !== "system-print-requested") return
      void input.runtime.runPromise(recordSystemPrintRequest(expectedId))
        .then((job) => {
          exactJob(job, expectedId)
          screen.publish(
            { tag: "system-print-requested", job },
            { announce: "The system print dialog was requested. Printing is not confirmed." }
          )
          input.openSystemPrint()
        })
        .catch((cause: unknown) => {
          screen.publish(
            { tag: "recoverable-error", detail: safeError(cause) },
            { focus: "error-summary" }
          )
        })
    },
    acknowledgeViewRequest: screen.acknowledgeRequest,
    dispose: screen.dispose
  }
}
