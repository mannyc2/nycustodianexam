# R2.2 question-player fixture

This fixture exercises one renderer-neutral state/command model through three view arms:

- direct semantic DOM updates;
- `lit-html@3.3.3`, the actual small declarative candidate, with keyed option rendering;
- a standards-only native-template whole-region replacement arm used as a negative control.

The native-template arm is not a proposed project renderer and must not grow into a custom framework. It intentionally demonstrates the focus and node-replacement hazards that appear when direct DOM code starts recreating renderer behavior.

## Available probes in this runner

```sh
node --test tests/model.test.mjs
python tests/browser_inline_probe.py
node scripts/measure.mjs
bash scripts/run-available-probes.sh
```

The policy-safe browser probe executes the real renderer-neutral model, controller, direct-DOM view, and native-template view in Chromium. Because the managed Chromium policy blocks every navigable URL and an `about:blank` document has an opaque origin, it uses an asynchronous IndexedDB-shaped in-page test double. This proves state, retry, focus, live-region, and disposal behavior, but it is not native IndexedDB proof.

## Full Bun/Vite rerun

After dependency access is available:

```sh
bun install
bun run test:model
bun run build
bun run measure:vite
bun run test:browser:native
```

`vite.config.mjs` builds matched direct, negative-control, and lit-html entries. `scripts/measure-vite.mjs` measures each production manifest closure. A `bun.lock` is intentionally absent because Bun and package-network access were unavailable; fabricating one would misrepresent installed-package evidence.

## Security boundary

The native HTTP browser harness serves only `public/`. Its test-only grading endpoint keeps the answer key and explanation out of initial HTML and browser static assets. This is not a backend recommendation; it isolates commit-before-reveal and leakage assertions. Offline answer-key delivery remains a separate content-pack/security decision.

## Effect Schema boundary

`effect-schema-boundary.ts` records the intended v4 `Schema.decodeUnknownEffect` boundary. It was not executed because `effect@4.0.0-rc.111` could not be installed. The zero-dependency browser fixture uses a deliberately small decoder only so the remaining state, persistence protocol, focus, lifecycle, and rendering behavior can be observed.
