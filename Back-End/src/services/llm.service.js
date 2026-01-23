import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Initialize HuggingFace client
export const hf = new HfInference(HF_API_KEY);

// Define models for different purposes
const ExplanationsMODEL = "Qwen/Qwen2.5-7B-Instruct";
const SummariesMODEL = "Qwen/Qwen2.5-7B-Instruct";
const ExerciseGenerationMODEL = "meta-llama/Llama-3.1-8B-Instruct";
const ThinkingMODEL = "meta-llama/Llama-3.1-8B-Instruct";

export async function runLLM(prompt, purpose) {
  // Select model based on purpose
  let model;
  switch (purpose) {
    case "explanation":
      model = ExplanationsMODEL;
      break;
    case "summarization":
      model = SummariesMODEL;
      break;
    case "exercise":
      model = ExerciseGenerationMODEL;
      break;
    case "quiz":
      model = ExerciseGenerationMODEL;
      break;
    case "thinking":
      model = ThinkingMODEL;
      break;
    default:
      throw new Error(`Unknown purpose: ${purpose}`);
  }

  try {
    console.log(`Using model: ${model}`, "Selected model: ", model); // Debug log to verify model selection

    // Use HfInference chatCompletion instead of axios
    const res = await hf.chatCompletion({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 1024,
    });
    return res.choices[0].message.content;

  } catch (error) {
    console.error("LLM Error:", error.response?.data || error.message);
    throw new Error("Failed to run LLM");
  }
}
