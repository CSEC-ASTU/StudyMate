"use client";
import { useEffect, useState } from "react";
import { MarkdownRenderer } from "./MarkdownRender";
import transcriptData from "@/components/data/transcript.json";

interface TranscriptEntry {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
}

export function TranscriptPanel({ isRecording }: { isRecording: boolean }) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [index, setIndex] = useState(0);

  // Stream transcript data
  useEffect(() => {
    if (!isRecording || index >= transcriptData.length) return;

    const item = transcriptData[index];
    let char = 0;

    const timer = setInterval(() => {
      if (char < item.content.length) {
        setStreamingText(item.content.slice(0, char + 1));
        char++;
      } else {
        clearInterval(timer);
        setEntries((p) => [...p, { ...item, timestamp: new Date() }]);
        setStreamingText("");
        setIndex((i) => i + 1);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [isRecording, index]);

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {" "}
      {entries.map((e) => (
        <MarkdownRenderer key={e.id} content={e.content} />
      ))}
      {streamingText && <MarkdownRenderer content={streamingText} streaming />}
      {/* Larger empty div for better scroll target */}
      <div className="h-40 md:h-50" id="transcript-end" />
    </div>
  );
}
