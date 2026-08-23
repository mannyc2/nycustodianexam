# R2.90 reconciled final receipt

## Publication identity

- Repository: `mannyc2/nycustodianexam`
- Lane: R2.90 — architecture synthesis
- Original synthesis base: `d94981c62e3834177f0db9bc387b2c601c40636b`
- Reconciliation input base: `7be45c787f2eeebd23710f44ab454831f9fe4ffa`
- Output branch: `research/v2-architecture-synthesis`
- Pull request: https://github.com/mannyc2/nycustodianexam/pull/23
- Original start receipt: `807aa16b692886ea0f59f4127b16d7f2ac3d04a0`
- Main reconciliation merge on this branch: `34f70cc`
- Final synthesis commit: resolve from the PR/head because the receipt cannot
  contain its own commit SHA.

## Inputs synthesized

- merged R2.1–R2.10 research;
- merged R2.6 recovery PR #22 at head `3ac1626`;
- merged R2.10 evidence recovery PR #24 at head `d2f8aab`;
- merged Codex-native visual-authoring PR #25 at head `a89edd8`;
- maintained architecture/product/security/content authority;
- official Effect `effect@4.0.0-rc.111` tag evidence; and
- official Bun 1.4 release evidence.

## Principal result

R2.90 selects:

- three initial workspaces: `apps/site`, `apps/content-compiler`, and
  `packages/content`;
- synchronized Effect v4 and Bun locks behind a clean scaffold gate;
- focused services and host-specific runtime roots;
- the merged R2.6 Schema/registry/gate/canonical/manifest-last compiler;
- strict commit-before-reveal persistence and generation-flip offline packs;
- semantic static HTML with a lazy direct-DOM player;
- Vite plus Cloudflare Static Assets; and
- separate Bun, Effect, real-browser, accessibility, artifact/leak, print, and
  closure-measurement responsibilities.

## Resolved lane questions

- R2.6 is complete enough to implement the compiler architecture; remaining
  parser/canonical-profile work is implementation.
- R2.9 was completed research. Its semantic contracts remain, while its
  deterministic-first authoring route is superseded.
- R2.10 is no longer evidence-blocked. The exact bundle and two fresh exact
  79/79 rebuild comparisons are committed.
- The four POCs have final dispositions and are retired production-art
  candidates, not production backlog.
- Codex-native image generation is maintained authority. Publicly released
  sample artwork may guide high-level style; accepted reviewed raster bytes
  control compiler/build identity.

All Tier A/B concepts remain launch scope.

## Verification

- synthesis CSV files parse with uniform row widths;
- the R2.6 and R2.10 lane manifests verify on merged main;
- the reconciled R2.9 manifest verifies on merged main;
- synthesis local links resolve;
- `git diff --check` passes; and
- this branch changes only `research/v2/architecture-synthesis/**` relative to
  the reconciled main base.

## Remaining gates

The application is not scaffolded and no production content image is approved by
this synthesis. Remaining gates are implementation/runtime measurements or
per-content production work:

- Bun/Effect workspace execution;
- JSONC location and canonical JSON decisions;
- real-browser IndexedDB/offline/provider tests;
- production bundle and compression measurements;
- manual assistive-technology matrix;
- Codex native dimensions and one-vs-batch pilot; and
- the complete source/claim/question/image/scene corpus with exact review closure.

There is no remaining visual-authority reconciliation or POC-evidence blocker.
