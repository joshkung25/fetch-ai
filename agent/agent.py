from agent.embedder import embed_text
from agent.retriever import query_collection

DOCS_ASSISTANT_PROMPT = """You are a document recall assistant.
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. """

def model_recall_response(user_input: str):
    embedded_input = embed_text(user_input)
    results = query_collection(embedded_input, n_results=1)
    print(results)

    if results["distances"][0][0] > 0.8:
        RAG_ASSISTANT_PROMPT = (
            "There was relevant information found about the user, use this information in your response: "
            + results["documents"][0][0]
            + " This was the user's input: "
            + user_input
        )
    else:
        RAG_ASSISTANT_PROMPT = (
            "There was no relevant information found, tell them to make sure they upload relevant documents. Then use your general knowledge to respond. "
            + "This was the user's input: "
            + user_input
        )

    return DOCS_ASSISTANT_PROMPT + RAG_ASSISTANT_PROMPT
