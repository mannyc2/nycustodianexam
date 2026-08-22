# Effect cohort policy

Keep all Effect v4 packages used by the repository on one exact coordinated version. For the R2.7 coordinate that means `4.0.0-rc.111`.

## Rules

1. Root catalog contains the exact Effect cohort.
2. Root also declares `effect` as a dev dependency so installed `node_modules/effect/AGENTS.md` and package source are available to agents.
3. Every consuming workspace declares its own direct runtime dependency with `catalog:`.
4. Internal workspace edges use `workspace:*`.
5. Isolated linking is the default so undeclared imports fail instead of being accidentally satisfied by hoisting.
6. Any use of `@effect/platform-browser`, `@effect/platform-bun`, `@effect/vitest`, Atom bindings, or another Effect ecosystem package must match the same exact RC counter unless upstream package metadata proves a deliberately different compatible coordinate.
7. Do not mix source-only coordinates with a different registry cohort by assumption.

## Diagnostics

At dependency-update time:

- inspect the generated `bun.lock` for all `effect` and `@effect/*` resolutions;
- run `bun pm ls --all` or the current equivalent and grep/parse the dependency tree for duplicate Effect versions;
- run workspace typecheck/build under isolated linking;
- retain an explicit negative fixture where one workspace imports an undeclared package and verify that install/runtime resolution rejects it;
- fail CI if more than one Effect core version or mismatched coordinated adapter versions are found.

A dependency catalog is a version-policy mechanism, not permission for phantom imports.
