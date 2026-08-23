#!/usr/bin/env python3
"""Independent audit probe for the recovered R2.10 geometry bundle.

The recovered build script remains immutable input. This probe reads its generated
artifacts and performs checks that the original validation JSON did not perform:
STEP re-import, measured runtime reporting, cross-build hashes, delivery metadata,
and small-render visibility measurements.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import platform
import struct
import sys
import zipfile
from pathlib import Path
from typing import Any

import cadquery as cq
import cairosvg
import numpy as np
import OCP
from PIL import Image
import scipy
import trimesh


ASSET_IDS = ("t0004", "t0005", "t0006", "t0007")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def hashes(root: Path) -> dict[str, str]:
    return {
        path.relative_to(root).as_posix(): sha256(path)
        for path in sorted(root.rglob("*"))
        if path.is_file() and path.name not in {"SHA256SUMS", "determinism-comparison.json"}
    }


def bbox(shape: cq.Shape) -> dict[str, float]:
    bounds = shape.BoundingBox()
    return {
        name: round(float(value), 6)
        for name, value in {
            "xmin": bounds.xmin,
            "xmax": bounds.xmax,
            "xlen": bounds.xlen,
            "ymin": bounds.ymin,
            "ymax": bounds.ymax,
            "ylen": bounds.ylen,
            "zmin": bounds.zmin,
            "zmax": bounds.zmax,
            "zlen": bounds.zlen,
        }.items()
    }


def bbox_delta(left: dict[str, float], right: dict[str, float]) -> float:
    return round(max(abs(float(left[key]) - float(right[key])) for key in left), 9)


def mesh_metrics(path: Path) -> dict[str, Any]:
    mesh = trimesh.load_mesh(path, process=True, maintain_order=False)
    if isinstance(mesh, trimesh.Scene):
        mesh = trimesh.util.concatenate(tuple(mesh.geometry.values()))
    mesh.merge_vertices()
    mesh.remove_unreferenced_vertices()
    return {
        "vertices": int(len(mesh.vertices)),
        "faces": int(len(mesh.faces)),
        "connectedComponents": int(len(mesh.split(only_watertight=False))),
        "watertight": bool(mesh.is_watertight),
        "windingConsistent": bool(mesh.is_winding_consistent),
        "bounds": np.asarray(mesh.bounds).round(6).tolist(),
        "volumeMm3": round(abs(float(mesh.volume)), 6),
    }


def glb_json(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    if data[:4] != b"glTF":
        raise ValueError(f"not GLB: {path}")
    _magic, _version, total_length = struct.unpack_from("<III", data, 0)
    if total_length != len(data):
        raise ValueError(f"invalid GLB byte length: {path}")
    chunk_length, chunk_type = struct.unpack_from("<II", data, 12)
    if chunk_type != 0x4E4F534A:
        raise ValueError(f"missing GLB JSON chunk: {path}")
    return json.loads(data[20 : 20 + chunk_length].rstrip(b" \x00").decode("utf-8"))


def extras_paths(value: Any, path: str = "$") -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if key == "extras":
                found.append(child_path)
            found.extend(extras_paths(child, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(extras_paths(child, f"{path}[{index}]"))
    return found


def image_metrics(path: Path) -> dict[str, Any]:
    with Image.open(path) as image:
        info_keys = sorted(image.info)
        gray = image.convert("L")
        resized = gray.resize((320, 320), Image.Resampling.LANCZOS)
        pixels = np.asarray(resized)
    dark = pixels < 180
    coordinates = np.argwhere(dark)
    dark_bbox = None
    if len(coordinates):
        ymin, xmin = coordinates.min(axis=0)
        ymax, xmax = coordinates.max(axis=0)
        dark_bbox = [int(xmin), int(ymin), int(xmax), int(ymax)]
    return {
        "mode": gray.mode,
        "sourceSizePx": list(gray.size),
        "metadataKeys": info_keys,
        "phoneProbeSizePx": [320, 320],
        "phoneProbeDarkPixels": int(dark.sum()),
        "phoneProbeDarkPixelFraction": round(float(dark.mean()), 8),
        "phoneProbeDarkPixelBbox": dark_bbox,
    }


def verify_checksum_manifest(root: Path) -> dict[str, Any]:
    entries: list[dict[str, Any]] = []
    for line in (root / "SHA256SUMS").read_text(encoding="ascii").splitlines():
        expected, relative = line.split("  ", 1)
        path = root / relative
        actual = sha256(path) if path.is_file() else None
        entries.append({"path": relative, "expected": expected, "actual": actual, "match": actual == expected})
    return {
        "entryCount": len(entries),
        "allMatch": all(entry["match"] for entry in entries),
        "mismatches": [entry for entry in entries if not entry["match"]],
    }


def compare(left: Path, right: Path) -> dict[str, Any]:
    left_hashes = hashes(left)
    right_hashes = hashes(right)
    differences = [
        {"path": path, "left": left_hashes.get(path), "right": right_hashes.get(path)}
        for path in sorted(set(left_hashes) | set(right_hashes))
        if left_hashes.get(path) != right_hashes.get(path)
    ]
    return {
        "leftFileCount": len(left_hashes),
        "rightFileCount": len(right_hashes),
        "exactMatch": not differences,
        "differences": differences,
    }


def load_source_models(bundle_root: Path) -> dict[str, Any]:
    module_name = "recovered_r210_build_poc"
    spec = importlib.util.spec_from_file_location(module_name, bundle_root / "build_poc.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("could not load recovered build_poc.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    models = [
        module.make_adjustable_wrench(),
        module.make_pipe_wrench(),
        module.make_cup_plunger(),
        module.make_flange_plunger(),
    ]
    result: dict[str, Any] = {}
    for model in models:
        distances = []
        for index, left in enumerate(model.parts):
            for right in model.parts[index + 1 :]:
                distances.append(
                    {
                        "parts": sorted([left.private_name, right.private_name]),
                        "minimumDistanceMm": round(float(left.shape.distance(right.shape)), 9),
                    }
                )
        result[model.asset_key] = {
            "sourcePartCount": len(model.parts),
            "partNames": [part.private_name for part in model.parts],
            "pairwiseMinimumDistances": distances,
        }
    return result


def audit_asset(build: Path, asset_id: str, source_model: dict[str, Any]) -> dict[str, Any]:
    root = build / "objects" / asset_id
    validation = json.loads((root / "qa" / "validation.json").read_text(encoding="ascii"))
    parameters = json.loads((root / "source" / "parameters.json").read_text(encoding="ascii"))
    source_record = json.loads((root / "source" / "source-record.json").read_text(encoding="ascii"))

    step_path = root / "master" / "master.step"
    imported = cq.importers.importStep(str(step_path)).val()
    imported_bbox = bbox(imported)

    delivery_files = [
        path
        for path in root.rglob("*")
        if path.is_file() and any(part in {"renders", "web"} for part in path.parts)
    ]
    glb_path = root / "web" / "model.glb"
    gltf = glb_json(glb_path)
    glb_scene = trimesh.load(glb_path, force="scene", process=False)
    glb_bounds = np.asarray(glb_scene.bounds).round(9).tolist()
    glb_lengths = (np.asarray(glb_scene.bounds)[1] - np.asarray(glb_scene.bounds)[0]).round(9)
    recorded_bbox = validation["compoundBboxMm"]
    expected_web_lengths = np.asarray(
        [recorded_bbox["xlen"], recorded_bbox["zlen"], recorded_bbox["ylen"]], dtype=float
    ) / 1000.0
    gltf_text = json.dumps(gltf, sort_keys=True).lower()
    forbidden = {
        validation["taxonomyIdPrivateBuildMetadata"].lower(),
        "adjustable wrench",
        "pipe wrench",
        "cup plunger",
        "flange plunger",
    }
    glb_hits = sorted(term for term in forbidden if term in gltf_text)

    render_metrics = {
        path.relative_to(root).as_posix(): image_metrics(path)
        for path in sorted((root / "renders").glob("*.png"))
    }
    svg_scan = {}
    for path in sorted((root / "renders").glob("*.svg")):
        text = path.read_text(encoding="utf-8")
        lowered = text.lower()
        svg_scan[path.relative_to(root).as_posix()] = {
            "bytes": path.stat().st_size,
            "hiddenLineColorPresent": 'stroke="#ffffff"' in lowered,
            "forbiddenHits": sorted(term for term in forbidden if term in lowered),
        }

    return {
        "assetId": asset_id,
        "parameters": parameters,
        "sourceRecord": source_record,
        "recordedValidation": {
            "compoundBrepValid": validation["compoundBrepValid"],
            "compoundBboxMm": validation["compoundBboxMm"],
            "expected": validation["expected"],
            "checks": validation["checks"],
            "pairwiseIntersections": validation["pairwiseIntersections"],
            "expectedFieldsWithoutIndependentAssertion": sorted(
                set(validation["expected"]) - {"partCount", "allowedIntersectionPairs"}
            ),
        },
        "sourceModel": source_model,
        "stepReimport": {
            "valid": bool(imported.isValid()),
            "bboxMm": imported_bbox,
            "recordedBboxMaxAbsDeltaMm": bbox_delta(imported_bbox, validation["compoundBboxMm"]),
            "solidCount": len(imported.Solids()),
            "volumeMm3": round(abs(float(imported.Volume())), 6),
        },
        "reviewMesh": mesh_metrics(root / "master" / "review-mesh.stl"),
        "partMeshes": {
            path.name: mesh_metrics(path)
            for path in sorted((root / "mesh-parts").glob("*.stl"))
        },
        "glb": {
            "assetVersion": gltf.get("asset", {}).get("version"),
            "generator": gltf.get("asset", {}).get("generator"),
            "nodeNames": [node.get("name") for node in gltf.get("nodes", [])],
            "meshNames": [mesh.get("name") for mesh in gltf.get("meshes", [])],
            "materialNames": [material.get("name") for material in gltf.get("materials", [])],
            "cameraCount": len(gltf.get("cameras", [])),
            "sceneBoundsM": glb_bounds,
            "sceneLengthsM": glb_lengths.tolist(),
            "expectedTransformedLengthsM": expected_web_lengths.round(9).tolist(),
            "transformedLengthMaxAbsDeltaM": round(
                float(np.max(np.abs(glb_lengths - expected_web_lengths))), 9
            ),
            "topLevelExtras": gltf.get("extras"),
            "allExtrasPaths": extras_paths(gltf),
            "forbiddenHits": glb_hits,
            "neutral": not glb_hits,
        },
        "renders": render_metrics,
        "svgScan": svg_scan,
        "deliveryFileNames": [path.relative_to(root).as_posix() for path in sorted(delivery_files)],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--archive", required=True, type=Path)
    parser.add_argument("--bundle-root", required=True, type=Path)
    parser.add_argument("--historical-build", required=True, type=Path)
    parser.add_argument("--rerun-a", required=True, type=Path)
    parser.add_argument("--rerun-b", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    with zipfile.ZipFile(args.archive) as archive:
        archive_bad_members = archive.testzip()
        archive_members = [member for member in archive.infolist() if not member.is_dir()]

    runtime = {
        "platform": platform.platform(),
        "python": platform.python_version(),
        "cadquery": cq.__version__,
        "OCP": OCP.__version__,
        "trimesh": trimesh.__version__,
        "numpy": np.__version__,
        "scipy": scipy.__version__,
        "Pillow": Image.__version__,
        "CairoSVG": cairosvg.__version__,
    }

    result = {
        "archive": {
            "path": str(args.archive),
            "bytes": args.archive.stat().st_size,
            "sha256": sha256(args.archive),
            "fileCount": len(archive_members),
            "uncompressedBytes": sum(member.file_size for member in archive_members),
            "zipTestBadMember": archive_bad_members,
        },
        "runtimeObserved": runtime,
        "generatedBuildEnvironmentReceipt": json.loads(
            (args.rerun_a / "build-environment.json").read_text(encoding="ascii")
        ),
        "topLevelHashes": {
            path.name: sha256(path)
            for path in sorted(args.bundle_root.iterdir())
            if path.is_file()
        },
        "historicalManifest": verify_checksum_manifest(args.historical_build),
        "rerunAManifest": verify_checksum_manifest(args.rerun_a),
        "rerunBManifest": verify_checksum_manifest(args.rerun_b),
        "rerunAToB": compare(args.rerun_a, args.rerun_b),
        "historicalToRerunA": compare(args.historical_build, args.rerun_a),
        "assets": [],
    }
    source_models = load_source_models(args.bundle_root)
    result["assets"] = [
        audit_asset(args.rerun_a, asset_id, source_models[asset_id]) for asset_id in ASSET_IDS
    ]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="ascii", newline="\n")


if __name__ == "__main__":
    main()
