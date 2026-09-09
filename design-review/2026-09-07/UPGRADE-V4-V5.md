# Installed version-4 to version-5 upgrade

The retained old build comes from implementation commit `8375c3e`, before q091
was revised, at `/tmp/nycustodian-upgrade-v4-8375c3e-dist`. Its published delivery
manifest SHA-256 is `8d1e7da6239ab4b3518eb5a1a9b769b90b0405a88d395d1bb0c67fba21107503`.
The version-5 delivery manifest SHA-256 tested here is
`03b5bfe29bcadc5ae2d1f287ccf348454e8b555b4411c7eb584facc34f34d4cf`.
These identify local test inputs, not deployed releases.

`apps/site/browser-tests/installed-pack-upgrade.pw.ts` runs an isolated same-origin
server and installs the real old pack. It saves q091's original illustrated answer
and an unfinished 90-item simulation containing q091. It switches the origin to
the current build, waits for the normal service-worker update, closes controlled
documents, installs/activates v5, and checks that the old pack is retained.

The origin then disconnects. The test checks exact old answer records, simulation
pack claim, version and pinned item array; restores the saved response; submits
the old simulation to evaluated results; opens original q091 feedback from Review;
and saves current q091's authored nonvisual version. The original attempt remains
unchanged while a separate v5 attempt records nonvisual presentation.

Reproduction (after building the current release and independently retaining v4):

```sh
NYCUSTODIAN_PREVIOUS_RELEASE_DIST=/tmp/nycustodian-upgrade-v4-8375c3e-dist \
NYCUSTODIAN_PREVIOUS_RELEASE_VERSION=4 \
NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 \
node node_modules/@playwright/test/cli.js test browser-tests/installed-pack-upgrade.pw.ts --workers=2
```

Run from `apps/site`. The fixture requires its own local server and real browser
processes. Without a previous build the test explicitly skips, which is not
upgrade evidence. The same test can exercise v3-to-current with the independently
built v3 input and `NYCUSTODIAN_PREVIOUS_RELEASE_VERSION=3`; that additional route
has not been re-run here. Historical v3-to-v4 evidence remains in its earlier
implementation commit and notes.


Final result: Chromium, Firefox, and WebKit all pass the strengthened test,
including offline completion of the old simulation. The initial strengthened
run reached evaluated results but used an incorrect heading expectation; the
matcher now uses the actual “Practice accuracy” heading, and all three browsers
were rerun successfully. This is local browser runtime evidence, not deployment
or real-device certification.
