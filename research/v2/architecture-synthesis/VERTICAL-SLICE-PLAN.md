# First implementation vertical slice

## Outcome

Ship one source-backed question through the real publication/build/browser/offline
path on a Cloudflare preview, with durable commit-before-reveal proved in a real
browser. This is an architecture proof, not a reduction of the Tier A/B launch
content universe.

## Slice path

```text
source citation + exact line + supported claim
  -> one question with every-option rationale
  -> optional reviewed visual + nonvisual equivalent
  -> current Effect v4 Schema decode/migration
  -> registry/provenance/review/leak gates
  -> deterministic pre/post page inputs + content pack
  -> semantic static HTML
  -> lazy direct-DOM player bootstrap
  -> renderer-neutral command/snapshot
  -> Effect commitSelection use case
  -> private IndexedDB provider strict transaction
  -> typed failure with no reveal OR successful settlement/reconciliation
  -> postcommit reveal + focus/live region
  -> reload/offline restoration from pinned pack/session
  -> build/browser/accessibility/leak/bundle tests
  -> Cloudflare Static Assets preview
```

## Workspace deliverables

### Root

- Bun 1.4.0 exact pin, workspaces/catalog/isolated linker, real `bun.lock`.
- runtime-specific tsconfigs and explicit scripts.
- cohort/phantom-dependency/generated-cleanliness checks.

### `packages/content`

- minimal source/line/claim/concept/question/option/image/review/pack schemas;
- exact one-key local invariant;
- duplicate-preserving registry;
- provenance, reference, scope, review, accessibility, leak, and pack gates;
- safe deterministic diagnostics;
- precommit/postcommit page input and pack manifest Schemas;
- canonicalization vectors and repeat-build root.

### `apps/content-compiler`

- location-aware JSONC read for the fixture;
- finite Bun root with focused capabilities;
- stage/validate/address/promote-manifest-last output;
- invalid fixtures proving multiple independent errors and no release.

### `apps/site`

- one indexable static reference page and one question-player route;
- player route initially contains semantic prompt/form fallback but no answer;
- lazy module, direct-DOM renderer, one `ManagedRuntime`;
- renderer-neutral state machine and `commitSelection`;
- private provider-backed `StudyPersistence`;
- native service worker, offline fallback, one explicit downloadable pack;
- print question/key separation for the fixture.

## Acceptance criteria

### Versions/install

- Bun 1.4.0 installs from committed lock under isolated linking.
- One synchronized current Effect v4 cohort; no undeclared imports.
- Installed Effect guidance/source read and exact coordinate recorded.

### Compiler/content

- valid fixture emits identical canonical bytes/root across two clean builds;
- structural and relational invalid fixtures report all expected stable codes in
  identical order and emit no release manifest;
- every rationale/explanation claim closes to exact retained source lines;
- generated output re-decodes under its output Schema;
- precommit artifact graph contains no answer-bearing fields or metadata;
- manifest closure, counts, sizes, and checksums recompute exactly.

### Player/persistence

- selection does not create an attempt;
- commit creates one stable attempt ID and opens one strict transaction;
- injected failure/abort/quota leaves selection editable, shows typed recovery,
  focuses/announces the error, and reveals nothing;
- retry with same semantic selection keeps the ID;
- changed selection invalidates the old draft ID;
- uncertain completion reconciles by ID;
- success reveals only after native transaction complete and updates event,
  projection, and session checkpoint atomically;
- reload restores answered/unanswered state from durable records.

### Offline/cross-tab

- explicit pack download stages/verifies/activates and reports bytes/state;
- offline reload works after activation;
- missing/invalid object quarantines rather than partially activates;
- new pack activation does not change an active session's pinned version;
- two tabs racing one ID converge by database truth; BroadcastChannel only
  invalidates views.

### Accessibility/security/print

- native controls and complete keyboard path;
- no answer in DOM/accessibility tree/assets/source maps before commit;
- failure and success focus occur after render on live nodes;
- live-region text is useful and nonduplicative;
- neutral/full descriptions split correctly; nonvisual equivalent is operable;
- 400% reflow, forced colors, reduced motion, touch targets, and grayscale print
  pass representative checks;
- question sheet and key are separate and version-labeled.

### Delivery/performance

- static reference route closure has zero Effect modules/preload edges;
- player, service worker, and pack manager closures are separately measured raw,
  gzip-9, and Brotli-11 from production files;
- two clean builds compare deterministic artifacts;
- Cloudflare preview serves semantic HTML, lazy player, pack, and offline fallback.

## Stop conditions

- Stop version lock if current Effect cohort does not resolve synchronously or Bun
  1.4.0 workspace/lock gates fail.
- Swap the IndexedDB provider if the first-party implementation fails any real-
  browser transaction/migration/lifecycle/bundle requirement; do not weaken the
  public transaction.
- Stop direct-DOM growth and run the matched lit-html spike when migration triggers
  appear.
- Fail the slice if any static route closes over Effect or any precommit artifact
  leaks answer-bearing material.
- Fail publication on nondeterministic content roots, incomplete source/rationale,
  stale review, inaccessible visual, or pack closure error.
- Do not call browser behavior complete from fake storage or one screenshot.
- Do not add a Worker, Atom/reactivity, framework, manual vendor chunk, or task
  runner to rescue an unrelated failure.

## Visual sub-pilot

If the slice is visual, use the maintainer-directed Codex pilot only after the
separate authority reconciliation. Record native generation dimensions and test:

- single-image versus contact-sheet consistency;
- simple public-sample line/test-diagram style match without copying composition;
- mechanically obscure tool features at phone/print size;
- neutral/full description and nonvisual equivalent;
- exact-basis content/mechanical, rights, accessibility, and leak review.

Commit the accepted final bytes. Regeneration equivalence is not required for
build determinism; any later pixel change creates a new reviewed asset basis.
