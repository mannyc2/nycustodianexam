# Independent accidental-hazard review handoff

The 18-scene bank is exact-pixel complete and intentionally awaits a reviewer
who is not the generator/operator. Review the same master hash recorded in each
entry of `independent-review.json`.

## Required views

- `PHONE-CONTACT-SHEET.png` for small-screen recognition and ambiguity;
- `PRINT-CONTACT-SHEET.png` for grayscale survival;
- `OVERLAY-CONTACT-SHEET.png` for target/decoy region alignment;
- `content/assets/masters/scenes/s001.png` through `s018.png` for native-detail
  inspection where a contact-sheet tile is uncertain.

## Per-scene decision

Confirm that the exact pixels contain the authored target, preserve every decoy
as safe, introduce no additional condition from any of the eight hazard
families, contain no answer cue or consequential pseudotext, and remain fair on
phone and grayscale views. Zero-hazard controls must contain no target.

In `independent-review.json`, retain the recorded `reviewedMasterSha256`, set a
reviewer identity different from the generator/operator, add the UTC review
date, record concrete findings, and change `status` from `pending` to `pass` or
`reject` for every scene.

Then run:

```sh
node content/authoring/visuals/releases/build-scene-release.mjs
jq -e 'all(.[]; .productionStatus == "accepted")' content/authoring/visuals/releases/scenes.json
sha256sum -c content/assets/SCENE-MANIFEST.sha256
git diff --check
```

The build refuses a non-independent reviewer, a stale reviewed hash, an invalid
status, or a missing review date. A rejection stays rejected until the candidate
is replaced and all affected review, region, derivative, and checksum stages are
rerun.
