from pathlib import Path

from pypdf import PdfReader


def parse_pdf_pages(file_path: str) -> list[dict]:
    pdf_path = Path(file_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    reader = PdfReader(str(pdf_path))
    parsed_pages: list[dict] = []

    for index, page in enumerate(reader.pages, start=1):
        text = ""

        try:
            text = page.extract_text(extraction_mode="layout") or ""
        except TypeError:
            text = page.extract_text() or ""
        except Exception:
            text = page.extract_text() or ""

        parsed_pages.append(
            {
                "page_number": index,
                "extracted_text": text.strip(),
            }
        )

    return parsed_pages