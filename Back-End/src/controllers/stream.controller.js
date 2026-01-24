import { processTranscriptChunk } from "../services/liveLecturePipeline.service.js";

export async function receiveChunkHandler(req, res) {
  const { lectureId } = req.params;
  const { transcriptText } = req.body;

  try {
    const result = await processTranscriptChunk({
      lectureId,
      transcriptText,
      startTime: Date.now(),
      endTime: Date.now(),
    });

    res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
