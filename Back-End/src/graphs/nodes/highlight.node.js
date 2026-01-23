import { runLLM } from "../../services/llm.service.js";

export async function highlightNode(state) {
    const highlights = await runLLM({
        model: "qwen",
        prompt: `Extract key concepts from this lecture:\n${state.text}`
    });

    return { ...state, highlights };
}
