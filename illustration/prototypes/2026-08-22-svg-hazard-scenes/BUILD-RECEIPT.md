# Build receipt

- Repository: `mannyc2/nycustodianexam`
- Base branch: `agent/chat-corpus-reconciliation`
- Immutable base SHA: `723bddb232f3c070d6c1ac6c9d10576464a222d9`
- Prototype branch: `prototype/svg-hazard-scenes-p1-p3-p5-p7`
- Draft PR: `#20`
- Observation/build date: `2026-08-22`
- Generator: `source/generate_scenes.py`
- Validator: `source/validate_scenes.py`

## Output counts

- learner-facing SVGs: 8;
- answer-bearing review SVGs: 8;
- scene manifests: 8;
- scene index: 1;
- review gallery: 1.

## Automated validation

`python3 source/validate_scenes.py` completed with:

```text
checks=149 pass=149 fail=0
```

The suite checks deterministic same-environment regeneration, learner-SVG sanitization and answer-leak boundaries, manifest consistency, region validity/separation, and deterministic grayscale rasterization at canonical, phone, and print probe sizes.

## Explicit limitations

- No independent semantic or accidental-hazard reviewer participated.
- No human phone or print recognition test was completed.
- No assistive-technology or nonvisual-equivalent test was completed.
- No production rights reviewer signed off.
- Source coordinates are pilot bases, not final scored-content admission.
- The prototype does not execute the full 24-candidate R2.9 pilot.
- No candidate is production-approved or scored-use-approved.
