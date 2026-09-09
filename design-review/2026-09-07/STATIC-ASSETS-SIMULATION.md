# Local Static Assets Simulation gate — September 9, 2026

Source: implementation commit `d9f17e53eacca9d0ae235bfa0e32f95b8f2b9bdb`.
Runtime: Wrangler 4.125.0, workerd 1.20260820.1, Node 22.22.0.
Configuration: `apps/site/scripts/wrangler-preview.jsonc`, compatibility date
2026-08-23, `run_worker_first: true`, ASSETS binding, auto trailing slash,
404-page handling. No deployment occurred.

Current release delivery manifest SHA-256:
`03b5bfe29bcadc5ae2d1f287ccf348454e8b555b4411c7eb584facc34f34d4cf`
(`apps/site/dist/content/vertical-slice/manifest.json`, pack v5).

From `apps/site`, start the local runtime:

```sh
WRANGLER_SEND_METRICS=false XDG_CONFIG_HOME=/tmp/nycustodian-wrangler-config node node_modules/wrangler/bin/wrangler.js dev --config scripts/wrangler-preview.jsonc --ip 127.0.0.1 --port 8787 --persist-to /tmp/nycustodian-wrangler-state --show-interactive-dev-session=false
```

Run the complete Simulation browser file:

```sh
NYCUSTODIAN_PLAYWRIGHT_PREVIEW=cloudflare NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787 node node_modules/@playwright/test/cli.js test browser-tests/simulation.pw.ts --workers=2
```

The full run passed 29 of 30 checks. All three Static Assets cases passed:
valid opaque simulation player/results and print-preview URLs returned the
appropriate shell; seven malformed paths returned the status 404; HEAD returned
no body; POST/PUT/PATCH/DELETE/OPTIONS did not receive the player shell.

The other cases exercised deterministic simulation creation, durable responses,
retirement/pinned sessions, retained hazard results, storage retry, timer behavior,
explicit auto-submit opt-in, effective length changes and nonvisual presentation.
One WebKit visual-hazard case reported a missing verified local scene image at
initial player restoration. No source or fixture change was made. Its isolated
rerun on the same runtime passed (3.6 seconds):

```sh
NYCUSTODIAN_PLAYWRIGHT_PREVIEW=cloudflare NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:8787 node node_modules/@playwright/test/cli.js test browser-tests/simulation.pw.ts --project=webkit --grep 'restores a visual hazard simulation' --workers=1
```

Thus every case passed across the full run and isolated rerun, but the initial
missing-image failure is retained as an observation, not assigned an unproven
cause. A clean all-at-once run is still useful in the final integrated gate.
This is exact local workerd evidence, not production deployment or CDN proof.
