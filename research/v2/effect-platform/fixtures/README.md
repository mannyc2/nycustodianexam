# Fixture status

The shared research contract requires any code-level Effect probe fixture to be created with Bun, exact package versions, a committed `package.json`, and a genuine committed `bun.lock`, after reading the installed package's `node_modules/effect/AGENTS.md`.

This execution environment has no Bun executable and cannot install packages from external hosts. Creating a hand-written lockfile or claiming an installed-package probe would violate the evidence contract.

Therefore this lane intentionally contains **no executable fixture**. Required runtime probes are listed in `OPEN-QUESTIONS.csv` and `FINAL-RECEIPT.md` as **BLOCKED** implementation gates.

Minimum follow-up fixture once Bun is available:

1. pin the actual complete published Effect v4 cohort (do not assume source `rc.111` is installable because `@effect/platform-bun` was observed at npm `rc.110`);
2. record `bun --version` and platform;
3. install in a private fixture with exact versions and commit the generated `bun.lock`;
4. read installed `node_modules/effect/AGENTS.md` completely;
5. run type/runtime probes for browser IndexedDB, Bun layers, service-worker event adapters, Web `Request` handlers, and workerd compatibility;
6. preserve raw outputs before changing any project adoption decision.
