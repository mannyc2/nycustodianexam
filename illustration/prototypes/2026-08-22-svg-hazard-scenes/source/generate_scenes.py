#!/usr/bin/env python3
"""Generate deterministic, original SVG hazard-scene draft candidates.

The geometry helpers and scene definitions are split into small source modules so
the complete authoring fixture remains readable and reviewable in GitHub.
"""

from __future__ import annotations

import json
from typing import Any

from scene_group_1 import scene_01, scene_02, scene_03, scene_04
from scene_group_2 import scene_05, scene_06, scene_07, scene_08
from svg_core import AUTHORING_DIR, LEARNER_DIR, REVIEW_DIR, ROOT, add_review_overlay

SCENES = [
    scene_01,
    scene_02,
    scene_03,
    scene_04,
    scene_05,
    scene_06,
    scene_07,
    scene_08,
]


def main() -> None:
    LEARNER_DIR.mkdir(parents=True, exist_ok=True)
    REVIEW_DIR.mkdir(parents=True, exist_ok=True)
    AUTHORING_DIR.mkdir(parents=True, exist_ok=True)

    index: list[dict[str, Any]] = []

    for build_scene in SCENES:
        learner_canvas, manifest = build_scene()
        asset_id = manifest["publicAssetId"]
        learner_path = LEARNER_DIR / f"{asset_id}.svg"
        manifest_path = AUTHORING_DIR / f"{manifest['sceneId']}.json"
        review_path = REVIEW_DIR / f"{asset_id}.review.svg"

        learner_svg = learner_canvas.svg()
        learner_path.write_text(learner_svg, encoding="utf-8", newline="\n")

        review_canvas, _ = build_scene()
        add_review_overlay(review_canvas, manifest)
        review_path.write_text(review_canvas.svg(review=True), encoding="utf-8", newline="\n")

        manifest["files"] = {
            "learnerSvg": str(learner_path.relative_to(ROOT)).replace("\\", "/"),
            "reviewOverlaySvg": str(review_path.relative_to(ROOT)).replace("\\", "/"),
            "authoringManifest": str(manifest_path.relative_to(ROOT)).replace("\\", "/"),
        }
        manifest_path.write_text(
            json.dumps(manifest, indent=2, sort_keys=True, ensure_ascii=True) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        index.append({
            "publicAssetId": asset_id,
            "sceneId": manifest["sceneId"],
            "pilotClass": manifest["pilotClass"],
            "environment": manifest["environment"],
            "transferOf": manifest["transferOf"],
            "learnerSvg": manifest["files"]["learnerSvg"],
            "reviewOverlaySvg": manifest["files"]["reviewOverlaySvg"],
            "authoringManifest": manifest["files"]["authoringManifest"],
            "approval": "draft-unreviewed",
        })

    (ROOT / "authoring" / "scene-index.json").write_text(
        json.dumps(index, indent=2, sort_keys=True, ensure_ascii=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


if __name__ == "__main__":
    main()
