# R2.7 fixtures

The lane was required to commit a private Bun workspace harness. A complete executable fixture could not be produced truthfully through the connected GitHub-only execution path because the final Bun install/runtime probe environment was unavailable.

The intended harness shape is documented by `ROOT-CONFIG-OPTIONS.md`, `TSCONFIG-TOPOLOGY.md`, `TEST-RUNNER-RESPONSIBILITIES.csv`, and `RECOMMENDED-INITIAL-GRAPH.md`.

Required rerun fixture:

- private root;
- `apps/site` and `apps/content-compiler`;
- `packages/content` and `packages/study`;
- exact `bun@1.4.0`;
- exact Effect v4 cohort;
- root catalog;
- `workspace:*` internal edges;
- isolated linker;
- generated text `bun.lock`;
- filter scripts;
- browser and Bun tsconfig variants;
- undeclared-dependency negative case;
- safe lifecycle trust fixture.

Do not hand-author `bun.lock` or fabricate runtime output merely to satisfy the fixture checklist.
