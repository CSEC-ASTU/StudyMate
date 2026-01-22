import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe a short audio chunk (2–5 seconds)
 * @param {Buffer} audioBuffer - raw audio data from frontend
 * @param {string} mimeType - audio mime type (e.g. audio/webm, audio/wav)
 * @returns {Promise<string>} transcribed text
 */
export async function transcribeAudioChunk(audioBuffer, mimeType) {
  // 1. Save chunk temporarily (Whisper expects a file)
  const tempFilePath = path.join(
    process.cwd(),
    "tmp",
    `chunk-${Date.now()}.webm`
  );

  fs.writeFileSync(tempFilePath, audioBuffer);

  try {
    // 2. Send to Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "gpt-4o-transcribe", // or "whisper-1" if enabled
    });

    // 3. Return incremental text
    return transcription.text || "";
  } finally {
    // 4. Cleanup temp file
    fs.unlinkSync(tempFilePath);
  }
}
