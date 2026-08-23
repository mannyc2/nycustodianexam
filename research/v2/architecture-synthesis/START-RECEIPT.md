# R2.90 architecture synthesis start receipt

- Repository: `mannyc2/nycustodianexam`
- Canonical base branch: `main`
- Immutable base SHA: `d94981c62e3834177f0db9bc387b2c601c40636b`
- Output branch: `research/v2-architecture-synthesis`
- Started: `2026-08-23T00:02:16Z`
- Allowed path: `research/v2/architecture-synthesis/**`
- GitHub branch creation: confirmed through the connected GitHub capability
- Available required lanes: R2.1, R2.2, R2.3, R2.4, R2.5, R2.7, R2.8, R2.9, and R2.10 are present on canonical main; recovered R2.6 is published separately at commit `3ac1626` in draft PR #22
- Missing/incomplete evidence: R2.5 has no current production bundle measurements; R2.10 cannot rebuild the four tool POCs because source artifacts are absent; several browser/package probes remain blocked in their source lanes
- Current observed implementation-lock candidate: Effect `4.0.0-rc.111` at official tag commit `648f566dd259898e7697c7fcb796183ccbc474ab`; local Bun `1.3.14`
- Scope: reconcile lane evidence into the first implementation-ready proposal and vertical-slice sequence; no application scaffold and no maintained-authority edit
- Maintainer-direction conflict to record: current conversation directs Codex-native image generation for needed visuals, including matching the released test-image style; maintained visual research still excludes generative output from controlling scored production. R2.90 will isolate this as a policy/reconciliation decision rather than silently choosing one authority.
