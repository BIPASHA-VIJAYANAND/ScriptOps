"""
Script Ingestion & Parsing Module
- Accepts PDF / plain text
- Extracts raw text from PDF using PyPDF2
- Splits script into scenes using screenplay heading conventions
"""

import re
from pathlib import Path
from PyPDF2 import PdfReader


# Standard screenplay scene heading pattern
SCENE_HEADING_RE = re.compile(
    r"^(INT\.|EXT\.|INT/EXT\.|INT\.\/EXT\.|I/E\.)\s+.+",
    re.IGNORECASE | re.MULTILINE,
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file given its raw bytes."""
    import io
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages)


def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """Route to PDF or plain-text extraction based on file extension."""
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    # Plain text / .txt / .fountain
    return file_bytes.decode("utf-8", errors="replace")


def split_into_scenes(text: str) -> list[dict]:
    """
    Split raw script text into a list of scene dicts.
    Each scene dict contains:
      - scene_number (int, 1-indexed)
      - heading (str)
      - body (str, full text including heading)
    """
    matches = list(SCENE_HEADING_RE.finditer(text))
    if not matches:
        # If no standard headings found, treat entire text as one scene
        return [{"scene_number": 1, "heading": "FULL SCRIPT", "body": text.strip()}]

    scenes = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        heading = m.group(0).strip()
        body = text[start:end].strip()
        scenes.append({
            "scene_number": i + 1,
            "heading": heading,
            "body": body,
        })
    return scenes
