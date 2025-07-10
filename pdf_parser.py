import fitz  # PyMuPDF

from PIL import Image
import pytesseract
from pdf2image import convert_from_path


def ocr_pdf(filepath: str) -> str:
    """
    Turn the PDF into an image, and then use OCR to extract the text.
    """
    images = convert_from_path(filepath, dpi=300)  # convert PDF to images
    full_text = ""

    for i, img in enumerate(images):
        print(f"OCR'ing page {i + 1}")
        text = pytesseract.image_to_string(img, lang="eng")
        full_text += f"\n--- Page {i + 1} ---\n{text}"

    return full_text


def get_sample_text(doc):
    """
    Get the sample text of the first few pages of the PDF.
    """
    sample = ""
    for i in range(min(len(doc), 3)):  # Check first few pages
        sample += doc[i].get_text()
    return sample


def parse_pdf(filepath):
    """
    Parse the PDF. Handles text-based PDFs and scanned PDFs.
    """
    doc = fitz.open(filepath)
    text = get_sample_text(doc)

    if len(text) < 20:
        print("OCR true")
        return ocr_pdf(filepath)
    if "\xa0\n\xa0\n\xa0\n" in text:
        return parse_pdf_v1(filepath, "\xa0\n\xa0\n\xa0\n")
    elif "\n" in text:
        return parse_pdf_v1(filepath, "\n")
    else:
        raise ValueError("Unknown PDF format")


def parse_pdf_v1(filepath, splitter):
    """
    Parse the PDF based on the splitter.
    """
    # print(f"Parsing PDF with splitter: {splitter}")
    doc = fitz.open(filepath)
    chunks = []
    for page in doc:
        text = page.get_text()
        sections = text.split(splitter)

        for section in sections:
            if section.strip():
                chunks.append(section)

    return chunks  # List of strings, one per page


# print(parse_pdf("public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf"))
# print(parse_pdf("public/acesstatscw.pdf"))
