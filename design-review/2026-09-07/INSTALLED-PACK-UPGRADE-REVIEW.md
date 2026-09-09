# Installed pack upgrade verification

The previous runtime is built from immutable commit
`78de1372bf360de74c7c00875789cf0e892fc8d9`, the last version-3 implementation
before q091 was added. It is an actual archived application and downloaded pack,
not a current-page fixture with its version number replaced.

The source was extracted with `git archive` into
`/tmp/nycustodian-upgrade-v3-78de137`. Package dependencies were reused from the
installed locked cohort through local ignored overlays, with every workspace
package resolving to the archived workspace. The archive and current checkout
have identical `bun.lock` SHA-256:
`318bfabfa7b2f79b0a535d8a0b9bdb9cf65aca924fa9e999cd2cc41e4107a3a3`.
No source in the archive or original checkout was edited. Bun 1.4.0 / Node 22.22.0
built and verified the old runtime: 526 routes, 220 item artifacts, 291 images.
Its generated worker SHA-256 is
`9dabe8eef5f98848413446051e9aaa984366559af0bd38ff71f400c64290bdad`.

To reproduce, extract that commit into an isolated directory, install its exact
locked dependencies with Bun 1.4.0, and run its root build. Then build the current
implementation and set `NYCUSTODIAN_PREVIOUS_RELEASE_DIST` to the old build's
`apps/site/dist` when running `browser-tests/installed-pack-upgrade.pw.ts`.
The test is explicitly skipped when this external fixture has not been prepared;
ordinary browser-suite success must not be presented as an upgrade proof.

The dedicated HTTP fixture can switch the served release without changing the
origin, and maps dynamic simulation/print routes through the production shell
path resolver. The test installs and activates version 3, saves a flagged practice
answer, starts a real simulation and saves its first answer, switches the origin
to version 4, checks that the new worker is waiting, and closes the old controlled
document to allow normal browser activation. It then downloads/activates version
4 and checks that the version-3 pack is retained. Finally it shuts down the origin
and reopens the simulation and historical question explanation, verifying saved
responses and the exact original simulation pack claim.

Observed result: all three browsers pass (Chromium 36.6s, WebKit 33.4s,
Firefox approximately 1.3 minutes). Browser typecheck also passes. The current
worker used by this run has SHA-256
`3a27874d32a2e2c4c66a52508ebb7b44b54519dcfa0c5ce203e59ae176db7e88`.

This covers normal worker activation, current-pack staging/activation, retention
of a genuinely installed old pack, an unchanged saved practice attempt, and
resumption of an unfinished question simulation with its exact original claim.
It does not constitute physical-device certification or prove every historical
simulation format, submission/result transition, or interrupted upgrade state.
Existing isolated failure tests remain separate evidence for those mechanisms.
