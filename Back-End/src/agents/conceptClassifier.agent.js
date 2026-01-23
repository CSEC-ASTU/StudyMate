// agents/conceptClassifier.agent.js
// This is a placeholder. Implement the classification + context resolution here later.
// For Phase 0, the stub returns no highlights (or controlled demo highlights).

async function processChunk({ lectureId, courseId, materialIds, transcriptText, timestampStart, timestampEnd }) {
  // Minimal demo: treat any chunk containing 'definition' or 'formula' as candidate
  const lower = transcriptText.toLowerCase();

  if (lower.includes("definition") || lower.includes("formula")) {
    // Return a simple HighlightEvent
    return {
      lectureId,
      chunkId: `${lectureId}-${Date.now()}`,
      highlight: true,
      highlightType: lower.includes("formula") ? "formula" : "concept",
      highlightedText: transcriptText.slice(0, 250),
      confidence: 0.85,
      contextSource: "live_buffer_demo",
      timestampStart,
      timestampEnd,
    };
  }

  // otherwise no highlight
  return { lectureId, chunkId: `${lectureId}-${Date.now()}`, highlight: false, timestampStart, timestampEnd };
}

export default { processChunk };
