import { transcribeAudioChunk } from "../services/deepgramtranscription.service.js";

export async function handleLiveLectureAudio(req, res) {
  try {
    const audioBuffer = req.file.buffer; // from multer
    const mimeType = req.file.mimetype;

    const text = await transcribeAudioChunk(audioBuffer, mimeType);

    res.json({
      success: true,
      transcript: text,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to transcribe audio chunk",
    });
  }
}
