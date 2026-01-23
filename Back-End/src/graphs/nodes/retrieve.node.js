import { retrieveContext } from "../../services/rag/retrieval.service.js";

export async function retrieveNode(state) {
    const ragContext = await retrieveContext({ question: state.question });
    return { ...state, ragContext };
}
