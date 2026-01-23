import { searchWeb } from "../../services/googleSearch.service.js";

export async function googleSearchNode(state) {
    const results = await searchWeb(state.question);
    return { ...state, externalContext: results };
}
