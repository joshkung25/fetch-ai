"""Document taxonomy shared by the labeler (ingest time) and the query parser (query time).

Both sides MUST use the same label vocabulary, otherwise "give me all my recipes" can't be
mapped onto documents that were labeled at upload. The labeler picks exactly one DocType per
document; Category is derived deterministically from DocType so the two never disagree.

Two levels so queries can target either granularity:
  "all my prescriptions"  -> doc_type = prescription
  "all my medical stuff"  -> category = medical
"""

from enum import StrEnum


class Category(StrEnum):
    MEDICAL = "medical"
    INSURANCE = "insurance"
    FINANCIAL = "financial"
    LEGAL = "legal"
    EDUCATION = "education"
    WORK = "work"
    PERSONAL = "personal"
    OTHER = "other"


class DocType(StrEnum):
    # medical
    PRESCRIPTION = "prescription"
    MEDICAL_RECORD = "medical_record"
    LAB_RESULT = "lab_result"
    VACCINATION_RECORD = "vaccination_record"
    # insurance
    INSURANCE_POLICY = "insurance_policy"
    INSURANCE_CARD = "insurance_card"
    INSURANCE_CLAIM = "insurance_claim"
    # financial
    BANK_STATEMENT = "bank_statement"
    TAX_DOCUMENT = "tax_document"
    RECEIPT = "receipt"
    BILL = "bill"
    PAY_STUB = "pay_stub"
    # legal
    LEASE = "lease"
    CONTRACT = "contract"
    # education
    TRANSCRIPT = "transcript"
    CERTIFICATE = "certificate"
    COURSEWORK = "coursework"
    # work
    RESUME = "resume"
    OFFER_LETTER = "offer_letter"
    # personal
    RECIPE = "recipe"
    ID_DOCUMENT = "id_document"
    TRAVEL_DOCUMENT = "travel_document"
    MANUAL_OR_WARRANTY = "manual_or_warranty"
    LETTER = "letter"
    # fallback
    OTHER = "other"


# DocType -> (Category, short description shown to the LLM in both labeler and parser prompts)
DOC_TYPES: dict[DocType, tuple[Category, str]] = {
    DocType.PRESCRIPTION: (Category.MEDICAL, "prescription or medication instructions"),
    DocType.MEDICAL_RECORD: (Category.MEDICAL, "visit summary, diagnosis, doctor's notes, discharge papers"),
    DocType.LAB_RESULT: (Category.MEDICAL, "blood work, test or imaging results"),
    DocType.VACCINATION_RECORD: (Category.MEDICAL, "immunization history or vaccine card"),
    DocType.INSURANCE_POLICY: (Category.INSURANCE, "policy document, coverage summary, plan details"),
    DocType.INSURANCE_CARD: (Category.INSURANCE, "member/insurance ID card"),
    DocType.INSURANCE_CLAIM: (Category.INSURANCE, "claim, explanation of benefits (EOB)"),
    DocType.BANK_STATEMENT: (Category.FINANCIAL, "bank, credit card or brokerage statement"),
    DocType.TAX_DOCUMENT: (Category.FINANCIAL, "W-2, 1099, tax return, tax notice"),
    DocType.RECEIPT: (Category.FINANCIAL, "proof of purchase"),
    DocType.BILL: (Category.FINANCIAL, "invoice or bill that is owed (utilities, phone, medical bill)"),
    DocType.PAY_STUB: (Category.FINANCIAL, "pay stub or earnings statement"),
    DocType.LEASE: (Category.LEGAL, "rental or lease agreement"),
    DocType.CONTRACT: (Category.LEGAL, "any other signed agreement or legal document"),
    DocType.TRANSCRIPT: (Category.EDUCATION, "academic transcript or grade report"),
    DocType.CERTIFICATE: (Category.EDUCATION, "diploma, certificate, award"),
    DocType.COURSEWORK: (Category.EDUCATION, "homework, notes, syllabus, exam, paper"),
    DocType.RESUME: (Category.WORK, "resume or CV"),
    DocType.OFFER_LETTER: (Category.WORK, "job offer, employment letter"),
    DocType.RECIPE: (Category.PERSONAL, "cooking or baking recipe"),
    DocType.ID_DOCUMENT: (Category.PERSONAL, "passport, driver's license, birth certificate"),
    DocType.TRAVEL_DOCUMENT: (Category.PERSONAL, "itinerary, boarding pass, booking confirmation"),
    DocType.MANUAL_OR_WARRANTY: (Category.PERSONAL, "product manual or warranty"),
    DocType.LETTER: (Category.PERSONAL, "general correspondence"),
    DocType.OTHER: (Category.OTHER, "none of the above"),
}

assert set(DOC_TYPES) == set(DocType), "every DocType needs a taxonomy entry"


def category_of(doc_type: DocType) -> Category:
    return DOC_TYPES[doc_type][0]


def doc_types_in(category: Category) -> list[DocType]:
    return [dt for dt, (cat, _) in DOC_TYPES.items() if cat == category]


def taxonomy_prompt_block() -> str:
    """Render the taxonomy for inclusion in LLM prompts (labeler + query parser)."""
    lines = []
    for category in Category:
        types = doc_types_in(category)
        lines.append(f"{category.value}:")
        lines.extend(f"  - {dt.value}: {DOC_TYPES[dt][1]}" for dt in types)
    return "\n".join(lines)
