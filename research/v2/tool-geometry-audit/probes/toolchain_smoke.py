from __future__ import annotations

import argparse
import hashlib
import json
import platform
import re
from importlib import metadata
from pathlib import Path

import OCP
import cadquery as cq
import numpy as np
import trimesh


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def package_version(name: str) -> str:
    try:
        return metadata.version(name)
    except metadata.PackageNotFoundError:
        return "not-installed"


def normalize_step_text(text: str) -> str:
    """Normalize only volatility observed in this audit environment."""
    text = re.sub(
        r"FILE_NAME\('Open CASCADE Shape Model','[^']+'",
        "FILE_NAME('Open CASCADE Shape Model','<timestamp>'",
        text,
    )
    return re.sub(
        r"Open CASCADE STEP translator 7\.9 \d+",
        "Open CASCADE STEP translator 7.9 <counter>",
        text,
    )


def normalized_step_sha256(path: Path) -> str:
    normalized = normalize_step_text(path.read_text(encoding="ascii"))
    return hashlib.sha256(normalized.encode("ascii")).hexdigest()


def build(out_dir: Path, result_root: Path) -> dict[str, object]:
    out_dir.mkdir(parents=True, exist_ok=True)
    solid = cq.Workplane("XY").box(10.0, 20.0, 30.0)
    step_path = out_dir / "box.step"
    stl_path = out_dir / "box.stl"
    cq.exporters.export(solid, str(step_path))
    cq.exporters.export(solid, str(stl_path))

    reimported = cq.importers.importStep(str(step_path))
    bbox = reimported.val().BoundingBox()
    mesh = trimesh.load_mesh(stl_path, force="mesh")
    finite_vertices = bool(mesh.vertices.size and np.isfinite(mesh.vertices).all())

    def relative(path: Path) -> str:
        return path.relative_to(result_root).as_posix()

    return {
        "step": {
            "path": relative(step_path),
            "size_bytes": step_path.stat().st_size,
            "sha256": sha256(step_path),
            "normalized_sha256": normalized_step_sha256(step_path),
        },
        "stl": {
            "path": relative(stl_path),
            "size_bytes": stl_path.stat().st_size,
            "sha256": sha256(stl_path),
            "watertight": bool(mesh.is_watertight),
            "finite_vertices": finite_vertices,
        },
        "reimport_bounds_mm": {
            "x": bbox.xlen,
            "y": bbox.ylen,
            "z": bbox.zlen,
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generic CadQuery/OCCT determinism smoke probe; not a POC rebuild."
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("raw-results"),
        help="Output directory (default: raw-results)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = args.out.resolve()
    root.mkdir(parents=True, exist_ok=True)
    build_a = build(root / "smoke-a", root)
    build_b = build(root / "smoke-b", root)
    result = {
        "probe_scope": "generic CadQuery/OCCT environment smoke only; not a POC rebuild",
        "environment": {
            "os": platform.platform(),
            "architecture": platform.machine(),
            "python": platform.python_version(),
            "cadquery": package_version("cadquery"),
            "cadquery-ocp": package_version("cadquery-ocp"),
            "ocp_module": getattr(OCP, "__version__", "unknown"),
            "trimesh": package_version("trimesh"),
            "numpy": package_version("numpy"),
            "pillow": package_version("Pillow"),
        },
        "build_a": build_a,
        "build_b": build_b,
        "comparison": {
            "step_hash_match": build_a["step"]["sha256"]
            == build_b["step"]["sha256"],
            "normalized_step_hash_match": build_a["step"]["normalized_sha256"]
            == build_b["step"]["normalized_sha256"],
            "stl_hash_match": build_a["stl"]["sha256"]
            == build_b["stl"]["sha256"],
        },
    }
    out = root / "toolchain-smoke.json"
    serialized = json.dumps(result, indent=2, sort_keys=True) + "\n"
    out.write_text(serialized, encoding="ascii")
    print(serialized, end="")


if __name__ == "__main__":
    main()
