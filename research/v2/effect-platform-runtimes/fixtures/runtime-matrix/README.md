# Runtime-matrix probe fixture

This is a private Bun fixture for executable R2.3 evidence. It selects one coherent published Effect cohort at `4.0.0-rc.110` rather than mixing the latest source `effect@4.0.0-rc.111` with the registry-lagging `@effect/platform-bun@4.0.0-rc.110`.

The lane separately audits upstream source at commit `993f4be99949d4682f79c22b9cb8dc2fda37ec7c` (`4.0.0-rc.111`). The only change after the preliminary coordinate `436f10d1efccec308426532ff3f88df9a96434f3` was an unrelated Pool benchmark.

## Evidence status

- `browser/` and `run_browser_probe.py`: **OBSERVED** in Chromium 144.0.7559.96.
- `workerd/`: TypeScript build and Web `Request`/`Response` execution **OBSERVED** under Node 22; explicitly not workerd runtime proof.
- `probes/*.ts`: exact Effect/Bun probe sources, **NOT EXECUTED** because the environment had no Bun executable, no package install path, and no cached Effect cohort.
- `bun.lock`: intentionally absent. A lockfile was not fabricated.

See `raw-results/PROBE-SUMMARY.csv` and `raw-results/EXECUTION-BLOCKERS.txt` for the evidence boundary.
