import { ingestText } from "../services/rag/ingestion.service.js";
import { retrieveContext } from "../services/rag/retrieval.service.js";
import { generateAnswer } from "../services/rag/answer.service.js";

export async function ingest(req, res) {
    const { text, metadata } = req.body;
    const count = await ingestText({ text, metadata });
    res.json({ stored_chunks: count });
}

export async function query(req, res) {
    const { question, filters } = req.body;

    const context = await retrieveContext({ question, filters });

    if (!context.length) {
        return res.json({
            answer: "I don’t have enough verified information to answer that.",
        });
    }

    const answer = await generateAnswer({ question, context });
    res.json({ answer });
}
