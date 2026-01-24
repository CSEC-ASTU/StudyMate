import { lectureEventEmitter } from "../event/lecture.events.js";

export function attachLectureStream({ lectureId, req, res }) {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  // Initial ping
  res.write(`event: connected\ndata: {}\n\n`);

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const onHighlight = (payload) => {
    if (payload.lectureId !== lectureId) return;
    send("highlight", payload);
  };

  const onStatus = (payload) => {
    if (payload.lectureId !== lectureId) return;
    send("status", payload);
  };

  const onDebug = (payload) => {
    if (payload.lectureId !== lectureId) return;
    res.write(`event: debug\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  setInterval(() => {
    res.write("event: ping\ndata: { this is test ping}\n\n");
  }, 15000);

  lectureEventEmitter.on("lecture.debug", onDebug);
  lectureEventEmitter.on("lecture.highlight", onHighlight);
  lectureEventEmitter.on("lecture.status", onStatus);

  // Cleanup
  req.on("close", () => {
    lectureEventEmitter.off("lecture.highlight", onHighlight);
    lectureEventEmitter.off("lecture.status", onStatus);
    lectureEventEmitter.off("lecture.debug", onDebug);
    res.end();
  });
}
