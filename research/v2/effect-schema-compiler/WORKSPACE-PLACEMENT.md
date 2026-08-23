# Workspace placement

## Recommendation

```text
apps/content-compiler
  finite Bun CLI/process root
  depends on packages/content
  owns file discovery, location parser, history reads, hashing, staging/promotion

packages/content
  current/historical Schemas
  registry and relational gates
  migrations
  canonical encoded types
  deterministic generators and diagnostic model
  no Bun, browser, DOM, workerd, or filesystem globals

apps/site
  consumes generated artifacts and only the minimal shared encoded decoders it needs
```

This is the smallest topology with a real reuse/runtime boundary. The compiler is
a Bun host; the site/browser must consume content artifacts. A script inside the
site would mix host capabilities and publication ownership. A package per schema,
gate, or generator would not reduce state.

## Dependency laws

- `apps/content-compiler -> packages/content`; never the reverse.
- `apps/site -> generated content` and optionally a narrow browser-safe export
  from `packages/content`; it does not import compiler I/O.
- platform implementations depend inward on model/capability contracts.
- Bun file APIs occur only under the compiler app.
- pure gates and generators do not become services.
- one finite Bun runtime root composes file/history/publisher Layers once.
- add a separate asset-production app/package only after actual asset pipelines
  establish a distinct runtime/ownership boundary.

## Evaluated alternatives

| Option | Decision | Why |
|---|---|---|
| `apps/content-compiler` plus `packages/content` | accept provisionally | real Bun runtime plus browser/build reuse boundary |
| only `apps/content-compiler` | acceptable first simplification | use if site imports no model code; extract only on second consumer |
| script under `apps/site` | reject | conflates site build with publication-critical compiler capabilities |
| one package per entity/gate | reject | package proliferation with no runtime or ownership boundary |
| generic `core/ports/adapters` graph | reject | labels do not encode project capability or reduce invalid dependencies |

R2.90 should reconcile this placement with the final workspace graph. If only the
compiler consumes the model in the first vertical slice, begin in the app and
extract `packages/content` when the site becomes the second consumer.
