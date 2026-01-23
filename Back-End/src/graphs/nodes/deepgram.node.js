import { transcribeAudio } from "../../services/deepgram.service.js";

export async function deepgramNode(state) {
    const text = await transcribeAudio(state.audioBuffer);
    return { ...state, text };
}
