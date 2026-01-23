import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HF_TOKEN);

async function runModel(model, prompt) {
    return await hf.textGeneration({
        model,
        inputs: prompt,
        parameters: {
            temperature: 0.3,
            max_new_tokens: 300,
        },
    });
}

export async function generateAnswer({ question, context }) {
    const prompt = `
You are a factual academic assistant.
Answer ONLY using the provided context.
If the answer is not in the context, say you don't have enough verified information.

Context:
${context.join("\n\n")}

Question:
${question}

Answer:
`;

    try {
        const res = await runModel("Qwen/Qwen2.5-7B-Instruct", prompt);
        return res.generated_text;
    } catch (e) {
        // fallback
        const res = await runModel("meta-llama/Llama-3.1-8B-Instruct", prompt);
        return res.generated_text;
    }
}
