# Independent Codex audit: supplied lane

```yaml
programVersion: CODEX-ONLY-UIUX-V1
taskId: /root/free_recruitment
actorClass: codex-agent
independent: true
evidenceMode: codex-only
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
statusLabel: NOT HUMAN-USABILITY-TESTED
reviewStatus: complete
```

This is the structured audit supplied by the owner on 2026-08-28. It is Codex
inspection evidence, not a participant session, proxy participant, persona,
human sign-off, accessibility conformance audit, or measurement of behavior.
No hidden reasoning is retained. Priority values are the supplied `P1`/`P2`
classifications; this lane supplied no numeric rubric scores, so none are
invented here.

## Evidence coordinates

| Artifact | Immutable coordinate or derivation | SHA-256 |
|---|---|---|
| Current page generator | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/scripts/generate-pages.tsx` | `239f102cc0cbc46053c4f4e5fd40e16e98e45c0cdff1d269771e28061dc569ba` |
| Current shared styles | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/styles.css` | `ec572566a43c02b356b67a56ff88126d50901ea18f76441ffb9f278cd39273a8` |
| Current failure-detail adapter | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/local-failure-detail.ts` | `dd52b5f14999e3af4cf887683e9b6282dc6805ca4d30eb5689cd1061c4a5e2a4` |
| Current correction form | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/corrections/react/correction-form.tsx` | `a87454dc412aad5ec67af4fab3cf96a58a1391c441a58bb1e6e1617707fe9fcf` |
| Current question feedback | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/question-player/react/feedback.tsx` | `b53b202e089f2a3885b9c18ab33d51d55adb085c461f4afe8c43fbb528c55725` |
| Current hazard results | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/hazard-player/react/results.tsx` | `1dadd860da45852262d82cd5b35ad73c3da3688436779da8c69d89e7a926e284` |
| Generated Practice document | deterministic working-tree output from the preceding base with the locked toolchain, `apps/site/practice/index.html` | `bd494dbf6a173facc79d21337fb48885ec7a7337723a2a4baa5f46896c3d8f86` |
| Generated Home document | deterministic working-tree output from the preceding base with the locked toolchain, `apps/site/index.html` | `f2fbcd16c88f52de788b9f34331d5e87eb44067ce101b7396c967f62d7a710fb` |
| Recovered CL-1 manifest | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/recovery-manifest.json` | `a4c9f7ae8b077c7449c7ebf55a004a27559327526f0b02f8343fe59675b56bc2` |
| Plan 004 audit | `fecc71c5ea240385b3d98f896b1152022a2bbbe8:research/ui-ux/consumer-language-study-2026-08-26.md` | `790679c137c798d45492ffbef98ac079934abb794b5c4add923781fc10913431` |
| Plan 005 inventory | `9daddbfde073f1f73d806a68dac427b69efc8359:research/ui-ux/navigation-task-hierarchy/route-task-inventory.json` | `db5536f5d376f7450e8b63590532db2ee8eea3c86ad972ab1aa353059cd587ff` |

## Findings

| ID | Priority | Exact evidence | Finding | Required response |
|---|---|---|---|---|
| `UI-01` | P1 | `generate-pages.tsx:886-901`; generated `practice/index.html:42-45` | Practice silently selects the first jurisdiction profile, currently Nassau, as its capacity context. | Require an explicit selected profile or a visibly neutral profile context; never silently imply Nassau applies. |
| `UI-02` | P1 | `generate-pages.tsx:1138-1151`; generated `practice/index.html:42-45` | Practice leads with only 45/60/90 starts, 21 diagnostic rows, 60 disabled `Unavailable` controls, and raw confusion-set keys. | Make the shortest available start primary; translate and move capacity diagnostics behind disclosure; make no unmeasured timing claim. |
| `UI-03` | P1 | `generate-pages.tsx:152-169`; `styles.css:357-370` | Seven peer header links only wrap and `aria-current` is incomplete for utility destinations. | Separate learner tasks from utilities and use a native compact disclosure. |
| `UI-04` | P1 | generated player shells from `generate-pages.tsx:468-559` | Players retain acquisition navigation and expose Previous/Next without a focused session frame. | Add a session landmark, progress, and an explicit Exit or Save-and-exit action; remove competing acquisition links in focused work. |
| `UI-05` | P1 | representative `generate-pages.tsx:181-247,915-946,991-1011,1116-1123,1138-1151` | `source-backed`, `local-first`, release/profile, commit, receipt, deterministic, checksum, and architecture wording dominates ordinary tasks. | Default to task, consequence, and next action; move provenance and implementation diagnostics into disclosures. |
| `UI-06` | P1 | `local-failure-detail.ts:1-9` and its public consumers | Arbitrary `detail` or `message` strings can reach visible and announced error UI. | Map typed conditions to stable outcome/cause/recovery copy and isolate diagnostics from the public message. |
| `UI-07` | P2 | `question-player/react/feedback.tsx`; `hazard-player/react/results.tsx` | Feedback exposes claim/source/inventory/marker IDs and authored-condition, scene-model, and construct jargon. | Lead with outcome, a brief why, and the next action; keep exact sources available under disclosure. |
| `UI-08` | P2 | `generate-pages.tsx:915-930`; generated Home document | Home lacks a compact `free`, `independent`, `unofficial`, `no account required` proposition near the H1 and has no single dominant start. | State the proposition once near the H1 and present one dominant start, while leaving its exact choice unresolved below. |
| `UI-09` | P1 | `correction-form.tsx:418-430`; generated `report/index.html:43` | The dormant corrections route still presents an active `Submit explicitly` control. | Disable or remove submission while dormant; offer a local note/draft and the relevant policy only. |
| `UI-10` | P1 | recovered CL-1 manifest and eight preserved prototypes | CL-1 contains unsupported 10-question, timing, photo, statewide, `nobody`, and placeholder-source claims that conflict with the live 45/60/90 product. | Preserve CL-1 unchanged as quarantined evidence; author a factually current CL-2 in US English with no universal claims. |
| `UI-11` | P2 | Plan 005 inventory at the coordinate above | Plan 005 contains no navigation candidate; its mappings remain hypotheses. | Use the inventory as scope, not behavioral proof or participant-derived hierarchy. |

Priority accounting: `P1=8`, `P2=3`, `total=11`.

## Positives retained

- A skip link and semantic landmarks are present.
- Focus treatment, minimum 44-pixel controls, reduced-motion handling, and
  forced-color handling are established.
- Participant accounting is truthfully `n=0`.
- The recovered CL-1 prototype bytes remain quarantined rather than promoted.

## Consensus candidates from this lane

The supplied lane prioritizes these candidates for cross-lane synthesis:

1. a stable consumer error-message boundary;
2. explicit profile context and a simplified shortest-available practice start;
3. focused player chrome with an explicit exit;
4. task-versus-utility navigation grouping;
5. truthful dormant-correction behavior; and
6. a factually current CL-2 direction.

These are inspection recommendations, not observed user preferences.

## Dissent and unresolved choices

This lane does **not** resolve:

- `Check my exam` versus `Start practice` as the primary Home action;
- exact navigation labels or grouping;
- CL-D1 versus CL-D2;
- any practice-duration statement; or
- how prominent source detail should be.

Those points may be promoted only if another independent Codex lane supplies
compatible evidence and the deterministic synthesis rule selects them. A lack
of cross-lane agreement remains dissent; it is never rewritten as consensus.

## Limitations

- No participant behavior, comprehension, trust, task success, first click,
  assistive-technology use, or accessibility conformance was measured.
- Generated-document hashes describe deterministic local output, not tracked
  source blobs; canonical claims remain anchored to the immutable source files.
- This review identifies defects and directions through code/artifact
  inspection only. Its confidence does not generalize to target users.
