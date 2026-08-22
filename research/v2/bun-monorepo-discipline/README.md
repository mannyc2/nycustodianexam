# R2.7 - Bun monorepo, workspaces, build, and CI discipline

This lane defines the recommended Bun-native workspace and build discipline for the future `apps/*` / `packages/*` repository. It is research evidence, not an application scaffold.

Immutable source: `agent/chat-corpus-reconciliation` at `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`.

Key result: use a private Bun workspace root, exact Bun pinning, isolated linking, one coordinated Effect v4 catalog, explicit `workspace:*` edges, a committed text `bun.lock`, frozen CI installs, explicit prerequisite ordering for build steps, Vite for browser builds, Cloudflare tooling only where needed, and no external task runner until a measured orchestration gap exists.

Numeric bundle budgets remain provisional because R2.5 did not complete current production measurements.
