import { Atom, AtomRegistry } from "effect/unstable/reactivity"
import { Effect } from "effect"

const counter = Atom.make(0)

const program = Effect.gen(function*() {
  const registry = yield* AtomRegistry.AtomRegistry
  registry.set(counter, 41)
  return registry.get(counter) + 1
})

Effect.runPromise(program.pipe(Effect.provide(AtomRegistry.layer))).then((value) => {
  document.body.dataset.p07 = String(value)
})
