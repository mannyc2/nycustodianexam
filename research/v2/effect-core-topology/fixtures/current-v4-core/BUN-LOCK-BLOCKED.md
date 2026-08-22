# bun.lock status: BLOCKED

A truthful text `bun.lock` was not produced.

Reason:

- `bun` was not installed in the execution environment;
- the shell had no outbound DNS/TCP connectivity;
- the exact Bun and npm artifacts could not be acquired;
- no external workflow was authorized by the lane.

Resolution probe:

1. run this fixture in a network-enabled Linux x64 environment with Bun `1.4.0`;
2. run `bun install`;
3. verify the resolved direct packages are exactly
   `effect@4.0.0-rc.111` and `@effect/platform-bun@4.0.0-rc.111`;
4. read `node_modules/effect/AGENTS.md` completely;
5. commit the generated text `bun.lock`;
6. run the build, test, and runtime commands and preserve raw output.

No synthetic lockfile is included.
