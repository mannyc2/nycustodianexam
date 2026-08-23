# Recovered bundle independent recheck

- UTC date: `2026-08-23`
- Archive: `recovered-input/research-bundle.zip`
- Archive SHA-256:
  `a3dbdb262733be6527347e26cb5e6d8fdb612cf7ee6a09574730a7a6ad188b06`
- Archive files: `90`
- Archive uncompressed bytes: `6,289,966`
- Archive integrity: pass (`ZipFile.testzip()` returned no member)
- Historical `SHA256SUMS`: 79/79 pass
- Fresh rerun A `SHA256SUMS`: 79/79 pass
- Fresh rerun B `SHA256SUMS`: 79/79 pass
- Historical versus rerun A: exact 79/79 byte match
- Rerun A versus rerun B: exact 79/79 byte match

## Runtime

```text
Linux 6.8.0-101-generic x86_64 glibc 2.39
Python 3.12.3
CadQuery 2.8.0
OCP 7.9.3.1
cadquery-ocp 7.9.3.1.1
trimesh 4.11.1
numpy 2.3.5
scipy 1.17.0
Pillow 12.3.0
CairoSVG 2.8.2
SOURCE_DATE_EPOCH=1787184000
```

The recovered historical build records Python 3.13.5 and a newer kernel/glibc,
but the fresh Python 3.12.3 run still reproduced all 79 compared files exactly.
This is an exact observation for these two environments, not a general supported
version interval.

## Commands

```text
unzip research-bundle.zip -d <bundle>
SOURCE_DATE_EPOCH=1787184000 python <bundle>/build_poc.py --out <rerun-a>
SOURCE_DATE_EPOCH=1787184000 python <bundle>/build_poc.py --out <rerun-b>
python probes/recovered_bundle_audit.py \
  --archive research-bundle.zip \
  --bundle-root <bundle> \
  --historical-build <bundle>/poc-build-a \
  --rerun-a <rerun-a> \
  --rerun-b <rerun-b> \
  --out raw-results/recovered-bundle-audit.json
```

## Important distinction

The recovered bundle's own top-level file hashes are authoritative for this exact
archive. Several hashes extracted earlier from the partial GitHub narrative refer
to a different normalized/packaged artifact shape. The matching archive identity
does not make those nonmatching compact-file claims true; both coordinates remain
recorded rather than conflated.
