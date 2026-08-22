# Raw results

## Observed evidence

- `browser-runtime-probe.json`: final real Chromium payload.
- `browser-runtime-probe.stdout.txt` / `.stderr.txt`: browser harness process output.
- `browser-server-events.jsonl`: server-side request/disconnect observations.
- `browser-server-stdout.txt` / `browser-server-stderr.txt`: local HTTP server output.
- `workerd-compatible-build-probe.txt`: TypeScript build and Node Web-handler-shape execution.
- `PROBE-SUMMARY.csv`: evidence status and truth boundary for every required probe.
- `ENVIRONMENT.txt`: exact local runtime/tool coordinate.

## Blocker evidence

- `EXECUTION-BLOCKERS.txt`: absence of Bun/workerd/package installation and its consequences.
- `COMMANDS.txt`: commands used or intended.
- `browser-initial-policy-block.stderr.txt` and `browser-initial-port-collision.stderr.txt`: preserved harness failures before the successful run.

## Critical interpretation rule

A result is `OBSERVED` only for the runtime named in its raw file.

- Chromium results are not Effect package results.
- Node Web-handler results are not workerd results.
- source inspection is not runtime execution.
- a TypeScript build is not Cloudflare compatibility certification.
