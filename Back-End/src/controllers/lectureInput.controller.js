import { processTranscriptChunk } from "../services/liveLecturePipeline.service.js";
import { transcribeAudioChunk } from "../services/deepgramtranscription.service.js";

export async function handleLiveLectureAudio(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // 1️⃣ Transcribe
    const text = await transcribeAudioChunk(audioBuffer, mimeType);


    if (!text?.trim()) {
      return res.json({ status: "empty" });
    }


    // 2️⃣ Send to main pipeline
    const result = await processTranscriptChunk({
      lectureId: req.body.lecture_id,
      transcriptText: text,
      startTime: Date.now(),
      endTime: Date.now(),
    });

    res.json({
      transcript: text,
      ...result,
    });
  } catch (err) {
    console.error("Audio error:", err);

    res.status(500).json({
      error: "audio_pipeline_failed",
      detail: err.message,
    });
  }
}
