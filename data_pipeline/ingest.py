"""Helpers for converting uploaded documents into normalized text outputs.

The functions in this module are intentionally simple and work with standard
Python packages so that non-experts can run them without much setup.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

import pandas as pd
import pdfplumber
from docx import Document

PROCESSED_DIR = Path("data/processed")


def ensure_processed_dir(path: Path = PROCESSED_DIR) -> Path:
    """Ensure the processed data directory exists and return it."""

    path.mkdir(parents=True, exist_ok=True)
    return path


def normalize_text(chunks: Iterable[str]) -> str:
    """Join text chunks and normalize whitespace for consistency."""

    combined = "\n\n".join(chunk.strip() for chunk in chunks if chunk)
    return "\n".join(line.rstrip() for line in combined.splitlines())


def save_text(content: str, source_file: Path, output_dir: Path | None = None) -> Path:
    """Write ``content`` to ``output_dir`` using the source filename with ``.txt``."""

    output_dir = ensure_processed_dir(output_dir or PROCESSED_DIR)
    output_path = output_dir / (source_file.stem + ".txt")
    output_path.write_text(content, encoding="utf-8")
    return output_path


def ingest_word(doc_path: Path, output_dir: Path | None = None) -> Path:
    """Convert a Word document into a normalized text file."""

    document = Document(doc_path)
    paragraphs = [para.text for para in document.paragraphs]
    content = normalize_text(paragraphs)
    return save_text(content, doc_path, output_dir)


def ingest_pdf(pdf_path: Path, output_dir: Path | None = None) -> Path:
    """Convert a PDF document into a normalized text file."""

    pages: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            pages.append(text)
    content = normalize_text(pages)
    return save_text(content, pdf_path, output_dir)


def ingest_excel(excel_path: Path, output_dir: Path | None = None) -> Path:
    """Convert an Excel workbook into a normalized text file."""

    workbook = pd.read_excel(excel_path, sheet_name=None, dtype=str)
    sheets = []
    for sheet_name, df in workbook.items():
        # Replace NaN with empty strings and convert rows to JSON for readability.
        cleaned = df.fillna("")
        rows = cleaned.to_dict(orient="records")
        sheet_lines = [f"Sheet: {sheet_name}"]
        sheet_lines.extend(json.dumps(row, ensure_ascii=False) for row in rows)
        sheets.append("\n".join(sheet_lines))
    content = normalize_text(sheets)
    return save_text(content, excel_path, output_dir)


FILE_HANDLERS = {
    ".doc": ingest_word,
    ".docx": ingest_word,
    ".pdf": ingest_pdf,
    ".xls": ingest_excel,
    ".xlsx": ingest_excel,
}


def ingest_file(file_path: Path, output_dir: Path | None = None) -> Path:
    """Dispatch to the appropriate ingestion function based on file suffix."""

    handler = FILE_HANDLERS.get(file_path.suffix.lower())
    if handler is None:
        supported = ", ".join(sorted(FILE_HANDLERS))
        raise ValueError(f"Unsupported file type: {file_path.suffix}. Supported: {supported}")
    return handler(file_path, output_dir)


__all__ = [
    "ingest_excel",
    "ingest_file",
    "ingest_pdf",
    "ingest_word",
    "normalize_text",
    "save_text",
]
