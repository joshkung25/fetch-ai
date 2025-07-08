import fitz  # PyMuPDF


def parse_pdf(filepath):
    doc = fitz.open(filepath)
    chunks = []
    for page in doc:
        text = page.get_text()

        sections = text.split("\n")

        for section in sections:
            if section.strip():
                chunks.append(section)

    # print(chunks)
    return chunks  # List of strings, one per page


parsed_pdf = parse_pdf("public/Josh_Kung_Resume_2025_v4.pdf")
# print(parsed_pdf)
