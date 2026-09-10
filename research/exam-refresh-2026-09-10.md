# Nassau exam status refresh — 2026-09-10

Status: complete bounded public-source refresh; administration remains unconfirmed. Site update prepared and validated.

Scope: official public updates for Custodian OC 60112026 and promotion 61012026: administration, results/eligible lists, amendments, and next-cycle announcements. No secure examination content or candidate recollections.

Immutable source: `mannyc2/nycustodianexam@2c95d4e4dc3bbe805511c8e57e359a0c1efbfb9f` (`ui/fixes-cleanup`), verified through connected GitHub. Output branch: `research/exam-refresh-2026-09-10` (absence verified before creation).

Consumers: `docs/FACTBASE.md`, `docs/OPEN.md`, and `content/authoring/packs/launch-v1.curated.mjs` / generated pack; site exam status and Nassau profile. Decision owner: site maintainer.

Initial observation: both official Nassau NEOGOV bulletins remain accessible and still list August 22, 2026. An announcement alone does not confirm administration. Existing site evidence dates to August 25, 2026.

Sources opened September 10, 2026:
- https://www.governmentjobs.com/careers/nassaucountyny/jobs/newprint/5338780
- https://www.governmentjobs.com/careers/nassaucountyny/jobs/newprint/5339570

## Findings and limits

- Both bulletins still announce August 22, 2026. Filing terms are unchanged: OC closed July 1; the promotion July 5 extension remains Jericho Public Library only.
- The live eligible-list HTML contains 993 option labels across the page. Neither `60112026` nor `61012026` occurs anywhere in the fetched HTML. The Custodian options contain OC `40272024` and 17 jurisdiction-specific promotion `41282024` entries. No candidate names or scores were downloaded.
- This establishes only what was present in the public index at retrieval. It does not establish cancellation, non-administration, or whether individual results have been issued. Higher-level custodian lists are separate and do not confirm the entry-level exams.
- The older promotion option labels display `02/04/2024`, conflicting with the maintained February 4, 2025 establishment evidence and preceding the September 2024 announced examination. Treat these labels as an unresolved index inconsistency; do not silently revise the historical factbase from them. The linked PDFs were not examined in this bounded pass.
- No next-cycle Custodian announcement or official post-administration confirmation was located. Search queries included the exact exam numbers with results/list terms, Nassau Custodian August 22 postponement, and county-domain Custodian 2026/2027 queries. Nonofficial search hits were not used as evidence.
- The commission homepage links both announcement types, the eligible-list index, applicant account access, and Job Interest Cards. It identifies exam and placement contacts and describes email/postal canvassing. These support practical follow-up links, not a release-date prediction.
- The list page's 48–72-hour statement concerns posting after list establishment, not the interval from exam to results. No processing-time estimate is added to the site.
- Web extraction concealed the list dropdown options, so the public HTML was fetched directly and parsed with Python's standard `HTMLParser`. The FAQ and commission-meeting index were reachable by direct fetch after web-reader cache misses. The meeting index shows August 20 and future September 18/October 22 entries; meeting notices or future meeting dates alone do not establish administration. Individual meeting records and candidate accounts were not inspected.
- NEOGOV's dynamic announcement/class-spec pages were reachable, but extracted “0 jobs” text is not a complete listing check. The negative next-cycle finding remains bounded; do not label it “no exam scheduled.”

## Source ledger

Observed September 10, 2026. Official-primary public HTML, except the repository-authored synthesis above. These are SHA-256 hashes of retrieved response bytes, not promises that dynamic pages will reproduce byte-for-byte later. Raw pages remain transient; the live list page is the reproducible entry point.

| Source | Bytes | SHA-256 |
|---|---:|---|
| [oc](https://www.governmentjobs.com/careers/nassaucountyny/jobs/newprint/5338780) | 66786 | `371605ab7a23a433cf34416dfb69b2bced33d186de5bdf2ec7cc82a80f6e985a` |
| [promo](https://www.governmentjobs.com/careers/nassaucountyny/jobs/newprint/5339570) | 65739 | `d5406a548967f36019fd15ef3a485eb523ac7faa403b6d919b6dc4afc43934fb` |
| [home](https://www.nassaucivilservice.com/NCCSWeb/homepage.nsf/HomePage?ReadForm) | 16128 | `8f3965d6b0daa78c2eaa0a47e7e6bd3731c396c89be1abbd95a41334cb942ba5` |
| [faq](https://www.nassaucivilservice.com/NCCSWeb/homepage.nsf/WebFAQPublic?OpenView&count=100) | 16845 | `00052a230a2d0f2cfdbbbc238e2af7a0b7ae483e4f7daee3c36bc4117f70bb99` |
| [meetings](https://www.nassaucivilservice.com/NCCSWeb/homepage.nsf/Commission%2BMeeting?OpenView&count=100) | 37622 | `b50cf266a5708df6e4e13dd789c94aa9a8ed562144e894603687a33996ceb8dd` |
| [eligible lists](https://www.nassaucivilservice.com/NCCSWeb/homepage.nsf/WebSiteContent/Eligible%2BLists%2BBy%2BTitle?OpenDocument) | 199160 | `d4dff934e2f6f0be5f908fb3b5c807625c108bac23fa98dfc3b69b8e15ccce19` |

Additional web-reader checks: [OC announcements](https://www.governmentjobs.com/careers/nassaucountyny), [promotion announcements](https://www.governmentjobs.com/careers/nassaucountyny/promotionaljobs), [Job Interest Cards](https://www.governmentjobs.com/careers/nassaucountyny/classspecs), and [county exam information](https://www.nassaucountyny.gov/4346/Civil-Service-Exams). No raw-byte hash claimed for web-reader-only responses.

## Accepted consumer changes

Administration status and its exact source receipt now carry September 10; unrechecked facts retain August 25. The fact sheet and Nassau profile advance to version 3, pack to version 6; practice item versions and compatibility remain unchanged. The timeline is rebound to the reviewed fact digest. `/exams/` now links official list lookup, future OC notifications, promotion announcements, and commission contact information. No administration, results-release, or next-cycle date is invented.

Validation: deterministic authored-pack check; content compilation; 25 pack compiler tests; 20 static-page/timeline tests; complete site build; artifact integrity/answer-boundary verification. Site build and artifact check used Bun 1.4.0 / Node 22.22.0. Initial content compilation used locally available Bun 1.3.14; the final content compilation is repeated with the required Bun 1.4.0. No deployment or candidate-account access performed. Source branch rechecked through connected GitHub without drift.
