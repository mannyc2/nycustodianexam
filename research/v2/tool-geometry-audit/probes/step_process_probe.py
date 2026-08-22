from __future__ import annotations

import argparse
from pathlib import Path

import cadquery as cq


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export one fixed 10 x 20 x 30 mm STEP box in a fresh process."
    )
    parser.add_argument("output", type=Path)
    return parser.parse_args()


def main() -> None:
    output = parse_args().output
    output.parent.mkdir(parents=True, exist_ok=True)
    cq.exporters.export(
        cq.Workplane("XY").box(10.0, 20.0, 30.0),
        str(output),
    )


if __name__ == "__main__":
    main()
