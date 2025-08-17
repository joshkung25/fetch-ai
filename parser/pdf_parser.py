import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import tiktoken
import asyncio


async def tokenize_and_chunk(
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


async def ocr_pdf(filepath: str):
    images = convert_from_path(filepath, dpi=300)
    all_chunks = []

    for i, img in enumerate(images):
        print(f"OCR'ing page {i + 1}")
        text = await asyncio.to_thread(pytesseract.image_to_string, img, lang="eng")

        page_chunks = await tokenize_and_chunk(text)

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


async def parse_pdf(filepath, doc_type=None):
    doc = fitz.open(filepath)
    sample_text = get_sample_text(doc)

    if len(sample_text.strip()) < 20:
        print("OCR fallback triggered.")
        return await ocr_pdf(filepath)

    print("Token-based parsing triggered.")
    all_chunks = []
    for page_number, page in enumerate(doc):
        full_text = page.get_text()
        page_chunks = await tokenize_and_chunk(full_text)

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


# parse_pdf("public/Josh_Kung_Resume_2025_v4.pdf")
# parse_pdf("public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf")
# parse_pdf("public/Jacob_Transcript_Test.pdf")
# print(parse_pdf("public/alec_hw_test.pdf"))
# parse_pdf("public/university_health_report.pdf")
# parse_pdf("public/insurance.pdf")

# 20\n2020-2021\n1\n9\nAB3010\nAlgebra II H\n\xa0\nP\nH\nA\n5.00\n5.00\n\xa0\n
# 200\n2020-2021\n4\n9\nLC1010\nHealth\n\xa0\n\xa0\n\xa0\nA\n5.00\n5.00\n\xa0\n
