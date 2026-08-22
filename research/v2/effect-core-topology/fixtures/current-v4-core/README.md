# Current-v4 core fixture

This private fixture is source evidence for the required R2.1 probes.

Pinned coordinates:

- Bun `1.4.0`
- `effect@4.0.0-rc.111`
- `@effect/platform-bun@4.0.0-rc.111`

It covers:

1. `Context.Service` with named `Effect.fn` methods and focused Layers;
2. `Schema.TaggedError` expected failures;
3. a scoped background Layer using `Effect.forkScoped`;
4. a BunRuntime process entry;
5. one browser `ManagedRuntime` imperative bridge;
6. Layer composition and test substitution.

Intended commands:

```text
bun install --frozen-lockfile
bun run build
bun test
bun run probe
```

## Execution status

BLOCKED. The runner had no Bun executable and no outbound DNS/TCP access. It could
not download Bun or registry packages, so it could not produce a genuine
`bun.lock`. The source is committed, but no compile, test, or runtime success is
claimed. See `../../raw-results/environment.txt` and
`../../raw-results/probe-attempts.txt`.

`BUN-LOCK-BLOCKED.md` records the omission. It is intentionally not named
`bun.lock`, because a prose or fabricated lockfile would be misleading.
