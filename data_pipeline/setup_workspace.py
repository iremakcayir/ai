"""CLI utilities for preparing the local data workspace.

The script ensures that the canonical ``data/`` directory structure is in
place and optionally copies uploaded documents into ``data/raw`` so they can be
processed by the ingestion helpers.
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Iterable

TARGET_DIRS: tuple[str, ...] = ("data/raw", "data/processed")


def ensure_directories(base_path: Path, targets: Iterable[str] = TARGET_DIRS) -> list[Path]:
    """Create all target directories below ``base_path`` if they do not exist."""

    created_paths: list[Path] = []
    for target in targets:
        dir_path = base_path / target
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            created_paths.append(dir_path)
    return created_paths


def copy_documents(source_dir: Path, destination_dir: Path) -> list[Path]:
    """Copy documents from ``source_dir`` into ``destination_dir``.

    Only top-level files are copied. Sub-directories are ignored to keep the
    layout predictable for new users.
    """

    copied: list[Path] = []
    if not source_dir.exists():
        raise FileNotFoundError(f"Source directory '{source_dir}' does not exist")

    for item in source_dir.iterdir():
        if item.is_file():
            destination = destination_dir / item.name
            shutil.copy2(item, destination)
            copied.append(destination)
    return copied


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare the local data workspace")
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path.cwd(),
        help="Root directory where the data workspace should live",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help="Optional directory containing uploaded documents to copy into data/raw",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    base_dir: Path = args.base_dir.resolve()

    ensure_directories(base_dir)

    if args.source is not None:
        raw_dir = base_dir / "data/raw"
        copy_documents(args.source.resolve(), raw_dir)


if __name__ == "__main__":
    main()
