import { transcribeAudioChunk } from "../services/deepgramtranscription.service.js";
import { ingestLectureChunk } from "../services/rag/ingestStream.service.js";

export async function handleLiveLectureAudio(req, res) {
  try {
    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    const text = await transcribeAudioChunk(audioBuffer, mimeType);

    if (!text || !text.trim()) {
      return res.json({ status: "empty" });
    }

    const result = await ingestLectureChunk({
      text,
      metadata: {
        lecture_id: req.body.lecture_id,
        course_id: req.body.course_id,
      },
    });

    res.json({
      transcript: text,
      ingestion: result.status,
    });
  } catch (error) {
    console.error("Live lecture error:", error);
    res.status(500).json({ error: "Live lecture failed" });
  }
}
