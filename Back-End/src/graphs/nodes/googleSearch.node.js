import { searchWeb } from "../../services/serper.service.js";

export async function googleSearchNode(state) {
    // Guard: only search if we actually have a question
    if (!state.question) {
        return state;
    }

    try {
        const results = await searchWeb(state.question);

        return {
            ...state,
            externalContext: results,
        };
    } catch (error) {
        console.error("GoogleSearchNode error:", error.message);

        // Fail gracefully — NEVER crash the agent
        return {
            ...state,
            externalContext: [],
        };
    }
}
