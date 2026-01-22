import { transcribeAudioChunk } from "../services/deepgramtranscription.service.js";
import lectureBufferService from "../services/lectureBuffer.service.js";

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


//additional
export async function handleTextChunk(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "No text provided",
      });
    }

    lectureBufferService.addChunk(text);

    const fullText = lectureBufferService.flushIfReady();

    if (fullText) {
      return res.status(200).json({
        status: "ready",
        fullText,
      });
    }

    return res.status(200).json({
      status: "buffering",
    });
  } catch (error) {
    console.error("Buffering error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process text chunk",
    });
  }
}
