import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables first

const token = String(process.env.HF_TOKEN);

const client = new InferenceClient(token); // Pass token directly as string

export async function embedText(text) {
    return await client.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
    });
}