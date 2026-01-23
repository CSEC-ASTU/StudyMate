import fetch from "node-fetch"; // node 18+ has global fetch; if not, install node-fetch
const BASE_URL = "http://localhost:3000";

async function startLecture() {
  const res = await fetch(`${BASE_URL}/api/lecture/start`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ userId: "tester", courseId: "course-1", materialIds: ["mat-today-1"]})
  });
  const j = await res.json();
  console.log("startLecture ->", j);
  return j.lectureId;
}

async function sendChunk(lectureId, text) {
  const res = await fetch(`${BASE_URL}/api/lecture/${lectureId}/chunk`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ transcriptText: text, startTime: Date.now(), endTime: Date.now() })
  });
  const j = await res.json();
  console.log("sendChunk ->", text.slice(0,60), "... =>", j);
  return j;
}

async function stopLecture(lectureId) {
  const res = await fetch(`${BASE_URL}/api/lecture/stop`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ lectureId })
  });
  const j = await res.json();
  console.log("stopLecture ->", j);
  return j;
}

(async () => {
  try {
    const lectureId = await startLecture();

    // These chunks test both buffer flush and RAG ingestion:
    const chunks = [
      "Today we'll discuss Newton's second law.",
      "Force equals mass times acceleration.",
      "This is a definition: force is the product of mass and acceleration.",
      "Example: push a 2 kg object to accelerate at 3 m per second squared.",
      "We will solve numerical problems on the board now."
    ];

    // send chunks slowly so buffer flush conditions can be hit
    for (const c of chunks) {
      await sendChunk(lectureId, c);
      // small wait so time-based flush may trigger; test runner uses explicit waits to mimic STT
      await new Promise(r => setTimeout(r, 600)); // 600ms
    }

    // Send extra raw chunks to trigger RAG ingestion (RAG bufferSize = 5)
    for (let i = 1; i <= 5; i++) {
      await sendChunk(lectureId, `raw rag chunk ${i}`);
    }

    await stopLecture(lectureId);

  } catch (e) {
    console.error("Test failed:", e);
  }
})();
