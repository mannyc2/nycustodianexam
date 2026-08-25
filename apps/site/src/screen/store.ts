import type { AnnouncementRequest, FocusRequest } from "./requests.ts"

export interface ScreenSnapshot<State, Target extends string> {
  readonly state: State
  readonly revision: number
  readonly focusRequest: FocusRequest<Target> | null
  readonly announcementRequest: AnnouncementRequest | null
}

export interface ScreenPublication<Target extends string> {
  readonly focus?: Target
  readonly announce?: string
}

export interface ScreenStore<State, Target extends string> {
  readonly getSnapshot: () => ScreenSnapshot<State, Target>
  readonly getHydrationSnapshot: () => ScreenSnapshot<State, Target>
  readonly subscribe: (listener: () => void) => () => void
  readonly publish: (state: State, request?: ScreenPublication<Target>) => void
  readonly acknowledgeRequest: (requestId: string) => void
  readonly start: (initialize: () => void) => void
  readonly dispose: () => void
}

export const makeScreenStore = <State, Target extends string>(input: {
  readonly initialState: State
  readonly requestIdPrefix?: string
}): ScreenStore<State, Target> => {
  const hydrationSnapshot: ScreenSnapshot<State, Target> = {
    state: input.initialState,
    revision: 0,
    focusRequest: null,
    announcementRequest: null
  }
  let snapshot = hydrationSnapshot
  let active = true
  let started = false
  const listeners = new Set<() => void>()
  const requestIdPrefix = input.requestIdPrefix ?? ""

  const notify = (): void => listeners.forEach((listener) => listener())

  return {
    getSnapshot: () => snapshot,
    getHydrationSnapshot: () => hydrationSnapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    publish: (state, request) => {
      if (!active) return
      const revision = snapshot.revision + 1
      snapshot = {
        state,
        revision,
        focusRequest: request?.focus === undefined
          ? null
          : {
              id: `${requestIdPrefix}focus-${revision}`,
              target: request.focus
            },
        announcementRequest: request?.announce === undefined
          ? null
          : {
              id: `${requestIdPrefix}announce-${revision}`,
              message: request.announce
            }
      }
      notify()
    },
    acknowledgeRequest: (requestId) => {
      if (
        snapshot.focusRequest?.id !== requestId &&
        snapshot.announcementRequest?.id !== requestId
      ) {
        return
      }
      snapshot = {
        ...snapshot,
        focusRequest: snapshot.focusRequest?.id === requestId
          ? null
          : snapshot.focusRequest,
        announcementRequest: snapshot.announcementRequest?.id === requestId
          ? null
          : snapshot.announcementRequest
      }
      notify()
    },
    start: (initialize) => {
      if (started || !active) return
      started = true
      initialize()
    },
    dispose: () => {
      active = false
      listeners.clear()
    }
  }
}
