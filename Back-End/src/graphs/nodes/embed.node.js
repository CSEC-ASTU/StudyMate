import { ingestText } from "../../services/rag/ingestion.service.js";

export async function embedNode(state) {
    await ingestText({ text: state.text });
    return state;
}
