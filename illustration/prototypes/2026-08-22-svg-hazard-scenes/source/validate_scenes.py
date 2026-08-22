#!/usr/bin/env python3
"""Validate the deterministic SVG hazard-scene prototype corpus.

This validator is intentionally scoped to the prototype output. It checks
security/sanitization, answer-leak boundaries, manifest consistency, region
geometry, same-environment generation repeatability, and raster renderability.
It does not replace independent semantic, accessibility, rights, phone, print,
or accidental-hazard review.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET

import cairosvg
from PIL import Image
from shapely.geometry import Point, Polygon

ROOT = Path(__file__).resolve().parents[1]
LEARNER_DIR = ROOT / "renders" / "learner"
REVIEW_DIR = ROOT / "review" / "annotated"
SCENE_DIR = ROOT / "authoring" / "scenes"
GENERATOR = ROOT / "source" / "generate_scenes.py"

SVG_NS = "{http://www.w3.org/2000/svg}"
EXPECTED_VIEWBOX = "0 0 1200 800"
EXPECTED_IDS = {f"s-{i:02d}" for i in range(1, 9)}
DENY_TERMS = (
    "answer",
    "correct",
    "broken",
    "cord",
    "damage",
    "decoy",
    "extinguisher",
    "fire",
    "glass",
    "hazard",
    "puddle",
    "shard",
    "spill",
    "target",
    "unsafe",
    "wet",
)
DISALLOWED_ELEMENTS = {
    "a",
    "desc",
    "foreignObject",
    "image",
    "metadata",
    "script",
    "text",
    "title",
    "use",
}


@dataclass(frozen=True)
class Check:
    check_id: str
    scope: str
    status: str
    detail: str


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def generated_hashes() -> dict[str, str]:
    paths = [
        *sorted(LEARNER_DIR.glob("*.svg")),
        *sorted(REVIEW_DIR.glob("*.svg")),
        *sorted(SCENE_DIR.glob("*.json")),
        ROOT / "authoring" / "scene-index.json",
    ]
    return {str(path.relative_to(ROOT)): sha256(path) for path in paths}


def local_name(tag: str) -> str:
    return tag.split("}", 1)[-1]


def check_learner_svg(path: Path) -> list[Check]:
    checks: list[Check] = []
    raw = path.read_text(encoding="utf-8")
    scope = str(path.relative_to(ROOT))
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        return [Check("SVG-XML", scope, "FAIL", str(exc))]

    checks.append(Check("SVG-XML", scope, "PASS", "well-formed XML"))
    expected_attrs = {
        "viewBox": EXPECTED_VIEWBOX,
        "width": "1200",
        "height": "800",
        "role": "img",
        "aria-hidden": "true",
        "focusable": "false",
    }
    bad_attrs = [f"{key}={root.attrib.get(key)!r}" for key, value in expected_attrs.items() if root.attrib.get(key) != value]
    checks.append(Check("SVG-CANVAS", scope, "FAIL" if bad_attrs else "PASS", "; ".join(bad_attrs) if bad_attrs else "1200x800 / 3:2 logical canvas"))

    found_disallowed: list[str] = []
    found_events: list[str] = []
    found_links: list[str] = []
    for element in root.iter():
        name = local_name(element.tag)
        if name in DISALLOWED_ELEMENTS:
            found_disallowed.append(name)
        for attr_name, value in element.attrib.items():
            attr_local = local_name(attr_name)
            if attr_local.lower().startswith("on"):
                found_events.append(attr_local)
            lowered = value.lower()
            if attr_local in {"href", "src"} or "url(" in lowered or "http:" in lowered or "https:" in lowered or "data:" in lowered:
                found_links.append(f"{attr_local}={value}")
    checks.append(Check("SVG-SAFE-ELEMENTS", scope, "FAIL" if found_disallowed else "PASS", ",".join(sorted(set(found_disallowed))) if found_disallowed else "no disallowed executable/embedded/text elements"))
    checks.append(Check("SVG-NO-EVENTS", scope, "FAIL" if found_events else "PASS", ",".join(sorted(set(found_events))) if found_events else "no event-handler attributes"))
    checks.append(Check("SVG-NO-EXTERNALS", scope, "FAIL" if found_links else "PASS", "; ".join(found_links) if found_links else "no href/src/external URL/data URI"))

    lowered_raw = raw.lower()
    leaked = [term for term in DENY_TERMS if term in lowered_raw]
    review_tokens = [token for token in ("rv-zone", "rv-target", "rv-decoy", "rv-label") if token in lowered_raw]
    checks.append(Check("SVG-NO-ANSWER-TERMS", scope, "FAIL" if leaked else "PASS", ",".join(leaked) if leaked else "no semantic answer terms in learner SVG bytes"))
    checks.append(Check("SVG-NO-REVIEW-CSS", scope, "FAIL" if review_tokens else "PASS", ",".join(review_tokens) if review_tokens else "review-only classes absent"))
    return checks


def check_manifest(path: Path) -> tuple[list[Check], dict[str, object]]:
    checks: list[Check] = []
    scope = str(path.relative_to(ROOT))
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - report exact malformed input
        return [Check("MANIFEST-JSON", scope, "FAIL", str(exc))], {}
    checks.append(Check("MANIFEST-JSON", scope, "PASS", "valid JSON"))

    asset_id = data.get("publicAssetId")
    expected_path = f"renders/learner/{asset_id}.svg"
    files = data.get("files", {})
    checks.append(Check("MANIFEST-ASSET-PATH", scope, "PASS" if files.get("learnerSvg") == expected_path else "FAIL", f"expected {expected_path}; observed {files.get('learnerSvg')}"))

    rights = data.get("rights", {})
    rights_ok = rights.get("officialImageInputs") is False and rights.get("thirdPartyVisualInputs") == []
    checks.append(Check("MANIFEST-INPUT-PROVENANCE", scope, "PASS" if rights_ok else "FAIL", "no official or third-party visual inputs" if rights_ok else json.dumps(rights, sort_keys=True)))

    review = data.get("review", {})
    approval_ok = review.get("productionApproved") is False and review.get("scoredUseApproved") is False
    checks.append(Check("MANIFEST-NONAPPROVAL", scope, "PASS" if approval_ok else "FAIL", "production/scored approval explicitly false" if approval_ok else json.dumps(review, sort_keys=True)))

    zones = data.get("zones", [])
    zone_orders = [zone.get("order") for zone in zones]
    checks.append(Check("MANIFEST-ZONE-ORDER", scope, "PASS" if zone_orders == [1, 2, 3] else "FAIL", f"orders={zone_orders}"))

    regions = data.get("regions", [])
    kinds = [region.get("kind") for region in regions]
    checks.append(Check("MANIFEST-REGION-KINDS", scope, "PASS" if kinds.count("target") == 1 and kinds.count("decoy") == 1 else "FAIL", f"kinds={kinds}"))

    polygons: list[tuple[str, Polygon, Polygon]] = []
    geometry_failures: list[str] = []
    for region in regions:
        coords = [(float(p["x"]), float(p["y"])) for p in region.get("polygon", [])]
        if len(coords) < 3 or any(x < 0 or x > 1 or y < 0 or y > 1 for x, y in coords):
            geometry_failures.append(f"{region.get('regionId')}: invalid/out-of-range polygon")
            continue
        poly = Polygon(coords)
        if not poly.is_valid or poly.area <= 0:
            geometry_failures.append(f"{region.get('regionId')}: invalid/zero-area polygon")
            continue
        point = Point(float(region["anchorPoint"]["x"]), float(region["anchorPoint"]["y"]))
        if not (poly.contains(point) or poly.touches(point)):
            geometry_failures.append(f"{region.get('regionId')}: anchor outside polygon")
        logical_poly = Polygon([(x * 1200.0, y * 800.0) for x, y in coords])
        polygons.append((str(region.get("kind")), poly, logical_poly))
    checks.append(Check("MANIFEST-REGION-GEOMETRY", scope, "FAIL" if geometry_failures else "PASS", "; ".join(geometry_failures) if geometry_failures else "all polygons valid, normalized, and contain anchors"))

    separation_failures: list[str] = []
    for i, (kind_a, poly_a, logical_a) in enumerate(polygons):
        for kind_b, poly_b, logical_b in polygons[i + 1 :]:
            if poly_a.intersects(poly_b):
                separation_failures.append(f"{kind_a}/{kind_b}: authored polygons intersect")
            # Pilot hypothesis from R2.9: 1.5% of the 800-unit logical short edge = 12 units.
            if logical_a.buffer(12.0, join_style=2).intersects(logical_b.buffer(12.0, join_style=2)):
                separation_failures.append(f"{kind_a}/{kind_b}: 12-unit buffered polygons intersect")
    checks.append(Check("MANIFEST-REGION-SEPARATION", scope, "FAIL" if separation_failures else "PASS", "; ".join(separation_failures) if separation_failures else "target/decoy remain separated after a 12-unit (1.5% short-edge) pilot buffer"))

    return checks, data


def render_and_measure(svg_path: Path, output_path: Path, width: int, height: int) -> tuple[str, float, bool]:
    cairosvg.svg2png(url=str(svg_path), write_to=str(output_path), output_width=width, output_height=height)
    with Image.open(output_path) as image:
        image = image.convert("RGBA")
        if image.size != (width, height):
            raise ValueError(f"expected {(width, height)}, observed {image.size}")
        pixels = list(image.get_flattened_data())
    grayscale = all(r == g == b for r, g, b, _a in pixels)
    nonwhite = sum(1 for r, g, b, a in pixels if a > 0 and (r, g, b) != (255, 255, 255)) / len(pixels)
    return sha256(output_path), nonwhite, grayscale


def run(output_csv: Path, metrics_csv: Path) -> int:
    checks: list[Check] = []
    metrics: list[dict[str, object]] = []

    learner_paths = sorted(LEARNER_DIR.glob("*.svg"))
    review_paths = sorted(REVIEW_DIR.glob("*.svg"))
    manifest_paths = sorted(SCENE_DIR.glob("*.json"))
    observed_ids = {path.stem for path in learner_paths}
    checks.append(Check("CORPUS-LEARNER-COUNT", "corpus", "PASS" if observed_ids == EXPECTED_IDS else "FAIL", f"observed={sorted(observed_ids)}"))
    checks.append(Check("CORPUS-REVIEW-COUNT", "corpus", "PASS" if len(review_paths) == 8 else "FAIL", f"count={len(review_paths)}"))
    checks.append(Check("CORPUS-MANIFEST-COUNT", "corpus", "PASS" if len(manifest_paths) == 8 else "FAIL", f"count={len(manifest_paths)}"))

    before = generated_hashes()
    process = subprocess.run([sys.executable, str(GENERATOR)], cwd=ROOT, text=True, capture_output=True, check=False)
    after = generated_hashes()
    reproducible = process.returncode == 0 and before == after
    detail = "byte-identical generated corpus after rerun" if reproducible else f"returncode={process.returncode}; changed={[key for key in sorted(set(before) | set(after)) if before.get(key) != after.get(key)]}; stderr={process.stderr.strip()}"
    checks.append(Check("CORPUS-GENERATOR-REPEAT", "corpus", "PASS" if reproducible else "FAIL", detail))

    for path in learner_paths:
        checks.extend(check_learner_svg(path))

    manifests: list[dict[str, object]] = []
    for path in manifest_paths:
        manifest_checks, data = check_manifest(path)
        checks.extend(manifest_checks)
        if data:
            manifests.append(data)

    manifest_ids = {str(data.get("publicAssetId")) for data in manifests}
    checks.append(Check("CORPUS-MANIFEST-ID-SET", "corpus", "PASS" if manifest_ids == EXPECTED_IDS else "FAIL", f"observed={sorted(manifest_ids)}"))

    with tempfile.TemporaryDirectory(prefix="svg-scene-validation-") as temp:
        temp_dir = Path(temp)
        for svg_path in learner_paths:
            for profile, width, height in (
                ("canonical", 1200, 800),
                ("phone", 360, 240),
                ("print", 1800, 1200),
            ):
                first = temp_dir / f"{svg_path.stem}-{profile}-a.png"
                second = temp_dir / f"{svg_path.stem}-{profile}-b.png"
                try:
                    hash_a, nonwhite, grayscale = render_and_measure(svg_path, first, width, height)
                    hash_b, _nonwhite_b, _grayscale_b = render_and_measure(svg_path, second, width, height)
                    deterministic = hash_a == hash_b
                    status = "PASS" if grayscale and deterministic and 0.01 < nonwhite < 0.60 else "FAIL"
                    detail = f"sha256={hash_a}; nonwhite={nonwhite:.6f}; grayscale={grayscale}; repeat_equal={deterministic}"
                    checks.append(Check(f"RENDER-{profile.upper()}", str(svg_path.relative_to(ROOT)), status, detail))
                    metrics.append({
                        "asset_id": svg_path.stem,
                        "profile": profile,
                        "width": width,
                        "height": height,
                        "sha256": hash_a,
                        "nonwhite_ratio": f"{nonwhite:.6f}",
                        "grayscale": str(grayscale).lower(),
                        "repeat_equal": str(deterministic).lower(),
                    })
                except Exception as exc:  # noqa: BLE001 - preserve exact validation failure
                    checks.append(Check(f"RENDER-{profile.upper()}", str(svg_path.relative_to(ROOT)), "FAIL", str(exc)))

    output_csv.parent.mkdir(parents=True, exist_ok=True)
    with output_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["check_id", "scope", "status", "detail"])
        for check in checks:
            writer.writerow([check.check_id, check.scope, check.status, check.detail])

    with metrics_csv.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["asset_id", "profile", "width", "height", "sha256", "nonwhite_ratio", "grayscale", "repeat_equal"], lineterminator="\n")
        writer.writeheader()
        writer.writerows(metrics)

    failures = [check for check in checks if check.status != "PASS"]
    print(f"checks={len(checks)} pass={len(checks)-len(failures)} fail={len(failures)}")
    for failure in failures:
        print(f"FAIL {failure.check_id} {failure.scope}: {failure.detail}")
    return 1 if failures else 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "raw-results" / "VALIDATION.csv")
    parser.add_argument("--metrics", type=Path, default=ROOT / "raw-results" / "RENDER-METRICS.csv")
    args = parser.parse_args()
    return run(args.output, args.metrics)


if __name__ == "__main__":
    raise SystemExit(main())
