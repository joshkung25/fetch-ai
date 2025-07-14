import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import tiktoken


def tokenize_and_chunk(text, max_tokens=400, overlap=50, model_name="text-embedding-3-small"):
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
            all_chunks.append({
                "text": chunk,
                "page": i + 1,
                "chunk_index": j,
                "source_file": filepath,
                "doc_type": "ocr"
            })

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
            all_chunks.append({
                "text": chunk,
                "page": page_number + 1,
                "chunk_index": i,
                "source_file": filepath,
                "doc_type": doc_type
            })

    return all_chunks


def get_sample_text(doc):
    sample = ""
    for i in range(min(len(doc), 3)):
        sample += doc[i].get_text()
    return sample
