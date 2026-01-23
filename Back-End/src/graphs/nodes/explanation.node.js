import { runLLM } from "../../services/llm.service.js";

export async function explanationNode(state) {
    const answer = await runLLM({
        model: "qwen",
        context: state.ragContext,
        prompt: `Explain clearly:\n${state.question}`
    });

    return { ...state, answer };
}
