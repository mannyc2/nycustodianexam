# Answer-leak audit

## Verdict

The architecture is directionally correct, but the actual leak controls cannot be verified because no POC SVG, GLB, asset manifest instance, delivery manifest, or scored-page fixture is present.

## Inspectable proposal

The proposed JSON Schema requires internal fields such as:

- `taxonomyId`;
- `canonicalName`;
- source file paths;
- decisive invariants;
- generated output paths;
- validation/review records.

Those fields are appropriate for internal authoring and review. They are answer-bearing and must not be shipped unchanged to a pre-commit scored client.

The report states that GLB nodes/materials should use neutral names such as `component_00` and `material_00`, and that scored assets should use fixed static views. These are unverified requirements, not observed passes.

## Surface audit

| Surface | Evidence available | Status | Required gate |
|---|---|---|---|
| Repository research paths | Names identify the POC | acceptable for internal research | never expose as scored delivery URLs |
| Scored asset URL/filename | No delivery fixture | BLOCKED | content-addressed or neutral mapped path |
| DOM and visible text | No scored fixture | BLOCKED | no answer, family, or decisive verdict before durable commit |
| `alt` / accessible name | No fixture | BLOCKED | neutral attempt description only; full description after commit |
| SVG title/desc/IDs/classes/comments | No SVG bytes | BLOCKED | parse and reject answer-bearing strings and active content |
| GLB node/mesh/material/extras/URIs | No GLB bytes | BLOCKED | structured parse and denylist scan, not byte grep alone |
| Asset manifest | Only schema, no instances | BLOCKED | compile a stripped delivery manifest with neutral IDs |
| Offline pack index | No pack fixture | BLOCKED | no canonical name or answer mapping in pre-commit public metadata |
| Source maps/bundle strings | No application fixture | BLOCKED | build scan and browser observation before release |
| Camera/rotation | Narrative only | BLOCKED | fixed scored static view; no pre-answer GLB or alternate views |

## Decisive-feature leakage

A neutral description cannot simply recite the decisive taxonomy difference when that difference solves the item. Examples:

- naming smooth parallel jaws and a worm can identify an adjustable wrench;
- naming serrated hook/heel jaws can identify a pipe wrench;
- stating that a lower flange is present can identify a flange plunger;
- stating that no flange exists can identify a cup plunger.

The pre-commit description should communicate that an image is present and its general orientation without disclosing the answer-bearing comparison. A full descriptive equivalent must be available after commitment, and a separately authored nonvisual equivalent must preserve accessibility without leaking the scored answer.

## Required future probe

For each exact release candidate hash:

1. parse SVG XML and GLB JSON/chunks;
2. enumerate filenames, paths, IDs, titles, descriptions, classes, comments, node names, mesh names, material names, extras, URIs, and extension payloads;
3. render the scored page before commitment with screen-reader accessibility inspection;
4. inspect network requests, offline manifests, HTML, source maps, and bundled strings;
5. confirm that only the exact authored static view is reachable before commitment;
6. repeat after every semantic or delivery-path change.

No answer-leak pass is granted by this audit.
