# import spacy

# nlp = spacy.load("en_core_web_sm")


# def split_by_pattern(text, pattern):
#     """
#     Split the text into a list of chunks by the pattern.
#     """
#     lines = text.strip().splitlines()


# def get_signature(chunk):
#     sig = []
#     for line in chunk:
#         doc = nlp(line.strip())
#         sig.append(" ".join([t.pos_ for t in doc]))
#     return sig


# def find_most_common_pattern(text):
#     """
#     Find the most common pattern in the text.
#     """
#     return max(set(text), key=text.count)
