# Installed package guidance status

Required artifact: `node_modules/effect/AGENTS.md`

Status: BLOCKED

The exact package could not be installed because the runner had no Bun executable
and no outbound shell network. Therefore the generated installed
`node_modules/effect/AGENTS.md` was not available.

Mitigation performed, without claiming equivalence:

- inspected `effect@4.0.0-rc.111` package metadata at the pinned upstream commit;
- inspected the official `LLMS.md`/`ai-docs` guidance source used by the package;
- inspected the v3-to-v4 migration guide;
- inspected exact source paths for the selected APIs.

This source inspection supports architecture research but does not satisfy the
installed-package or runtime-observation gate. A follow-up run must install the
fixture, read the installed `AGENTS.md` completely, and compare it against the
source guidance before accepting the fixture as compile/runtime evidence.
