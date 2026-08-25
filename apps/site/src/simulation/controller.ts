import { PostcommitQuestion, PostcommitScene } from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import { makeScreenStore, type ScreenSnapshot } from "../screen/store.ts"
import { VerifiedContent } from "../verified-content.ts"
import {
  encodeCanonicalBase64,
  retainImageBlob,
  type RetainedImageAsset
} from "../retained-image.ts"
import { evaluateSimulation } from "./generation.ts"
import {
  SimulationPersistence,
  SimulationPersistenceError,
  validateSimulationSession
} from "./persistence.ts"
import {
  SimulationSessionRecord,
  SimulationSubmissionRecord,
  simulationItemId,
  simulationResultsPath
} from "./model.ts"

export type SimulationPlayerState =
  | { readonly tag: "restoring" }
  | {
      readonly tag: "ready"
      readonly session: SimulationSessionRecord
      readonly confirmation: boolean
      readonly saving: boolean
      readonly strictExpiryPending: boolean
      readonly visualAssetUrl: string | null
      readonly recoverableError: null | {
        readonly kind: "response" | "timer" | "submission"
        readonly detail: string
      }
    }
  | { readonly tag: "failure"; readonly detail: string }

export type SimulationPlayerCommand =
  | { readonly tag: "select-option"; readonly optionId: string }
  | { readonly tag: "add-hazard-marker"; readonly x: number; readonly y: number }
  | {
      readonly tag: "move-hazard-marker"
      readonly markerId: string
      readonly deltaX: number
      readonly deltaY: number
    }
  | { readonly tag: "remove-hazard-marker"; readonly markerId: string }
  | { readonly tag: "toggle-hazard-zone"; readonly zoneOrder: number }
  | { readonly tag: "toggle-zero-hazards" }
  | { readonly tag: "toggle-flag" }
  | { readonly tag: "open-confirmation" }
  | { readonly tag: "cancel-confirmation" }
  | { readonly tag: "submit-final" }
  | { readonly tag: "toggle-timer" }
  | { readonly tag: "timer-expired" }
  | { readonly tag: "retry-save" }
  | { readonly tag: "retry" }

export interface SimulationEffectRunner {
  readonly runPromise: <A, E>(
    effect: Effect.Effect<A, E, SimulationPersistence | VerifiedContent>
  ) => Promise<A>
}

export interface SimulationPlayerController {
  readonly getSnapshot: () => ScreenSnapshot<SimulationPlayerState, "error" | "recoverable-error" | "confirmation">
  readonly getHydrationSnapshot: () => ScreenSnapshot<SimulationPlayerState, "error" | "recoverable-error" | "confirmation">
  readonly subscribe: (listener: () => void) => () => void
  readonly acknowledgeRequest: (requestId: string) => void
  readonly dispatch: (command: SimulationPlayerCommand) => void
  readonly start: () => void
  readonly dispose: () => void
}

const safeError = (cause: unknown): string =>
  cause instanceof Error && cause.message.length > 0
    ? cause.message
    : typeof cause === "object" && cause !== null &&
        "detail" in cause && typeof cause.detail === "string" && cause.detail.length > 0
      ? cause.detail
    : "The local simulation operation could not be completed."

const loadSession = Effect.fn("Simulation.loadSession")(function*(sessionId: string) {
  const persistence = yield* SimulationPersistence
  const session = yield* persistence.findSession(sessionId)
  if (session === undefined) {
    return yield* new SimulationPersistenceError({
      operation: "restore-session",
      detail: "This simulation is not available on this device. Start a new site-designed simulation.",
      cause: new Error("Missing local simulation")
    })
  }
  return session
})

export const createLocallyClosedSimulation = Effect.fn(
  "Simulation.createLocallyClosedSession"
)(function*(session: SimulationSessionRecord) {
  const validated = yield* Effect.try({
    try: () => validateSimulationSession(session),
    catch: (cause) => new SimulationPersistenceError({
      operation: "prepare-local-content",
      detail: "The selected simulation did not have a valid release, profile, and receipt identity closure.",
      cause
    })
  })
  const verifiedContent = yield* VerifiedContent
  for (const item of validated.items) {
    const itemId = simulationItemId(item)
    const availability = yield* verifiedContent.ensureAvailable(item.receipt).pipe(
      Effect.mapError((cause) =>
        new SimulationPersistenceError({
          operation: "prepare-local-content",
          detail: `Availability metadata for the pinned result receipt ${itemId} could not be verified.`,
          cause
        })
      )
    )
    if (
      availability.path !== item.receipt.postcommitPath ||
      availability.source !== "verified-cache"
    ) {
      return yield* new SimulationPersistenceError({
        operation: "prepare-local-content",
        detail: `Pinned result receipt ${itemId} is not retained in the verified local content closure.`,
        cause: new Error("Postcommit receipt is not in verified cache")
      })
    }
    if (!("question" in item) && item.visualAsset !== null) {
      const assetAvailability = yield* verifiedContent.ensureAssetAvailable(item.visualAsset).pipe(
        Effect.mapError((cause) =>
          new SimulationPersistenceError({
            operation: "prepare-local-content",
            detail: `Availability metadata for the pinned scene asset ${itemId} could not be verified.`,
            cause
          })
        )
      )
      if (
        assetAvailability.path !== item.visualAsset.path ||
        assetAvailability.source !== "verified-cache"
      ) {
        return yield* new SimulationPersistenceError({
          operation: "prepare-local-content",
          detail: `Pinned scene asset ${itemId} is not retained in the verified local content closure.`,
          cause: new Error("Hazard asset receipt is not in verified cache")
        })
      }
    }
  }
  const persistence = yield* SimulationPersistence
  return yield* persistence.createSession(validated)
})

const patchLocalResponse = (
  session: SimulationSessionRecord,
  questionId: string,
  selectedOptionId: string | null,
  reviewIntent: "unflagged" | "flagged",
  hazard: {
    readonly markers: ReadonlyArray<{ readonly id: string; readonly x: number; readonly y: number }>
    readonly selectedZoneOrders: ReadonlyArray<number>
    readonly zeroHazardsConfirmed: boolean
  } = { markers: [], selectedZoneOrders: [], zeroHazardsConfirmed: false }
): SimulationSessionRecord => {
  const responses = session.responses.filter((response) => response.questionId !== questionId)
  responses.push({ questionId, selectedOptionId, reviewIntent, ...hazard, updatedAt: Date.now() })
  const positions = new Map(session.items.map((item) => [simulationItemId(item), item.position]))
  responses.sort((left, right) =>
    (positions.get(left.questionId) ?? 0) - (positions.get(right.questionId) ?? 0)
  )
  return new SimulationSessionRecord({ ...session, responses })
}

const clampCoordinate = (value: number): number => Math.max(0, Math.min(1, value))

const nextHazardMarkerId = (
  markers: ReadonlyArray<{ readonly id: string }>
): string => {
  const greatest = markers.reduce((current, marker) => {
    const match = /^marker-([1-9][0-9]*)$/.exec(marker.id)
    return match === null ? current : Math.max(current, Number(match[1]))
  }, 0)
  return `marker-${greatest + 1}`
}

export const createSimulationPlayerController = (input: {
  readonly runtime: SimulationEffectRunner
  readonly sessionId: string
  readonly position: number
  readonly replaceLocation: (path: string) => void
}): SimulationPlayerController => {
  type ReadyState = Extract<SimulationPlayerState, { readonly tag: "ready" }>
  type SaveOperation = {
    readonly kind: "response" | "timer"
    readonly optimistic: SimulationSessionRecord
    readonly persist: () => Promise<SimulationSessionRecord>
    readonly savingAnnouncement: string
    readonly savedAnnouncement: string
    readonly failureAnnouncement: string
  }

  const screen = makeScreenStore<
    SimulationPlayerState,
    "error" | "recoverable-error" | "confirmation"
  >({
    initialState: { tag: "restoring" },
    requestIdPrefix: "simulation-"
  })
  let disposed = false
  let persisted: SimulationSessionRecord | undefined
  let saveQueue: Promise<void> = Promise.resolve()
  let retryOperation: (() => void) | undefined
  let strictExpiryPending = false
  let finalSubmissionStarted = false
  let activeAssetUrl: string | null = null

  const releaseAssetUrl = (): void => {
    if (activeAssetUrl === null) return
    URL.revokeObjectURL(activeAssetUrl)
    activeAssetUrl = null
  }

  let submitFinal: (state: ReadyState, requireConfirmation: boolean) => void

  const restore = (): void => {
    retryOperation = undefined
    strictExpiryPending = false
    finalSubmissionStarted = false
    screen.publish({ tag: "restoring" }, { announce: "Restoring the local simulation." })
    void input.runtime.runPromise(
      Effect.gen(function*() {
        const persistence = yield* SimulationPersistence
        const session = yield* loadSession(input.sessionId)
        if (input.position < 1 || input.position > session.actualLength) {
          return yield* new SimulationPersistenceError({
            operation: "restore-position",
            detail: "That question position is outside this saved simulation.",
            cause: new Error("Invalid simulation position")
          })
        }
        if (session.status !== "active") return { session, visualAsset: null }
        const positioned = yield* persistence.setPosition(session.id, input.position)
        const item = positioned.items[input.position - 1]
        if (item === undefined || "question" in item || item.visualAsset === null) {
          return { session: positioned, visualAsset: null }
        }
        const verifiedContent = yield* VerifiedContent
        const visualAsset = yield* verifiedContent.loadCachedAssetBlob(item.visualAsset).pipe(
          Effect.mapError((cause) => new SimulationPersistenceError({
            operation: "restore-scene-asset",
            detail: "The exact pinned scene image is no longer retained on this device.",
            cause
          }))
        )
        return { session: positioned, visualAsset }
      })
    ).then(
      ({ session, visualAsset }) => {
        if (disposed) return
        if (session.status !== "active") {
          input.replaceLocation(simulationResultsPath(session.id))
          return
        }
        releaseAssetUrl()
        activeAssetUrl = visualAsset === null ? null : URL.createObjectURL(visualAsset)
        persisted = session
        screen.publish({
          tag: "ready",
          session,
          confirmation: false,
          saving: false,
          strictExpiryPending: false,
          visualAssetUrl: activeAssetUrl,
          recoverableError: null
        })
      },
      (cause) => {
        if (!disposed) screen.publish(
          { tag: "failure", detail: safeError(cause) },
          { focus: "error", announce: "The saved simulation could not be restored." }
        )
      }
    )
  }

  const queueSave = (operation: SaveOperation): void => {
    const state = screen.getSnapshot().state
    if (state.tag !== "ready" || state.saving || finalSubmissionStarted) return
    retryOperation = undefined
    screen.publish({
      ...state,
      session: operation.optimistic,
      confirmation: false,
      saving: true,
      strictExpiryPending,
      recoverableError: null
    }, { announce: operation.savingAnnouncement })

    const task = saveQueue.then(operation.persist)
    saveQueue = task.then(() => undefined, () => undefined)
    void task.then(
      (saved) => {
        persisted = saved
        retryOperation = undefined
        if (disposed) return
        const ready: ReadyState = {
          tag: "ready",
          session: saved,
          confirmation: false,
          saving: false,
          strictExpiryPending,
          visualAssetUrl: state.visualAssetUrl,
          recoverableError: null
        }
        screen.publish(ready, { announce: operation.savedAnnouncement })
        if (strictExpiryPending) submitFinal(ready, false)
      },
      (cause) => {
        if (disposed) return
        retryOperation = () => queueSave(operation)
        screen.publish({
          tag: "ready",
          session: operation.optimistic,
          confirmation: false,
          saving: false,
          strictExpiryPending,
          visualAssetUrl: state.visualAssetUrl,
          recoverableError: { kind: operation.kind, detail: safeError(cause) }
        }, {
          focus: "recoverable-error",
          announce: operation.failureAnnouncement
        })
      }
    )
  }

  const saveResponse = (
    session: SimulationSessionRecord,
    questionId: string,
    selectedOptionId: string | null,
    reviewIntent: "unflagged" | "flagged",
    hazard: {
      readonly markers: ReadonlyArray<{ readonly id: string; readonly x: number; readonly y: number }>
      readonly selectedZoneOrders: ReadonlyArray<number>
      readonly zeroHazardsConfirmed: boolean
    } = { markers: [], selectedZoneOrders: [], zeroHazardsConfirmed: false }
  ): void => {
    const item = session.items[input.position - 1]
    if (item === undefined || simulationItemId(item) !== questionId) return
    const optimistic = patchLocalResponse(
      session,
      questionId,
      selectedOptionId,
      reviewIntent,
      hazard
    )
    queueSave({
      kind: "response",
      optimistic,
      persist: () => input.runtime.runPromise(
        Effect.gen(function*() {
          const persistence = yield* SimulationPersistence
          return yield* persistence.saveResponse({
            sessionId: session.id,
            questionId,
            selectedOptionId,
            ...hazard,
            reviewIntent
          })
        })
      ),
      savingAnnouncement: "Saving this response locally.",
      savedAnnouncement: "Response saved on this device.",
      failureAnnouncement: "The response was not saved. The edit remains visible and can be retried."
    })
  }

  const saveTimerVisibility = (
    session: SimulationSessionRecord,
    timerVisible: boolean
  ): void => {
    if (session.timing.mode !== "timed") return
    const optimistic = new SimulationSessionRecord({
      ...session,
      timing: { ...session.timing, timerVisible }
    })
    queueSave({
      kind: "timer",
      optimistic,
      persist: () => input.runtime.runPromise(
        Effect.gen(function*() {
          const persistence = yield* SimulationPersistence
          return yield* persistence.setTimerVisibility(session.id, timerVisible)
        })
      ),
      savingAnnouncement: timerVisible
        ? "Showing the practice timer and saving that preference."
        : "Hiding the practice timer and saving that preference.",
      savedAnnouncement: "Timer display preference saved on this device.",
      failureAnnouncement: "The timer preference was not saved. The exact change can be retried."
    })
  }

  submitFinal = (
    state: ReadyState,
    requireConfirmation: boolean
  ): void => {
    if (
      finalSubmissionStarted || state.saving || state.recoverableError !== null ||
      requireConfirmation && !state.confirmation
    ) return
    finalSubmissionStarted = true
    retryOperation = undefined
    screen.publish({
      ...state,
      confirmation: requireConfirmation,
      saving: true,
      strictExpiryPending,
      recoverableError: null
    }, {
      announce: "Saving the final submission before results are loaded."
    })
    const task = saveQueue.then(async () => {
      const session = persisted ?? state.session
      await input.runtime.runPromise(
        Effect.gen(function*() {
          const persistence = yield* SimulationPersistence
          return yield* persistence.submit(session.id)
        })
      )
      if (!disposed) input.replaceLocation(simulationResultsPath(session.id))
    })
    saveQueue = task.then(() => undefined, () => undefined)
    void task.catch((cause) => {
      finalSubmissionStarted = false
      if (disposed) return
      const current = screen.getSnapshot().state
      const retained = current.tag === "ready" ? current.session : state.session
      retryOperation = () => {
        const retryState = screen.getSnapshot().state
        if (retryState.tag === "ready") submitFinal(retryState, false)
      }
      screen.publish({
        tag: "ready",
        session: retained,
        confirmation: state.confirmation,
        saving: false,
        strictExpiryPending,
        visualAssetUrl: state.visualAssetUrl,
        recoverableError: { kind: "submission", detail: safeError(cause) }
      }, {
        focus: "recoverable-error",
        announce: "The final submission was not saved. It can be retried without changing answers."
      })
    })
  }

  return {
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    acknowledgeRequest: screen.acknowledgeRequest,
    start: () => screen.start(restore),
    dispose: () => {
      disposed = true
      releaseAssetUrl()
      screen.dispose()
    },
    dispatch: (command) => {
      const state = screen.getSnapshot().state
      if (command.tag === "retry") {
        restore()
        return
      }
      if (state.tag !== "ready") return
      if (command.tag === "retry-save") {
        if (!state.saving) retryOperation?.()
        return
      }
      if (state.strictExpiryPending && command.tag !== "timer-expired") return
      const item = state.session.items[input.position - 1]
      if (item === undefined) return
      const itemId = simulationItemId(item)
      const response = state.session.responses.find(
        (candidate) => candidate.questionId === itemId
      )
      if (command.tag === "select-option") {
        if (state.saving || state.recoverableError?.kind === "timer" || state.recoverableError?.kind === "submission") return
        if (!("question" in item)) return
        if (!item.optionOrder.includes(command.optionId)) return
        saveResponse(
          state.session,
          itemId,
          command.optionId,
          response?.reviewIntent ?? "unflagged"
        )
      } else if (command.tag === "add-hazard-marker") {
        if (
          state.saving || state.recoverableError?.kind === "timer" ||
          state.recoverableError?.kind === "submission" || "question" in item ||
          item.mode !== "visual" || !Number.isFinite(command.x) || !Number.isFinite(command.y)
        ) return
        const markers = response?.markers ?? []
        if (markers.length >= 64) return
        saveResponse(state.session, itemId, null, response?.reviewIntent ?? "unflagged", {
          markers: [...markers, {
            id: nextHazardMarkerId(markers),
            x: clampCoordinate(command.x),
            y: clampCoordinate(command.y)
          }],
          selectedZoneOrders: [],
          zeroHazardsConfirmed: false
        })
      } else if (command.tag === "move-hazard-marker") {
        if (
          state.saving || state.recoverableError?.kind === "timer" ||
          state.recoverableError?.kind === "submission" || "question" in item ||
          item.mode !== "visual" || !Number.isFinite(command.deltaX) ||
          !Number.isFinite(command.deltaY)
        ) return
        const markers = response?.markers ?? []
        if (!markers.some((marker) => marker.id === command.markerId)) return
        saveResponse(state.session, itemId, null, response?.reviewIntent ?? "unflagged", {
          markers: markers.map((marker) => marker.id === command.markerId
            ? {
                ...marker,
                x: clampCoordinate(marker.x + command.deltaX),
                y: clampCoordinate(marker.y + command.deltaY)
              }
            : marker),
          selectedZoneOrders: [],
          zeroHazardsConfirmed: false
        })
      } else if (command.tag === "remove-hazard-marker") {
        if (
          state.saving || state.recoverableError?.kind === "timer" ||
          state.recoverableError?.kind === "submission" || "question" in item ||
          item.mode !== "visual"
        ) return
        const markers = response?.markers ?? []
        const retained = markers.filter((marker) => marker.id !== command.markerId)
        if (retained.length === markers.length) return
        saveResponse(state.session, itemId, null, response?.reviewIntent ?? "unflagged", {
          markers: retained,
          selectedZoneOrders: [],
          zeroHazardsConfirmed: false
        })
      } else if (command.tag === "toggle-hazard-zone") {
        if (
          state.saving || state.recoverableError?.kind === "timer" ||
          state.recoverableError?.kind === "submission" || "question" in item ||
          item.mode !== "nonvisual" ||
          !item.scene.neutralPreAnswer.zones.some((zone) => zone.order === command.zoneOrder)
        ) return
        const selected = new Set(response?.selectedZoneOrders ?? [])
        if (selected.has(command.zoneOrder)) selected.delete(command.zoneOrder)
        else selected.add(command.zoneOrder)
        const selectedZoneOrders = [...selected].sort((left, right) => left - right)
        saveResponse(state.session, itemId, null, response?.reviewIntent ?? "unflagged", {
          markers: [],
          selectedZoneOrders,
          zeroHazardsConfirmed: false
        })
      } else if (command.tag === "toggle-zero-hazards") {
        if (
          state.saving || state.recoverableError?.kind === "timer" ||
          state.recoverableError?.kind === "submission" || "question" in item ||
          (response?.markers?.length ?? 0) > 0 ||
          (response?.selectedZoneOrders?.length ?? 0) > 0
        ) return
        saveResponse(state.session, itemId, null, response?.reviewIntent ?? "unflagged", {
          markers: [],
          selectedZoneOrders: [],
          zeroHazardsConfirmed: response?.zeroHazardsConfirmed !== true
        })
      } else if (command.tag === "toggle-flag") {
        if (state.saving || state.recoverableError?.kind === "timer" || state.recoverableError?.kind === "submission") return
        saveResponse(
          state.session,
          itemId,
          response?.selectedOptionId ?? null,
          response?.reviewIntent === "flagged" ? "unflagged" : "flagged",
          {
            markers: response?.markers ?? [],
            selectedZoneOrders: response?.selectedZoneOrders ?? [],
            zeroHazardsConfirmed: response?.zeroHazardsConfirmed ?? false
          }
        )
      } else if (command.tag === "open-confirmation") {
        if (state.saving || state.recoverableError !== null) return
        screen.publish({ ...state, confirmation: true }, { focus: "confirmation" })
      } else if (command.tag === "cancel-confirmation") {
        screen.publish({ ...state, confirmation: false })
      } else if (command.tag === "submit-final") {
        submitFinal(state, true)
      } else if (command.tag === "toggle-timer") {
        if (state.saving || state.recoverableError !== null) return
        saveTimerVisibility(state.session, !state.session.timing.timerVisible)
      } else if (command.tag === "timer-expired") {
        const { timing } = state.session
        if (
          timing.mode === "timed" &&
          timing.durationSeconds !== null &&
          timing.autoSubmit &&
          Date.now() >= state.session.createdAt + timing.durationSeconds * 1_000
        ) {
          strictExpiryPending = true
          const pendingState: ReadyState = { ...state, strictExpiryPending: true }
          if (!state.strictExpiryPending) {
            screen.publish(pendingState, {
              announce: state.saving
                ? "Practice time expired. Automatic submission is waiting for the local save."
                : state.recoverableError !== null
                  ? "Practice time expired. Retry the local operation before automatic submission."
                  : "Practice time expired. Starting the opted-in final submission."
            })
          }
          if (!state.saving && state.recoverableError === null) submitFinal(pendingState, false)
        }
      }
    }
  }
}

export const reconcileSimulation = Effect.fn("Simulation.reconcileResults")(
  function*(sessionId: string) {
    const persistence = yield* SimulationPersistence
    const verifiedContent = yield* VerifiedContent
    const session = yield* loadSession(sessionId)
    const submission = yield* persistence.findSubmission(sessionId)
    if (submission === undefined || session.status === "active") {
      return yield* new SimulationPersistenceError({
        operation: "restore-submission",
        detail: "No durable final submission exists for this simulation.",
        cause: new Error("Missing final submission")
      })
    }
    if (submission.status === "evaluated") return { session, submission }

    const postcommit: Array<
      Readonly<{
        readonly payload: typeof PostcommitQuestion.Type | typeof PostcommitScene.Type
        readonly postcommitBase64: string
      }>
    > = []
    const retainedVisualAssets: Array<RetainedImageAsset> = []
    for (const item of session.items) {
      const artifact = yield* verifiedContent.loadJsonArtifact(item.receipt)
      const unknownAnswer = artifact.value
      const postcommitBase64 = encodeCanonicalBase64(artifact.bytes)
      if ("question" in item) {
        const answer = yield* Schema.decodeUnknownEffect(PostcommitQuestion)(unknownAnswer).pipe(
          Effect.mapError((cause) =>
            new SimulationPersistenceError({
              operation: "decode-answer",
              detail: `The verified answer for ${item.question.id} did not match its release schema.`,
              cause
            })
          )
        )
        if (answer.id !== item.question.id) {
          return yield* new SimulationPersistenceError({
            operation: "verify-answer",
            detail: "Verified result content did not match the submitted question.",
            cause: new Error("Postcommit question identity mismatch")
          })
        }
        postcommit.push({ payload: answer, postcommitBase64 })
      } else {
        const answer = yield* Schema.decodeUnknownEffect(PostcommitScene)(unknownAnswer).pipe(
          Effect.mapError((cause) =>
            new SimulationPersistenceError({
              operation: "decode-hazard-answer",
              detail: `The verified hazard answer for ${item.scene.id} did not match its release schema.`,
              cause
            })
          )
        )
        if (answer.opaqueAssetId !== item.scene.asset.opaqueAssetId) {
          return yield* new SimulationPersistenceError({
            operation: "verify-hazard-answer",
            detail: "Verified result content did not match the submitted hazard scene.",
            cause: new Error("Postcommit hazard identity mismatch")
          })
        }
        postcommit.push({ payload: answer, postcommitBase64 })
        if (item.mode === "visual") {
          if (item.visualAsset === null) {
            return yield* new SimulationPersistenceError({
              operation: "retain-hazard-image",
              detail: "The submitted visual hazard has no pinned image receipt.",
              cause: new Error("Missing visual asset receipt")
            })
          }
          const blob = yield* verifiedContent.loadCachedAssetBlob(item.visualAsset).pipe(
            Effect.mapError((cause) => new SimulationPersistenceError({
              operation: "retain-hazard-image",
              detail: "The exact submitted scene image is no longer retained on this device.",
              cause
            }))
          )
          const retained = yield* Effect.tryPromise({
            try: () => retainImageBlob(item.visualAsset as NonNullable<typeof item.visualAsset>, blob),
            catch: (cause) => new SimulationPersistenceError({
              operation: "retain-hazard-image",
              detail: "The exact submitted scene image failed durable integrity verification.",
              cause
            })
          })
          retainedVisualAssets.push(retained)
        }
      }
    }
    const evaluated = evaluateSimulation({
      session,
      submission,
      postcommit,
      retainedVisualAssets
    })
    const completed = yield* persistence.complete({
      sessionId,
      correctCount: evaluated.correctCount,
      results: evaluated.results
    })
    return {
      session: new SimulationSessionRecord({
        ...session,
        status: "evaluated",
        updatedAt: completed.evaluatedAt ?? session.updatedAt
      }),
      submission: completed
    }
  }
)

export type SimulationResultsState =
  | { readonly tag: "reconciling" }
  | {
      readonly tag: "results"
      readonly session: SimulationSessionRecord
      readonly submission: SimulationSubmissionRecord
    }
  | { readonly tag: "failure"; readonly detail: string }

export const createSimulationResultsController = (input: {
  readonly runtime: SimulationEffectRunner
  readonly sessionId: string
}) => {
  const screen = makeScreenStore<SimulationResultsState, "error" | "results">({
    initialState: { tag: "reconciling" },
    requestIdPrefix: "simulation-results-"
  })
  let disposed = false
  const reconcile = (): void => {
    screen.publish({ tag: "reconciling" }, {
      announce: "Reading the durable submission before loading verified results."
    })
    void input.runtime.runPromise(reconcileSimulation(input.sessionId)).then(
      ({ session, submission }) => {
        if (!disposed) screen.publish(
          { tag: "results", session, submission },
          { focus: "results", announce: "Practice results are ready." }
        )
      },
      (cause) => {
        if (!disposed) screen.publish(
          { tag: "failure", detail: safeError(cause) },
          { focus: "error", announce: "Practice results are not available yet." }
        )
      }
    )
  }
  return {
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    acknowledgeRequest: screen.acknowledgeRequest,
    start: () => screen.start(reconcile),
    retry: reconcile,
    dispose: () => {
      disposed = true
      screen.dispose()
    }
  }
}
