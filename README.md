# AI Data Pipeline Utilities

This repository contains small helper scripts that make it easy to prepare a
local ``data/`` workspace and ingest uploaded office documents into plain text
files. The scripts are intentionally lightweight so that they work for novice
users on most Python installations.

## Requirements

The ingestion helpers rely on a few third-party libraries:

- ``python-docx`` for Microsoft Word files
- ``pdfplumber`` for PDF documents
- ``pandas`` (and ``openpyxl``) for Excel spreadsheets

You can install them with pip:

```bash
pip install python-docx pdfplumber pandas openpyxl
```

## Preparing the workspace

Use the ``setup_workspace`` script to create the canonical ``data/raw`` and
``data/processed`` folders. The ``--source`` flag lets you copy a directory of
uploaded files straight into ``data/raw``.

```bash
# Create folders inside the current directory
python -m data_pipeline.setup_workspace

# Create folders in a custom location and copy uploads into data/raw
python -m data_pipeline.setup_workspace --base-dir /path/to/project --source /path/to/uploads
```

## Ingesting documents

After your files are in ``data/raw`` you can convert them to normalized text
under ``data/processed``. The ``ingest`` module exposes helper functions that
can be used in an interactive Python session or within other scripts.

```python
from pathlib import Path
from data_pipeline.ingest import ingest_file

raw_file = Path("data/raw/example.pdf")
output_path = ingest_file(raw_file)
print(f"Processed text saved to {output_path}")
```

You can also call the format-specific helpers directly if you need more control:

```python
from pathlib import Path
from data_pipeline.ingest import ingest_excel, ingest_pdf, ingest_word

word_path = Path("data/raw/report.docx")
pdf_path = Path("data/raw/brochure.pdf")
excel_path = Path("data/raw/results.xlsx")

for path, helper in [
    (word_path, ingest_word),
    (pdf_path, ingest_pdf),
    (excel_path, ingest_excel),
]:
    processed = helper(path)
    print(f"Converted {path.name} -> {processed}")
```

The resulting ``.txt`` files in ``data/processed`` contain normalized Unicode
text that is ready for downstream analysis or indexing.
