import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// You can change this model if you want
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

export async function runLLM(prompt) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // HuggingFace usually returns an array
    return response.data[0].generated_text;

  } catch (error) {
    console.error("LLM Error:", error.response?.data || error.message);
    throw new Error("Failed to run LLM");
  }
}
