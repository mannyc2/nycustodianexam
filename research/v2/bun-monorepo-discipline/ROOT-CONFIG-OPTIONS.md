# Root configuration options

## Recommended root

Use a private root package with Bun workspaces expressed as an object so a root catalog can be declared next to workspace globs.

```json
{
  "name": "@nycustodian/root",
  "private": true,
  "packageManager": "bun@1.4.0",
  "workspaces": {
    "packages": ["apps/*", "packages/*"],
    "catalog": {
      "effect": "4.0.0-rc.111",
      "@effect/platform-browser": "4.0.0-rc.111",
      "@effect/platform-bun": "4.0.0-rc.111",
      "@effect/vitest": "4.0.0-rc.111"
    }
  },
  "devDependencies": {
    "effect": "catalog:"
  }
}
```

Use `workspace:*` for internal edges. Every runtime workspace that imports Effect or an Effect platform package declares it directly; the root `effect` dev dependency exists for installed guidance/source access only.

## Bun install policy

`bunfig.toml` should use isolated linking. Keep the text `bun.lock` committed. CI uses `bun ci` or the current frozen-lockfile equivalent. Do not rewrite the lockfile in CI.

A minimum release age can be considered for ordinary dependency upgrades, but it should not block deliberate exact-version security or compatibility updates. Treat it as supply-chain friction, not a correctness control.

Use `trustedDependencies` only for dependencies whose lifecycle scripts were reviewed and are actually required. Start empty/minimal. Do not use broad trust as a workaround for install failures.

Use `overrides`/`resolutions` only to close a demonstrated transitive mismatch or security/build issue. Remove them once upstream ranges resolve correctly.

## Rejected defaults

- hoisted linking as a convenience default;
- undeclared imports that happen to resolve from the root;
- semver ranges for the coordinated Effect RC cohort;
- multiple lockfiles for one repository;
- npm/yarn/pnpm workspace metadata alongside Bun;
- a task runner before Bun script/filter semantics prove insufficient.
