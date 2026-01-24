"use client";
import { useEffect, useState, useCallback } from "react";
import { MarkdownRenderer } from "./MarkdownRender";

interface TranscriptEntry {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  isProcessing?: boolean;
}

interface TranscriptData {
  transcript: string;
  highlights: string[];
  concepts: string[];
}

export function TranscriptPanel({
  isRecording,
  lectureId,
}: {
  isRecording: boolean;
  lectureId: string | null;
}) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Function to process incoming transcript data
  const processTranscriptData = useCallback((data: TranscriptData) => {
    // Add the main transcript entry
    const transcriptEntry: TranscriptEntry = {
      id: Date.now().toString(),
      type: "transcript",
      content: data.transcript,
      timestamp: new Date(),
      isProcessing: false,
    };

    // Add highlights if any
    const highlightEntries: TranscriptEntry[] = data.highlights.map(
      (highlight, index) => ({
        id: `highlight-${Date.now()}-${index}`,
        type: "highlight",
        content: `**Highlight:** ${highlight}`,
        timestamp: new Date(),
        isProcessing: false,
      }),
    );

    // Add concepts if any
    const conceptEntries: TranscriptEntry[] = data.concepts.map(
      (concept, index) => ({
        id: `concept-${Date.now()}-${index}`,
        type: "concept",
        content: `**Concept:** ${concept}`,
        timestamp: new Date(),
        isProcessing: false,
      }),
    );

    // Add all entries with streaming effect
    setIsStreaming(true);

    // First add the transcript with streaming effect
    setStreamingText("");
    let charIndex = 0;
    const transcriptText = transcriptEntry.content;

    const streamTranscript = () => {
      const timer = setInterval(() => {
        if (charIndex < transcriptText.length) {
          setStreamingText(transcriptText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(timer);
          // Add the complete transcript entry
          setEntries((prev) => [...prev, transcriptEntry]);
          setStreamingText("");

          // Add highlights and concepts without streaming
          setTimeout(() => {
            setEntries((prev) => [
              ...prev,
              ...highlightEntries,
              ...conceptEntries,
            ]);
            setIsStreaming(false);
          }, 300);
        }
      }, 15);

      return timer;
    };

    const timer = streamTranscript();
    return () => clearInterval(timer);
  }, []);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!lectureId) {
      setEntries([]);
      setStreamingText("");
      return;
    }

    console.log(`[SSE] Connecting to lecture stream: ${lectureId}`);

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/${lectureId}/stream`,
    );

    eventSource.onopen = () => {
      console.log("[SSE] Connected to lecture stream");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE] Received data:", data);

        switch (data.type) {
          case "audio_processing_start":
            // Add processing indicator
            setEntries((prev) => [
              ...prev,
              {
                id: `processing-${Date.now()}`,
                type: "processing",
                content: "🎤 *Processing audio...*",
                timestamp: new Date(),
                isProcessing: true,
              },
            ]);
            break;

          case "audio_processed":
            // Process the actual transcript data from audio chunk
            const transcriptData: TranscriptData = {
              transcript: data.payload.transcript || "",
              highlights: data.payload.highlights || [],
              concepts: data.payload.concepts || [],
            };

            if (transcriptData.transcript) {
              processTranscriptData(transcriptData);
            }
            break;

          case "transcript_update":
            // Direct transcript updates (for corrections or additions)
            setEntries((prev) => [
              ...prev,
              {
                id: `update-${Date.now()}`,
                type: "transcript",
                content: data.payload.text,
                timestamp: new Date(),
                isProcessing: false,
              },
            ]);
            break;

          case "summary_update":
            // Summary updates
            setEntries((prev) => [
              ...prev,
              {
                id: `summary-${Date.now()}`,
                type: "summary",
                content: `**📝 Summary:** ${data.payload.text}`,
                timestamp: new Date(),
                isProcessing: false,
              },
            ]);
            break;

          case "quiz_question":
            // Quiz questions
            setEntries((prev) => [
              ...prev,
              {
                id: `quiz-${Date.now()}`,
                type: "quiz",
                content: `**❓ Quiz Question:** ${data.payload.question}`,
                timestamp: new Date(),
                isProcessing: false,
              },
            ]);
            break;

          case "error":
            console.error("[SSE] Server error:", data.payload);
            setEntries((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                type: "error",
                content: `**⚠️ Error:** ${data.payload.message}`,
                timestamp: new Date(),
                isProcessing: false,
              },
            ]);
            break;

          default:
            console.log("[SSE] Unknown event type:", data.type);
        }
      } catch (error) {
        console.error("[SSE] Error parsing event data:", error);
        setEntries((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            type: "error",
            content: "**⚠️ Error processing server update**",
            timestamp: new Date(),
            isProcessing: false,
          },
        ]);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
      setIsConnected(false);

      if (eventSource.readyState === EventSource.CLOSED) {
        eventSource.close();
        setEntries((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            type: "error",
            content: "**🔌 Connection lost. Trying to reconnect...**",
            timestamp: new Date(),
            isProcessing: false,
          },
        ]);
      }
    };

    // Cleanup function
    return () => {
      console.log("[SSE] Closing connection");
      eventSource.close();
      setIsConnected(false);
      setIsStreaming(false);
    };
  }, [lectureId, processTranscriptData]);

  // Add initial message when recording starts
  useEffect(() => {
    if (isRecording && lectureId && entries.length === 0) {
      setEntries([
        {
          id: "start",
          type: "system",
          content: "**🎤 Recording started. Speak to begin transcription...**",
          timestamp: new Date(),
          isProcessing: false,
        },
      ]);
    } else if (!isRecording && entries.length > 0) {
      // Add stopped message if recording stops
      setEntries((prev) => [
        ...prev,
        {
          id: "stop",
          type: "system",
          content: "**⏹️ Recording stopped.**",
          timestamp: new Date(),
          isProcessing: false,
        },
      ]);
    }
  }, [isRecording, lectureId, entries.length]);

  // Filter and organize entries by type
  const getEntryStyle = (type: string) => {
    switch (type) {
      case "highlight":
        return "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
      case "concept":
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20";
      case "summary":
        return "border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20";
      case "quiz":
        return "border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20";
      case "error":
        return "border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20";
      case "processing":
        return "border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-950/20 animate-pulse";
      case "system":
        return "border-l-4 border-gray-400 bg-gray-100 dark:bg-gray-900/30";
      default:
        return "border-l-4 border-primary/50 bg-card";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Connection status indicator */}
      {lectureId && (
        <div
          className={`sticky top-0 z-10 p-2 mb-4 rounded-lg text-sm backdrop-blur-sm ${
            isConnected
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
            />
            {isConnected
              ? "Live transcription active"
              : "Connecting to server..."}
          </div>
        </div>
      )}

      {/* Transcript entries */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`p-4 md:p-6 rounded-lg transition-all duration-300 ${getEntryStyle(entry.type)}`}
        >
          <div className="flex justify-between items-start mb-2 md:mb-3">
            <span className="text-xs md:text-sm text-muted-foreground">
              {entry.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            {entry.type !== "transcript" && entry.type !== "system" && (
              <span className="text-xs px-2 py-1 rounded-full bg-background/50">
                {entry.type.toUpperCase()}
              </span>
            )}
          </div>
          <MarkdownRenderer
            content={entry.content}
          />
        </div>
      ))}

      {/* Streaming text (current transcription) */}
      {streamingText && (
        <div className="p-4 md:p-6 rounded-lg border-l-4 border-primary/70 bg-card">
          <div className="flex justify-between items-start mb-2 md:mb-3">
            <span className="text-xs md:text-sm text-muted-foreground">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              TRANSCRIBING
            </span>
          </div>
          <MarkdownRenderer content={streamingText} streaming={isStreaming} />
          {isStreaming && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150" />
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-300" />
              </div>
              Processing highlights and concepts...
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isRecording && entries.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <div className="inline-block p-4 md:p-6 rounded-full bg-muted mb-4 md:mb-6">
            <span className="text-2xl md:text-3xl">🎤</span>
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
            Ready to Record
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start recording to see real-time transcription, highlights, and key
            concepts.
          </p>
        </div>
      )}

      {/* Larger empty div for better scroll target */}
      <div className="h-40 md:h-50" id="transcript-end" />
    </div>
  );
}
