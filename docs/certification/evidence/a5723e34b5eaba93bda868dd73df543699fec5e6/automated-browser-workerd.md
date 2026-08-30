# Automated browser and workerd evidence

Candidate: `a5723e34b5eaba93bda868dd73df543699fec5e6`

Recorded: `2026-08-30T14:12:00Z`

The candidate was checked with a clean worktree. Local verification used Node
22.22.0 and Bun 1.3.14 with the repository's documented unsupported-Bun
override. The pull-request Frozen Bun job remains authoritative for the pinned
Bun 1.4.0 toolchain.

## Results

- Repository verification passed through layout, module boundaries, blocked
  certification-record validation, 396 visual artifact hashes, content build,
  five-workspace type checking, browser-test type checking, 393 unit tests,
  site build, and artifact invariants. The final UI/UX validator was run
  separately outside the filesystem sandbox because it reads pinned Git blobs;
  it passed 61 mutation checks and truthfully retained the status
  `NOT HUMAN-USABILITY-TESTED`.
- `bun run test:browser` passed 178 tests across Chromium, Firefox, and WebKit.
  The 26 skipped cases are explicit platform-specific cases in the maintained
  matrix, including Chromium-only BFCache and browser-specific offline APIs.
- `NYCUSTODIAN_PLAYWRIGHT_PREVIEW=cloudflare bun run
  test:browser:chromium --grep @cloudflare` passed all 4 local Cloudflare Static
  Assets checks.
- `bun run --filter @nycustodian/site test:terminal-workerd` passed the fixture
  410, injected 503, HEAD, CSP, and original-URL 404 contracts.
- `bun run correction-worker:test:workerd` passed the dormant correction
  Worker's disabled status, 503 submission, and closed-route contracts.

## Certification boundary

This evidence covers deterministic automation only. It does not claim NVDA,
VoiceOver, TalkBack, JAWS, true 400% browser zoom, physical US Letter/A4 output,
grayscale print review, inactive remote-preview review, or production
deployment. Those checks remain explicitly blocked in the certification
record.
