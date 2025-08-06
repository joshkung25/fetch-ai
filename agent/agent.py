from agent.embedder import embed_text
from agent.retriever import get_collection

DOCS_ASSISTANT_PROMPT = """You are a document recall assistant.
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. """

APP_INFO_PROMPT = ""

SUGGESTED_TAGS_PROMPT = """I will give you a document title. Return a list of maximum 5 suggested tags to best categorize the document into a general category.
Your response should be a list of tags, separated by commas, nothing else. No uppercase letters, each tag should be a single word.
Document title:
"""


def model_recall_response(user_input: str, user_id: str, is_guest: bool):
    """Fetches relevant information from the vector database, and then uses that information in the prompt for the model.
    Returns the prompt for the model to use."""

    # embed the input
    embedded_input = embed_text(user_input)

    # find and extract info
    # can change so it checks for multiple results, and then includes all of the relevant ones in the response
    results = get_collection(user_id, is_guest).query(
        query_embeddings=[embedded_input],
        n_results=3,
        include=["documents", "distances", "metadatas"],
    )
    print(results["distances"][0])
    # check if relevant information found, change to check for multiple results

    results_input = ""
    for i in range(len(results["distances"][0])):
        if results["distances"][0][i] < 1.95:
            results_input += results["documents"][0][i] + "\n"

    if results_input != "":
        RAG_ASSISTANT_PROMPT = (
            "There was information found about the user, use the relevant information in your response: "
            + results_input
            + " This was the user's input: "
            + user_input
        )
    else:
        RAG_ASSISTANT_PROMPT = (
            "There was no relevant information found, tell them to make sure they upload relevant documents. Then use your general knowledge to respond. "
            + "This was the user's input: "
            + user_input
        )
    if results["distances"][0][0] < 1.55:
        source_document_title = results["metadatas"][0][0]["title"]
    else:
        source_document_title = ""

    return RAG_ASSISTANT_PROMPT, source_document_title


def suggested_tags_prompt(document_title: str):
    """
    Takes in a document title and returns a list of suggested tags.
    """
    return SUGGESTED_TAGS_PROMPT + document_title
