#!/usr/bin/env python3
"""Generate deterministic, original SVG hazard-scene draft candidates.

This is a prototype authoring fixture. It intentionally uses only the Python
standard library and contains no external image inputs.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence
from xml.sax.saxutils import escape

WIDTH = 1200
HEIGHT = 800
ROOT = Path(__file__).resolve().parents[1]
LEARNER_DIR = ROOT / "renders" / "learner"
REVIEW_DIR = ROOT / "review" / "annotated"
AUTHORING_DIR = ROOT / "authoring" / "scenes"

BASE_STYLE = """
.bg{fill:#fff}
.o{fill:#fff;stroke:#111;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}
.s{fill:none;stroke:#111;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.f{fill:none;stroke:#111;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.g1{fill:#e4e4e4;stroke:#111;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.g2{fill:#bdbdbd;stroke:#111;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.g3{fill:#8f8f8f;stroke:#111;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
.k{fill:#111;stroke:none}
.c{fill:none;stroke:#111;stroke-width:10;stroke-linecap:round;stroke-linejoin:round}
""".strip()

REVIEW_STYLE = """
.rv-zone{fill:none;stroke:#555;stroke-width:3;stroke-dasharray:12 10}
.rv-target{fill:none;stroke:#111;stroke-width:8}
.rv-decoy{fill:none;stroke:#555;stroke-width:5;stroke-dasharray:16 10}
.rv-label{font-family:Arial,sans-serif;font-size:34px;font-weight:700;fill:#111;stroke:#fff;stroke-width:7;paint-order:stroke}
""".strip()


def attrs(**values: Any) -> str:
    out: list[str] = []
    for key in sorted(values):
        value = values[key]
        if value is None:
            continue
        name = key.rstrip("_").replace("__", ":").replace("_", "-")
        out.append(f'{name}="{escape(str(value))}"')
    return " ".join(out)


def tag(name: str, *, close: bool = True, content: str | None = None, **values: Any) -> str:
    rendered_attrs = attrs(**values)
    prefix = f"<{name}" + (f" {rendered_attrs}" if rendered_attrs else "")
    if content is not None:
        return f"{prefix}>{content}</{name}>"
    return f"{prefix}/>" if close else f"{prefix}>"


@dataclass
class Canvas:
    body: list[str]

    @classmethod
    def create(cls) -> "Canvas":
        return cls(body=[])

    def raw(self, value: str) -> None:
        self.body.append(value)

    def rect(self, x: float, y: float, w: float, h: float, cls: str, rx: float | None = None) -> None:
        self.raw(tag("rect", x=x, y=y, width=w, height=h, rx=rx, class_=cls))

    def line(self, x1: float, y1: float, x2: float, y2: float, cls: str) -> None:
        self.raw(tag("line", x1=x1, y1=y1, x2=x2, y2=y2, class_=cls))

    def path(self, d: str, cls: str) -> None:
        self.raw(tag("path", d=d, class_=cls))

    def circle(self, cx: float, cy: float, r: float, cls: str) -> None:
        self.raw(tag("circle", cx=cx, cy=cy, r=r, class_=cls))

    def ellipse(self, cx: float, cy: float, rx: float, ry: float, cls: str) -> None:
        self.raw(tag("ellipse", cx=cx, cy=cy, rx=rx, ry=ry, class_=cls))

    def polygon(self, points: Sequence[tuple[float, float]], cls: str) -> None:
        value = " ".join(f"{x:g},{y:g}" for x, y in points)
        self.raw(tag("polygon", points=value, class_=cls))

    def polyline(self, points: Sequence[tuple[float, float]], cls: str) -> None:
        value = " ".join(f"{x:g},{y:g}" for x, y in points)
        self.raw(tag("polyline", points=value, class_=cls))

    def text(self, x: float, y: float, value: str, cls: str, anchor: str = "middle") -> None:
        self.raw(tag("text", x=x, y=y, class_=cls, text_anchor=anchor, content=escape(value)))

    def svg(self, *, review: bool = False) -> str:
        body = "\n  ".join(self.body)
        style = BASE_STYLE + ("\n" + REVIEW_STYLE if review else "")
        return (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" '
            f'width="{WIDTH}" height="{HEIGHT}" role="img" aria-hidden="true" '
            'focusable="false" shape-rendering="geometricPrecision">\n'
            f"<style>{style}</style>\n"
            f"  {body}\n"
            "</svg>\n"
        )


def normalized(points: Sequence[tuple[float, float]]) -> list[dict[str, float]]:
    return [{"x": round(x / WIDTH, 6), "y": round(y / HEIGHT, 6)} for x, y in points]


def anchor(point: tuple[float, float]) -> dict[str, float]:
    return {"x": round(point[0] / WIDTH, 6), "y": round(point[1] / HEIGHT, 6)}


def room(c: Canvas, *, floor_y: float = 500, vanishing_x: float = 600, back_left: float = 100, back_right: float = 1100) -> None:
    c.rect(0, 0, WIDTH, HEIGHT, "bg")
    c.line(back_left, 95, back_right, 95, "s")
    c.line(back_left, 95, back_left, floor_y, "s")
    c.line(back_right, 95, back_right, floor_y, "s")
    c.line(back_left, floor_y, back_right, floor_y, "s")
    c.line(back_left, floor_y, 35, 770, "s")
    c.line(back_right, floor_y, 1165, 770, "s")
    c.line(35, 770, 1165, 770, "s")
    # Perspective floor grid.
    for bx in (130, 300, 470, 650, 830, 1010):
        c.line(vanishing_x, floor_y, bx, 770, "f")
    for y, left, right in ((565, 83, 1117), (635, 66, 1134), (706, 48, 1152)):
        c.line(left, y, right, y, "f")
    c.line(back_left, 470, back_right, 470, "f")


def door(c: Canvas, x: float, y: float, w: float, h: float, *, knob_right: bool = True) -> None:
    c.rect(x, y, w, h, "o")
    c.circle(x + (w - 23 if knob_right else 23), y + h * 0.54, 8, "o")


def flat_mat(c: Canvas, points: Sequence[tuple[float, float]]) -> None:
    c.polygon(points, "g1")
    # Sparse diagonal texture, clipped conceptually by keeping lines inside the mat.
    xs = [points[0][0] + 28, points[0][0] + 72, points[0][0] + 116]
    y_top = min(p[1] for p in points) + 16
    y_bottom = max(p[1] for p in points) - 14
    for x in xs:
        c.line(x, y_top, x + 36, y_bottom, "f")


def puddle(c: Canvas, d: str, highlights: Sequence[str]) -> None:
    c.path(d, "g2")
    for h in highlights:
        c.path(h, "f")


def wall_cord_coil(c: Canvas, cx: float, cy: float, r: float) -> None:
    c.path(
        f"M {cx-r} {cy} "
        f"C {cx-r} {cy-r*1.15}, {cx+r} {cy-r*1.15}, {cx+r} {cy} "
        f"C {cx+r} {cy+r*1.15}, {cx-r} {cy+r*1.15}, {cx-r} {cy} "
        f"C {cx-r} {cy-r*.65}, {cx+r*.55} {cy-r*.65}, {cx+r*.55} {cy} "
        f"C {cx+r*.55} {cy+r*.65}, {cx-r*.45} {cy+r*.65}, {cx-r*.45} {cy}",
        "s",
    )
    c.line(cx, cy-r-18, cx, cy-r-45, "s")
    c.path(f"M {cx-22} {cy-r-45} Q {cx} {cy-r-65} {cx+22} {cy-r-45}", "s")


def floor_machine(c: Canvas, x: float, y: float, scale: float = 1.0) -> None:
    c.ellipse(x, y, 105 * scale, 35 * scale, "g1")
    c.rect(x - 62 * scale, y - 78 * scale, 124 * scale, 72 * scale, "o", rx=18 * scale)
    c.line(x - 34 * scale, y - 76 * scale, x - 68 * scale, y - 245 * scale, "s")
    c.line(x + 6 * scale, y - 76 * scale, x - 29 * scale, y - 245 * scale, "s")
    c.line(x - 82 * scale, y - 245 * scale, x - 10 * scale, y - 245 * scale, "s")
    c.line(x - 72 * scale, y - 265 * scale, x - 20 * scale, y - 265 * scale, "s")
    c.circle(x - 50 * scale, y - 112 * scale, 10 * scale, "o")


def upright_vacuum(c: Canvas, x: float, y: float, scale: float = 1.0) -> None:
    c.path(
        f"M {x-80*scale} {y} L {x+80*scale} {y} "
        f"L {x+65*scale} {y-48*scale} L {x-65*scale} {y-48*scale} Z",
        "g1",
    )
    c.rect(x - 40 * scale, y - 180 * scale, 80 * scale, 128 * scale, "o", rx=14 * scale)
    c.line(x - 20 * scale, y - 180 * scale, x - 45 * scale, y - 335 * scale, "s")
    c.line(x + 18 * scale, y - 180 * scale, x - 8 * scale, y - 335 * scale, "s")
    c.line(x - 58 * scale, y - 335 * scale, x + 5 * scale, y - 335 * scale, "s")
    c.circle(x - 45 * scale, y - 18 * scale, 14 * scale, "o")
    c.circle(x + 45 * scale, y - 18 * scale, 14 * scale, "o")


def extinguisher_cabinet(c: Canvas, x: float, y: float, w: float, h: float) -> None:
    c.rect(x, y, w, h, "o", rx=8)
    c.rect(x + 15, y + 15, w - 30, h - 30, "f", rx=5)
    # Generic extinguisher silhouette, no label or text.
    cx = x + w / 2
    c.rect(cx - 33, y + 95, 66, h - 145, "g1", rx=22)
    c.rect(cx - 20, y + 68, 40, 30, "o", rx=5)
    c.line(cx - 4, y + 68, cx - 4, y + 45, "s")
    c.path(f"M {cx-5} {y+46} Q {cx+32} {y+27} {cx+48} {y+61}", "s")
    c.path(f"M {cx+48} {y+61} Q {cx+70} {y+105} {cx+48} {y+145}", "f")


def box(c: Canvas, x: float, y: float, w: float, h: float) -> None:
    c.rect(x, y, w, h, "g1")
    c.line(x + w * 0.5, y, x + w * 0.5, y + h, "f")
    c.line(x + 12, y + h * 0.28, x + w - 12, y + h * 0.28, "f")


def janitor_cart(c: Canvas, x: float, y: float, scale: float = 1.0) -> None:
    w = 260 * scale
    h = 190 * scale
    c.rect(x, y - h, w, h, "g1", rx=16 * scale)
    c.line(x + 35 * scale, y - 128 * scale, x + w - 35 * scale, y - 128 * scale, "s")
    c.line(x + 35 * scale, y - 70 * scale, x + w - 35 * scale, y - 70 * scale, "s")
    c.rect(x + 26 * scale, y - 118 * scale, 70 * scale, 40 * scale, "o", rx=8 * scale)
    c.rect(x + 112 * scale, y - 118 * scale, 62 * scale, 40 * scale, "o", rx=8 * scale)
    c.path(
        f"M {x+w-58*scale} {y-h+8*scale} "
        f"L {x+w-15*scale} {y-h+8*scale} "
        f"L {x+w-15*scale} {y-24*scale} "
        f"L {x+w-58*scale} {y-24*scale} Z",
        "g2",
    )
    c.line(x + w, y - h + 30 * scale, x + w + 42 * scale, y - h + 2 * scale, "s")
    c.line(x + w + 42 * scale, y - h + 2 * scale, x + w + 42 * scale, y - h - 40 * scale, "s")
    c.circle(x + 46 * scale, y + 8 * scale, 18 * scale, "o")
    c.circle(x + w - 46 * scale, y + 8 * scale, 18 * scale, "o")


def folded_chairs(c: Canvas, x: float, y: float, count: int = 3) -> None:
    for i in range(count):
        dx = i * 28
        c.line(x + dx, y, x + 55 + dx, y - 160, "s")
        c.line(x + 55 + dx, y - 160, x + 105 + dx, y - 30, "s")
        c.line(x + 22 + dx, y - 92, x + 86 + dx, y - 92, "s")
        c.line(x + 22 + dx, y - 92, x + 7 + dx, y - 28, "s")
        c.line(x + 86 + dx, y - 92, x + 112 + dx, y - 28, "s")


def shard(c: Canvas, points: Sequence[tuple[float, float]]) -> None:
    c.polygon(points, "g1")
    if len(points) >= 3:
        x0, y0 = points[0]
        x1, y1 = points[1]
        xm = (x0 + x1) / 2
        ym = (y0 + y1) / 2
        c.line(xm, ym, points[-1][0], points[-1][1], "f")


def paper_ball(c: Canvas, cx: float, cy: float, r: float = 30) -> None:
    c.path(
        f"M {cx-r} {cy} Q {cx-r*.75} {cy-r*.9} {cx} {cy-r} "
        f"Q {cx+r*.8} {cy-r*.8} {cx+r} {cy} "
        f"Q {cx+r*.7} {cy+r*.9} {cx} {cy+r} "
        f"Q {cx-r*.8} {cy+r*.7} {cx-r} {cy} Z",
        "g1",
    )
    c.path(f"M {cx-r*.55} {cy-r*.25} Q {cx} {cy-r*.55} {cx+r*.5} {cy-r*.1}", "f")
    c.path(f"M {cx-r*.45} {cy+r*.3} Q {cx} {cy} {cx+r*.55} {cy+r*.35}", "f")


def add_review_overlay(c: Canvas, manifest: dict[str, Any]) -> None:
    for zone in manifest["zones"]:
        if "polygon" in zone:
            points = [(p["x"] * WIDTH, p["y"] * HEIGHT) for p in zone["polygon"]]
            c.polygon(points, "rv-zone")
            ax = sum(x for x, _ in points) / len(points)
            ay = sum(y for _, y in points) / len(points)
        else:
            x, y, w, h = zone["rect"]
            points = [(x * WIDTH, y * HEIGHT), ((x + w) * WIDTH, y * HEIGHT),
                      ((x + w) * WIDTH, (y + h) * HEIGHT), (x * WIDTH, (y + h) * HEIGHT)]
            c.polygon(points, "rv-zone")
            ax = (x + w / 2) * WIDTH
            ay = (y + h / 2) * HEIGHT
        c.text(ax, ay, f"Z{zone['order']}", "rv-label")

    target_num = 1
    decoy_num = 1
    for region in manifest["regions"]:
        points = [(p["x"] * WIDTH, p["y"] * HEIGHT) for p in region["polygon"]]
        cls = "rv-target" if region["kind"] == "target" else "rv-decoy"
        c.polygon(points, cls)
        ap = region["anchorPoint"]
        label = f"T{target_num}" if region["kind"] == "target" else f"D{decoy_num}"
        if region["kind"] == "target":
            target_num += 1
        else:
            decoy_num += 1
        c.text(ap["x"] * WIDTH, ap["y"] * HEIGHT, label, "rv-label")


def base_manifest(
    *,
    scene_id: str,
    public_asset_id: str,
    pilot_class: str,
    environment: str,
    claim_ref: dict[str, str],
    semantic_inventory: list[dict[str, Any]],
    negative_inventory: list[str],
    zones: list[dict[str, Any]],
    regions: list[dict[str, Any]],
    neutral_description: str,
    neutral_zones: list[dict[str, str]],
    full_description: str,
    transfer_of: str | None = None,
) -> dict[str, Any]:
    return {
        "sceneId": scene_id,
        "sceneVersion": "0.1.0-draft.1",
        "publicAssetId": public_asset_id,
        "pilotClass": pilot_class,
        "authoringRoute": "S",
        "environment": environment,
        "transferOf": transfer_of,
        "canvas": {"width": WIDTH, "height": HEIGHT, "aspectRatio": "3:2"},
        "claimRefs": [claim_ref],
        "semanticInventory": semantic_inventory,
        "negativeInventory": negative_inventory,
        "zones": zones,
        "regions": regions,
        "accessibility": {
            "neutralAttemptDescription": neutral_description,
            "neutralZones": neutral_zones,
            "fullDescription": full_description,
            "state": "draft-unreviewed",
        },
        "rights": {
            "officialImageInputs": False,
            "thirdPartyVisualInputs": [],
            "sourceMethod": "project-owned deterministic SVG construction",
            "generator": "source/generate_scenes.py",
            "state": "review-required",
        },
        "review": {
            "semantic": "not-reviewed",
            "accidentalHazards": "not-reviewed",
            "decoys": "not-reviewed",
            "hotspots": "draft-only",
            "accessibility": "not-reviewed",
            "phone": "automated-render-only",
            "print": "not-reviewed",
            "rights": "not-reviewed",
            "productionApproved": False,
            "scoredUseApproved": False,
        },
    }


def region(
    region_id: str,
    kind: str,
    zone_id: str,
    object_id: str,
    condition_id: str,
    points: Sequence[tuple[float, float]],
    anchor_point: tuple[float, float],
) -> dict[str, Any]:
    return {
        "regionId": region_id,
        "kind": kind,
        "zoneId": zone_id,
        "semanticObjectId": object_id,
        "conditionId": condition_id,
        "polygon": normalized(points),
        "anchorPoint": anchor(anchor_point),
        "reviewState": "draft-unreviewed",
        "toleranceClass": "pilot-medium",
    }


def zone(zone_id: str, order: int, label: str, points: Sequence[tuple[float, float]], facts: list[str]) -> dict[str, Any]:
    return {
        "zoneId": zone_id,
        "order": order,
        "labelNeutral": label,
        "polygon": normalized(points),
        "observableFacts": facts,
    }

