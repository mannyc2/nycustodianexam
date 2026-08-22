import { Effect, FileSystem, Layer, Path } from "effect"
import { BunFileSystem, BunPath, BunRuntime } from "@effect/platform-bun"

const RuntimeServices = Layer.merge(BunFileSystem.layer, BunPath.layer)

const program = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const directory = yield* fs.makeTempDirectoryScoped({ prefix: "r23-" })
  const file = path.join(directory, "probe.txt")
  yield* fs.writeFileString(file, "bun-runtime-ok")
  const value = yield* fs.readFileString(file)
  yield* Effect.logInfo("Bun runtime probe", { file, value })
  return { file, value }
}).pipe(
  Effect.scoped,
  Effect.provide(RuntimeServices)
)

// Intended Bun entry. Not executed in this lane.
BunRuntime.runMain(program)
