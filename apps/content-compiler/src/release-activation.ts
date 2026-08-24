import { access, rename, rm } from "node:fs/promises"
import { Effect, Predicate } from "effect"
import { ContentBuildError } from "./content-build-error.ts"

export interface ReleaseActivationPaths {
  readonly active: URL
  readonly staging: URL
  readonly backup: URL
}

const isNotFoundError = (cause: unknown): boolean =>
  Predicate.hasProperty(cause, "code") &&
  cause.code === "ENOENT"

const exists = async (path: URL): Promise<boolean> => {
  try {
    await access(path)
    return true
  } catch (cause) {
    if (isNotFoundError(cause)) return false
    throw cause
  }
}

const activate = async ({
  active,
  staging,
  backup
}: ReleaseActivationPaths): Promise<unknown | undefined> => {
  const activeExists = await exists(active)
  const backupExists = await exists(backup)
  let previousReleaseMoved = backupExists && !activeExists

  if (activeExists) {
    if (backupExists) {
      await rm(backup, { recursive: true, force: true })
    }
    await rename(active, backup)
    previousReleaseMoved = true
  }

  try {
    await rename(staging, active)
  } catch (activationCause) {
    if (previousReleaseMoved) {
      try {
        await rename(backup, active)
      } catch (rollbackCause) {
        throw new ContentBuildError({
          detail: "Unable to activate compiled release or restore the previous release",
          cause: new AggregateError([activationCause, rollbackCause])
        })
      }
    }

    throw new ContentBuildError({
      detail: "Unable to activate compiled release",
      cause: activationCause
    })
  }

  try {
    await rm(backup, { recursive: true, force: true })
    return undefined
  } catch (cause) {
    return cause
  }
}

export const activateRelease = Effect.fn("ContentCompiler.activateRelease")(
  function*(paths: ReleaseActivationPaths) {
    const cleanupCause = yield* Effect.tryPromise({
      try: () => activate(paths),
      catch: (cause) => cause instanceof ContentBuildError
        ? cause
        : new ContentBuildError({
          detail: "Unable to finalize compiled release activation",
          cause
        })
    })

    if (cleanupCause !== undefined) {
      yield* Effect.logWarning(
        "Compiled release activated, but the previous-release backup could not be removed",
        cleanupCause
      )
    }
  }
)
