# Probe environment

- Date: 2026-08-22 UTC
- Repository base: `d94981c62e3834177f0db9bc387b2c601c40636b`
- Branch: `research/v2-effect-schema-compiler`
- Bun: `1.3.14` (`0d9b296a`)
- Effect: `4.0.0-rc.111`
- `@effect/vitest`: `4.0.0-rc.111`
- TypeScript: `5.9.2`
- Vitest: `4.1.10`
- Official Effect tag commit:
  `648f566dd259898e7697c7fcb796183ccbc474ab`
- Installed `node_modules/effect/AGENTS.md`: read completely (394 lines)
- Source mirror `.agent-sources/effect/.agents/AGENTS.md`: read completely

Commands:

```sh
bun install
bun run typecheck
bun run test
bun run probe
sha256sum ../../raw-results/current-v4-compiler/*.json
bun run probe
sha256sum ../../raw-results/current-v4-compiler/*.json
```

All commands passed after the install was granted network/host temporary-directory
access. The recurring `fnm_multishells` warning belongs to the shell environment
and did not affect command exit status.
