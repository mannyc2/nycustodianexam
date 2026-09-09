# Local workerd gates — September 9, 2026

Both runtime scripts passed against the build at implementation commit
`378a1d2`. They start isolated local Wrangler/workerd fixtures and stop their
child processes afterward. Neither command deploys a Worker or activates intake.
Runtime: Node 22.22.0, Wrangler 4.125.0, workerd 1.20260820.1.

From `apps/site`:

```sh
PATH=/tmp/nyc-bun-1.4.0/bun-linux-x64:$PATH XDG_CONFIG_HOME=/tmp/nycustodian-wrangler-config node --experimental-strip-types scripts/terminal-edge-workerd-smoke.ts
```

Verified exact 410 withdrawal behavior, original URL preservation, no redirect,
no-store and restrictive CSP, no executable/canonical substitution, empty HEAD
body, injected service-failure 503 with Retry-After, no leaked exception detail,
and an unknown-path 404 at its original URL. The fixture configuration is checked
before startup. This is local runtime evidence, not a production withdrawal.

From `apps/correction-worker`:

```sh
PATH=/tmp/nyc-bun-1.4.0/bun-linux-x64:$PATH XDG_CONFIG_HOME=/tmp/nycustodian-wrangler-config node --experimental-strip-types scripts/workerd-smoke.ts
```

Verified exact disabled status with no-store, a malformed local submission
rejected with 503/disabled and Retry-After before parsing, and an unknown route
returning 404/no-store. This does not exercise or enable a live intake service.
The fixture accepts no report; no report was delivered to another person.

The distinct Simulation/print shell-routing gate remains documented in
`STATIC-ASSETS-SIMULATION.md`. Full browser-suite results are a separate record.
