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


# def determine_splitter(text):
#     """
#     Determine the splitter for the PDF.
#     """
#     if "\n20\n" in text:
#         return "\n20\n"
#     if "\xa0\n\xa0\n\xa0\n" in text:
#         return "\xa0\n\xa0\n\xa0\n"
#     elif "\n" in text:
#         return "\n"
#     else:
#         raise ValueError("Unknown PDF format")


# ================================
# ================================


def parse_pdf(filepath):
    """
    Parse the PDF. Handles text-based PDFs and scanned PDFs.
    """
    doc = fitz.open(filepath)
    sample_text = get_sample_text(doc)
    # print(sample_text)
    splitter = "\n"
    if len(sample_text) < 20:
        print("OCR true")
        return ocr_pdf(filepath)
    else:
        return parse_pdf_v1(filepath, splitter)


def parse_pdf_v1(filepath, splitter):
    """
    Parse the PDF based on the splitter.
    """
    print(f"Parsing PDF with splitter: {repr(splitter)}")
    doc = fitz.open(filepath)
    chunks = []
    for page in doc:
        text = page.get_text()
        # print(repr(text))
        # Split by every 12th occurrence instead of every occurrence
        sections = split_by_nth_occurrence(text, splitter, 16)

        for section in sections:
            if section.strip():
                chunks.append(section)
    # print(chunks)
    return chunks  # List of strings, one per page


def split_by_nth_occurrence(text, splitter, n=12):
    """
    Split text by every nth occurrence of the splitter.
    """
    parts = text.split(splitter)
    result = []
    current_chunk = []

    for i, part in enumerate(parts):
        current_chunk.append(part)
        if (i + 1) % n == 0:  # Every nth occurrence
            result.append(splitter.join(current_chunk))
            current_chunk = []

    # Add any remaining parts
    if current_chunk:
        result.append(splitter.join(current_chunk))

    return result


# parse_pdf("public/Josh_Kung_Resume_2025_v4.pdf")
# parse_pdf("public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf")
# print(parse_pdf("public/acesstatscw.pdf"))
parse_pdf("public/Jacob_Transcript_Test.pdf")
# print(parse_pdf("public/alec_hw_test.pdf"))
# 20\n2020-2021\n1\n9\nAB3010\nAlgebra II H\n\xa0\nP\nH\nA\n5.00\n5.00\n\xa0\n
# 200\n2020-2021\n4\n9\nLC1010\nHealth\n\xa0\n\xa0\n\xa0\nA\n5.00\n5.00\n\xa0\n
