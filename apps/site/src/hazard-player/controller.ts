import type { Effect } from "effect"
import type { HazardAttemptReceipt } from "../attempt-receipt.ts"
import { makeScreenStore, type ScreenSnapshot } from "../screen/store.ts"
import type { VerifiedContent } from "../verified-content.ts"
import type { HazardPersistence } from "./persistence.ts"
import {
  addMarker,
  cancelZeroConfirmation,
  confirmZeroHazards,
  draftFromState,
  hazardAssetUnavailable,
  hazardCommitFailed,
  hazardContentUnavailable,
  hazardRestoreFailed,
  hazardRevealFailed,
  initialHazardState,
  moveMarker,
  removeMarker,
  requestHazardCommit,
  revealHazard,
  toggleZone,
  type HazardScreenState
} from "./state.ts"
import type { HazardInputMode, PrecommitScene } from "./attempt.ts"
import type { HazardFocusRequest } from "./view-requests.ts"
import {
  commitHazardAndReveal,
  draftFromAttempt,
  restoreHazardAndReveal,
  retryHazardReveal
} from "./commit-and-reveal.ts"

export interface HazardEffectRunner {
  readonly runPromise: <A, E>(
    effect: Effect.Effect<A, E, HazardPersistence | VerifiedContent>
  ) => Promise<A>
}

export type HazardCommand =
  | { readonly tag: "add-marker"; readonly x: number; readonly y: number }
  | {
      readonly tag: "move-marker"
      readonly markerId: string
      readonly deltaX: number
      readonly deltaY: number
    }
  | { readonly tag: "remove-marker"; readonly markerId: string }
  | { readonly tag: "toggle-zone"; readonly zoneOrder: number }
  | { readonly tag: "request-commit" }
  | { readonly tag: "confirm-zero" }
  | { readonly tag: "cancel-zero" }
  | { readonly tag: "retry-commit" }
  | { readonly tag: "retry-reveal" }
  | { readonly tag: "retry-restore" }

export type HazardControllerSnapshot = ScreenSnapshot<
  HazardScreenState,
  HazardFocusRequest["target"]
>

export interface HazardController {
  readonly scene: PrecommitScene
  readonly mode: HazardInputMode
  readonly visualAssetUrl: string | null
  readonly getSnapshot: () => HazardControllerSnapshot
  readonly getHydrationSnapshot: () => HazardControllerSnapshot
  readonly subscribe: (listener: () => void) => () => void
  readonly dispatch: (command: HazardCommand) => void
  readonly acknowledgeViewRequest: (requestId: string) => void
  readonly start: () => void
  readonly dispose: () => void
}

const restoringState: HazardScreenState = { tag: "restoring" }

export const createHazardController = (input: {
  readonly scene: PrecommitScene
  readonly mode: HazardInputMode
  readonly receipt: HazardAttemptReceipt
  readonly runtime: HazardEffectRunner
  readonly visualAssetUrl: string | null
}): HazardController => {
  const screen = makeScreenStore<HazardScreenState, HazardFocusRequest["target"]>({
    initialState: restoringState,
    requestIdPrefix: "hazard-"
  })
  const allowedZoneOrders = new Set(
    input.scene.neutralPreAnswer.zones.map((zone) => zone.order)
  )
  const publish = screen.publish

  const restore = (): void => {
    publish(restoringState, { announce: "Checking this device for a saved scene response." })
    void input.runtime
      .runPromise(
        restoreHazardAndReveal({
          receipt: input.receipt,
          scene: input.scene,
          mode: input.mode
        })
      )
      .then((restored) => {
        if (restored === undefined) {
          publish(initialHazardState())
          return
        }
        if (restored.tag === "content_unavailable") {
          publish(
            hazardContentUnavailable(
              "Reconnect and reload this scene so its exact released feedback can be verified before you respond."
            ),
            { focus: "commit-error" }
          )
          return
        }
        const draft = draftFromAttempt(restored.attempt)
        if (restored.tag === "revealed") {
          publish(revealHazard(draft, restored.payload), { focus: "outcome" })
          return
        }
        publish(hazardRevealFailed(screen.getSnapshot().state, draft, restored.error.detail), {
          focus: "commit-error"
        })
      })
      .catch(() => {
        publish(
          hazardRestoreFailed(
            "This scene could not open study storage. Close other tabs if an update is blocked, then reload this scene. No feedback was revealed."
          ),
          { focus: "commit-error" }
        )
      })
  }

  const commit = (state: Extract<HazardScreenState, { readonly tag: "committing" }>): void => {
    const draft = draftFromState(state)
    void input.runtime
      .runPromise(
        commitHazardAndReveal({
          receipt: input.receipt,
          scene: input.scene,
          mode: input.mode,
          draft
        })
      )
      .then((result) => {
        if (result.tag === "content_unavailable") {
          publish(
            hazardContentUnavailable(
              "Reconnect and reload this scene so its exact released feedback can be verified before you respond."
            ),
            { focus: "commit-error" }
          )
          return
        }
        const committedDraft = draftFromAttempt(result.attempt)
        if (result.tag === "revealed") {
          publish(revealHazard(committedDraft, result.payload), {
            focus: "outcome",
            announce: "Scene response saved and feedback is available."
          })
          return
        }
        publish(
          hazardRevealFailed(screen.getSnapshot().state, committedDraft, result.error.detail),
          { focus: "commit-error" }
        )
      })
      .catch(() => {
        publish(
          hazardCommitFailed(
            screen.getSnapshot().state,
            "Your markers were not saved. They remain editable; retry when storage is available."
          ),
          { focus: "commit-error", announce: "Scene response was not saved." }
        )
      })
  }

  const requestCommit = (): void => {
    const state = screen.getSnapshot().state
    const selectedCount = input.mode === "visual"
      ? draftFromState(state).markers.length
      : draftFromState(state).selectedZoneOrders.length
    const next = requestHazardCommit(state, selectedCount)
    if (next === state) return
    if (next.tag === "confirm_zero") {
      publish(next, { focus: "zero-confirm" })
      return
    }
    if (next.tag === "committing") {
      publish(next, { announce: "Saving the scene response before loading feedback." })
      commit(next)
    }
  }

  const confirmZero = (): void => {
    const next = confirmZeroHazards(screen.getSnapshot().state)
    if (next.tag !== "committing") return
    publish(next, { announce: "Saving the zero-mark response before loading feedback." })
    commit(next)
  }

  const retryFeedback = (): void => {
    const state = screen.getSnapshot().state
    if (state.tag !== "reveal_failed") return
    const draft = draftFromState(state)
    publish({ tag: "committing", ...draft }, {
      announce: "Loading feedback for the saved scene response."
    })
    void input.runtime
      .runPromise(retryHazardReveal({
        receipt: input.receipt,
        scene: input.scene,
        mode: input.mode
      }))
      .then((payload) => {
        publish(revealHazard(draft, payload), { focus: "outcome" })
      })
      .catch(() => {
        publish(
          hazardRevealFailed(
            screen.getSnapshot().state,
            draft,
            "Your response remains saved, but its feedback could not be loaded."
          ),
          { focus: "commit-error" }
        )
      })
  }

  return {
    scene: input.scene,
    mode: input.mode,
    visualAssetUrl: input.visualAssetUrl,
    getSnapshot: screen.getSnapshot,
    getHydrationSnapshot: screen.getHydrationSnapshot,
    subscribe: screen.subscribe,
    dispatch: (command) => {
      switch (command.tag) {
        case "add-marker":
          if (input.mode === "visual") {
            const current = screen.getSnapshot().state
            const next = addMarker(current, { x: command.x, y: command.y })
            if (next !== current) publish(next, { announce: "Marker added." })
          }
          return
        case "move-marker":
          if (input.mode === "visual") {
            const current = screen.getSnapshot().state
            const next = moveMarker(current, command.markerId, {
              x: command.deltaX,
              y: command.deltaY
            })
            if (next !== current) publish(next)
          }
          return
        case "remove-marker":
          if (input.mode === "visual") {
            const current = screen.getSnapshot().state
            const next = removeMarker(current, command.markerId)
            if (next !== current) publish(next, { announce: "Marker removed." })
          }
          return
        case "toggle-zone":
          if (input.mode === "nonvisual" && allowedZoneOrders.has(command.zoneOrder)) {
            const current = screen.getSnapshot().state
            const next = toggleZone(current, command.zoneOrder)
            if (next !== current) publish(next)
          }
          return
        case "request-commit":
        case "retry-commit":
          requestCommit()
          return
        case "confirm-zero":
          confirmZero()
          return
        case "cancel-zero":
          {
            const current = screen.getSnapshot().state
            const next = cancelZeroConfirmation(current)
            if (next !== current) publish(next, { focus: "scene-heading" })
          }
          return
        case "retry-reveal":
          retryFeedback()
          return
        case "retry-restore":
          restore()
          return
      }
    },
    acknowledgeViewRequest: screen.acknowledgeRequest,
    start: () => screen.start(() => {
      if (input.mode === "visual" && input.visualAssetUrl === null) {
        publish(
          hazardAssetUnavailable(
            "This activity cannot accept visual markers without its exact released image."
          ),
          { focus: "commit-error" }
        )
        return
      }
      restore()
    }),
    dispose: screen.dispose
  }
}
