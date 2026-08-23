# Rebuild receipt

## Result

`OBSERVED_PASS`.

The exact recovered source was built twice in a fresh temporary environment. Both
reruns reproduce the recovered historical 79-file build exactly.

## Input identity

- Path in this lane: `recovered-input/research-bundle.zip`
- Bytes: `2,309,138`
- SHA-256:
  `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`
- Archive members: `90`
- ZIP test: pass

## Fresh audit environment

```text
Linux 6.8.0-101-generic x86_64 glibc 2.39
Python 3.12.3
CadQuery 2.8.0
cadquery-ocp 7.9.3.1.1
OCP 7.9.3.1
trimesh 4.11.1
numpy 2.3.5
scipy 1.17.0
Pillow 12.3.0
CairoSVG 2.8.2
SOURCE_DATE_EPOCH=1787184000
```

The recovered build receipt names Python 3.13.5 on Linux 6.18.35/glibc 2.41 with
the same specialist package versions. The cross-Python exact match is observed,
not generalized beyond these runs.

## Commands

```text
unzip recovered-input/research-bundle.zip -d <bundle>
SOURCE_DATE_EPOCH=1787184000 python <bundle>/build_poc.py --out <rerun-a>
SOURCE_DATE_EPOCH=1787184000 python <bundle>/build_poc.py --out <rerun-b>
python probes/recovered_bundle_audit.py \
  --archive recovered-input/research-bundle.zip \
  --bundle-root <bundle> \
  --historical-build <bundle>/poc-build-a \
  --rerun-a <rerun-a> \
  --rerun-b <rerun-b> \
  --out raw-results/recovered-bundle-audit.json
```

## Manifest comparison

| Comparison | Result |
|---|---|
| historical manifest | 79/79 match |
| rerun A manifest | 79/79 match |
| rerun B manifest | 79/79 match |
| historical vs rerun A | exact; 0 differences |
| rerun A vs rerun B | exact; 0 differences |

## Independent geometry observations

| POC | STEP re-import | Bounds delta | Part meshes | Combined review mesh | GLB metadata |
|---|---|---:|---|---|---|
| `t0004` | valid, 3 solids | 0 mm | all watertight | watertight | neutral |
| `t0005` | valid, 3 solids | 0 mm | all watertight | watertight | neutral |
| `t0006` | valid, 2 solids | 0.105941 mm | all watertight | **not watertight** | neutral |
| `t0007` | valid, 2 solids | 0.120172 mm | all watertight | watertight | neutral |

The smoke probe's earlier STEP-header volatility remains a useful general caution,
but this exact POC build neutralizes its relevant inputs sufficiently to reproduce
the STEP bytes in both fresh runs.
