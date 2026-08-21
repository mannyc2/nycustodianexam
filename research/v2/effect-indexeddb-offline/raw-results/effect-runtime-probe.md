# Effect/Bun runtime fixture gate

Status: BLOCKED

- Required/current Bun coordinate was independently pinned to `bun-v1.4.0`,
  tag commit `34cbb9a40b4bd1bd767d134a7065e66c2432a676`.
- The executor has no `bun` binary on PATH.
- Package installation/download was unavailable in the executor.
- Therefore no `node_modules/effect` was installed and the contract-required
  installed `node_modules/effect/AGENTS.md` could not be read.
- In compliance with the shared research contract, no Effect code-level fixture
  was written or claimed as executed, and no `bun.lock` was fabricated.

Source-level provider inspection used exact GitHub commit
`436f10d1efccec308426532ff3f88df9a96434f3`.
