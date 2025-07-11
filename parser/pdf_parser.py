import fitz  # PyMuPDF

def parse_pdf(filepath):
    doc = fitz.open(filepath)
    chunks = []
    for page in doc:
        text = page.get_text()
        print(repr(text))
        sections = text.split("\n")
        for section in sections:
            if section.strip():
                chunks.append(section)
    return chunks  # List of strings

def parse_pdf_v2(filepath):
    doc = fitz.open(filepath)
    chunks = []
    for page in doc:
        text = page.get_text()
        sections = text.split("\xa0\n\xa0\n\xa0\n")
        for section in sections:
            if section.strip():
                chunks.append(section)
    print(chunks)
    return chunks

# parsed_pdf = parse_pdf("public/Josh_Kung_Resume_2025_v4.pdf")
# parsed_pdf = parse_pdf("public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf")
# print(parse_pdf("public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf"))
# print(parse_pdf("public/acesstatscw.pdf"))
