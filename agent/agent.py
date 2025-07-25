from agent.embedder import embed_text
from agent.retriever import get_collection

DOCS_ASSISTANT_PROMPT = """You are a document recall assistant.
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. """

APP_INFO_PROMPT = ""


def model_recall_response(user_input: str, user_id: str):
    """Fetches relevant information from the vector database, and then uses that information in the prompt for the model.
    Returns the prompt for the model to use."""

    # embed the input
    embedded_input = embed_text(user_input)

    # find and extract info
    # can change so it checks for multiple results, and then includes all of the relevant ones in the response
    results = get_collection(user_id).query(
        query_embeddings=[embedded_input],
        n_results=3,
        include=["documents", "distances"],
    )
    print(results)
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

    return RAG_ASSISTANT_PROMPT
