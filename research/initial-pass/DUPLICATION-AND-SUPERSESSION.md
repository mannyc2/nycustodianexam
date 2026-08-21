# Duplication, conflicts, and supersession

## Duplicate/overlapping lanes

### E01 and E03 — UI rendering

**Relationship:** overlapping independent outputs.

**Keep from both:** state ownership, renderer boundary, lifecycle ownership, accessibility gates, direct-DOM spike, renderer migration triggers.

**Do not merge blindly:** each has different screen-state details and both use v3/unstable-reactivity assumptions.

**Rejected conflict:** reveal after an in-memory commit despite persistence failure. This conflicts with the maintained product contract and E04/E08 durable commit-before-reveal model.

**Not accepted:** standalone Lit/`lit-html` as a predetermined winner. It remains one candidate for the v4 redo.

### E04 and E08 — core architecture

**Relationship:** strongly overlapping architecture memos with complementary detail.

**Keep:** common capability boundaries, error categories, storage atomicity, pack staging/activation, bounded concurrency, edge-owned runtime, testing and failure injection.

**Discard as architecture:** v3 production pin and both proposed single-`src/` layered folder trees.

**Reason:** the current project requires latest Effect v4 and a Bun workspace monorepo using `apps/` and `packages/`. The package architecture must be derived from current Effect patterns, not adapted from a ports/adapters template.

## Explicit supersessions

| First-pass statement | Current disposition |
|---|---|
| “Use Effect 3.22.1 for production.” | Superseded by maintainer constraint: latest Effect v4. |
| Use matching v3 `@effect/platform` / browser package versions. | Superseded; redo current v4 package/API topology. |
| Keep v4 in a comparison branch until GA. | Superseded; v4 is the required target even when prerelease risk must be managed. |
| Use pnpm overrides/`pnpm why`. | Superseded by Bun/Bun workspaces; redo dependency-deduplication checks with Bun. |
| `src/domain/application/ports/adapters/ui` repository layout. | Rejected as final structure; next architecture uses `apps/` and `packages/` and must follow current Effect organization more closely. |
| Adopt `idb` now and revisit first-party v4 IndexedDB later. | No longer accepted; provider choice must be researched under the v4 requirement. |
| V3 Cloudflare platform limitations determine the server recommendation. | Superseded by E09; Cloudflare must be researched directly against v4. |
| v4 Atom/reactivity can be ignored until GA. | Superseded as a blanket rule; current v4 reactivity must be evaluated, while instability is still recorded honestly. |
| Reveal feedback after in-memory commit when durable save fails. | Rejected; persistent-mode reveal waits for durable transaction completion. |

## Provisional, not superseded

The following remain plausible but require v4/Bun validation:

- static pages should avoid eager Effect runtime imports;
- one interactive runtime/entry boundary rather than runtime-per-event;
- native service worker may remain smaller and more lifecycle-truthful than an Effect-based worker;
- selective Effect Platform use;
- direct DOM as the first measured renderer spike;
- Lit, Solid, or Preact as renderer candidates;
- one physical IndexedDB with multiple domain capabilities;
- optional atlas GLB and static scored views.
