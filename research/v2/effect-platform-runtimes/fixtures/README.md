# Fixtures

This directory contains the exact private research fixtures used or prepared for R2.3.

- `runtime-matrix/browser/` is a dependency-free browser and Service Worker probe executed in Chromium 144.0.7559.96.
- `runtime-matrix/workerd/` is a Cloudflare-compatible module-handler type/build fixture executed under Node only; it is not workerd runtime proof.
- `runtime-matrix/probes/` contains the exact Effect/Bun probes that remain blocked because the selected package cohort and Bun executable could not be installed.
- `DOWNLOAD-LINKS.md` and `UPSTREAM-COORDINATES.md` preserve exact candidate coordinates.

No fixture is application implementation or a production dependency lock. Evidence status is recorded in `../raw-results/PROBE-SUMMARY.csv`.
