import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";
dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

/**
 * Transcribe a short audio chunk (2–5 seconds)
 * @param {Buffer} audioBuffer - raw audio data from frontend
 * @param {string} mimeType - audio mime type (e.g. audio/webm, audio/wav)
 * @returns {Promise<string>} transcribed text
 */
export async function transcribeAudioChunk(audioBuffer, mimeType) {
  try {
    const response = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",        // best general-purpose model
        smart_format: true,     // punctuation & formatting
        punctuate: true,
        language: "en",         // or auto-detect
      }
    );
    
    const transcript = response.result?.results?.channels?.[0]?.alternatives?.[0]?.transcript;


    return transcript || "";
  } catch (error) {
    console.error("Deepgram transcription error:", error);
    throw error;
  }
}
