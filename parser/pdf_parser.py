import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import tiktoken


def tokenize_and_chunk(
    text, max_tokens=400, overlap=50, model_name="text-embedding-3-small"
):
    tokenizer = tiktoken.encoding_for_model(model_name)
    tokens = tokenizer.encode(text)

    chunks = []
    start = 0
    while start < len(tokens):
        end = start + max_tokens
        chunk_tokens = tokens[start:end]
        chunk_text = tokenizer.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += max_tokens - overlap

    return chunks


def ocr_pdf(filepath: str):
    images = convert_from_path(filepath, dpi=300)
    all_chunks = []

    for i, img in enumerate(images):
        print(f"OCR'ing page {i + 1}")
        text = pytesseract.image_to_string(img, lang="eng")
        page_chunks = tokenize_and_chunk(text)

        for j, chunk in enumerate(page_chunks):
            all_chunks.append(
                {
                    "text": chunk,
                    "page": i + 1,
                    "chunk_index": j,
                    "source_file": filepath,
                    "doc_type": "ocr",
                }
            )

    return all_chunks


def parse_pdf(filepath, doc_type=None):
    doc = fitz.open(filepath)
    sample_text = get_sample_text(doc)

    if len(sample_text.strip()) < 20:
        print("OCR fallback triggered.")
        return ocr_pdf(filepath)

    print("Token-based parsing triggered.")
    all_chunks = []
    for page_number, page in enumerate(doc):
        full_text = page.get_text()
        page_chunks = tokenize_and_chunk(full_text)

        for i, chunk in enumerate(page_chunks):
            all_chunks.append(
                {
                    "text": chunk,
                    "page": page_number + 1,
                    "chunk_index": i,
                    "source_file": filepath,
                    "doc_type": doc_type,
                }
            )

    return all_chunks


def get_sample_text(doc):
    sample = ""
    for i in range(min(len(doc), 3)):
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


# def parse_pdf(filepath):
#     """
#     Parse the PDF. Handles text-based PDFs and scanned PDFs.
#     """
#     doc = fitz.open(filepath)
#     sample_text = get_sample_text(doc)
#     # print(sample_text)
#     splitter = "\n"
#     if len(sample_text) < 20:
#         print("OCR true")
#         return ocr_pdf(filepath)
#     else:
#         return parse_pdf_v1(filepath, splitter)


# def parse_pdf_v1(filepath, splitter):
#     """
#     Parse the PDF based on the splitter.
#     """
#     print(f"Parsing PDF with splitter: {repr(splitter)}")
#     doc = fitz.open(filepath)
#     chunks = []
#     for page in doc:
#         text = page.get_text()
#         # print(repr(text))
#         # Split by every 12th occurrence instead of every occurrence
#         sections = split_by_nth_occurrence(text, splitter, 16)

#         for section in sections:
#             if section.strip():
#                 chunks.append(section)
#     # print(chunks)
#     return chunks  # List of strings, one per page


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
