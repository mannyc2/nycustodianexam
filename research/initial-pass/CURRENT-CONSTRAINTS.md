# Current constraints for the next architecture pass

**Status:** maintainer direction recorded 2026-08-21. These constraints supersede incompatible recommendations in the raw first-pass reports.

## Effect

- The project targets the **latest Effect v4 line**.
- Effect v3 is historical evidence only; do not recommend it for production implementation.
- Exact Effect v4 package versions must be rechecked and pinned when dependencies are actually selected.
- Future research must use current v4 source, documentation, package organization, services, Layers, Schema, runtime, reactivity, platform, HTTP, testing, and migration guidance directly.
- Do not “translate” v3 architecture mechanically by renaming APIs.
- Prefer Effect-native patterns where they improve correctness, composition, observability, resource safety, and testability.
- Do not force Effect around trivial pure calculations or DOM mutations solely for stylistic consistency.
- Do not treat Effect as a renderer.

## Bun and repository organization

- Use **Bun** as package manager and primary TypeScript tooling/runtime direction.
- Use **Bun workspaces**.
- The future repository shape uses top-level:

```text
apps/
packages/
```

- The root package should be private and own workspace configuration.
- Future research must use current Bun documentation and Bun-native capabilities where they fit.
- Do not emit pnpm/npm-specific lockfile, override, workspace, script, or CI recommendations as the project default.
- Do not design the final package split from the first-pass `src/domain/application/ports/adapters/ui` examples. Exact app/package boundaries remain a research outcome.
- The Bun constraint applies to the TypeScript application/build toolchain. It does not automatically replace a justified non-TypeScript specialist tool such as CadQuery/OCCT for deterministic geometry.

## Web and deployment

- No Next.js.
- Standards-first semantic HTML and modern CSS remain required.
- Static acquisition/reference pages must remain independently indexable and useful without a client-rendered SPA shell.
- Cloudflare remains the deployment direction.
- A UI framework is not assumed, but direct DOM is also not accepted permanently without an implementation/evidence gate.

## Research discipline

- Every new research lane must use `@GitHub` to create a branch, commit its exact outputs, push, and open a draft PR.
- Raw reports and generated evidence must be committed, not represented only by a completion summary.
- Research prompts must name allowed paths and immutable bases.
- The next prompt set should incorporate the intended `SKILL.md` guidance. The specific `SKILL.md` was not present in this archive or repository snapshot, so it must be attached or identified before those prompts are finalized.
