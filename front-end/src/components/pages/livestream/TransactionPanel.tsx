"use client";
import { useEffect, useState, useCallback, useRef } from "react";
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
  lectureId 
}: { 
  isRecording: boolean;
  lectureId: string | null;
}) {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const lastProcessedChunkRef = useRef<number>(0);
  const hasAddedStopMessageRef = useRef<boolean>(false);

  // Function to process incoming transcript data
  const processTranscriptData = useCallback((data: TranscriptData, chunkNumber: number) => {
    // Skip if we already processed this chunk
    if (chunkNumber <= lastProcessedChunkRef.current) {
      return;
    }
    lastProcessedChunkRef.current = chunkNumber;
    
    console.log("[TRANSCRIPT] Processing data for chunk:", chunkNumber, data);
    
    if (!data.transcript || data.transcript === "Audio chunk received but no speech detected.") {
      console.warn("[TRANSCRIPT] No transcript or empty speech in data");
      return;
    }

    // Add the main transcript entry
    const transcriptEntry: TranscriptEntry = {
      id: `transcript-${Date.now()}-${chunkNumber}`,
      type: "transcript",
      content: data.transcript,
      timestamp: new Date(),
      isProcessing: false
    };

    // Add streaming effect for the transcript
    setIsStreaming(true);
    setStreamingText("");
    
    const transcriptText = transcriptEntry.content;
    let charIndex = 0;
    
    const streamTranscript = () => {
      const timer = setInterval(() => {
        if (charIndex < transcriptText.length) {
          setStreamingText(transcriptText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(timer);
          
          // Add the complete transcript entry
          setEntries(prev => {
            const newEntries = [...prev, transcriptEntry];
            
            // Add highlights if any
            if (data.highlights && data.highlights.length > 0) {
              data.highlights.forEach((highlight, index) => {
                if (highlight.trim()) {
                  newEntries.push({
                    id: `highlight-${Date.now()}-${index}`,
                    type: "highlight",
                    content: `**📌 Highlight:** ${highlight}`,
                    timestamp: new Date(),
                    isProcessing: false
                  });
                }
              });
            }
            
            // Add concepts if any
            if (data.concepts && data.concepts.length > 0) {
              data.concepts.forEach((concept, index) => {
                if (concept.trim()) {
                  newEntries.push({
                    id: `concept-${Date.now()}-${index}`,
                    type: "concept",
                    content: `**🧠 Concept:** ${concept}`,
                    timestamp: new Date(),
                    isProcessing: false
                  });
                }
              });
            }
            
            return newEntries;
          });
          
          setStreamingText("");
          setIsStreaming(false);
        }
      }, 15);
      
      return timer;
    };

    const timer = streamTranscript();
    return () => clearInterval(timer);
  }, []);

  // Listen for custom events from the audio recorder
  useEffect(() => {
    const handleAudioChunkProcessed = (event: CustomEvent) => {
      console.log("[EVENT] Audio chunk processed:", event.detail);
      
      const { type, payload } = event.detail;
      
      if (type === "audio_processed") {
        const transcriptData: TranscriptData = {
          transcript: payload.transcript || "",
          highlights: payload.highlights || [],
          concepts: payload.concepts || []
        };
        
        const chunkNumber = payload.chunkNumber || 0;
        
        if (transcriptData.transcript) {
          processTranscriptData(transcriptData, chunkNumber);
        }
      }
    };

    const handleLectureStreamUpdate = (event: CustomEvent) => {
      console.log("[EVENT] Lecture stream update:", event.detail);
      
      const { type, payload } = event.detail;
      
      switch (type) {
        case "processing_start":
          setEntries(prev => [...prev, {
            id: `processing-${Date.now()}`,
            type: "processing",
            content: "🎤 *Processing audio...*",
            timestamp: new Date(),
            isProcessing: true
          }]);
          break;
          
        case "connection_established":
          setIsConnected(true);
          break;
          
        case "connection_error":
          setIsConnected(false);
          break;
          
        case "recording_started":
          // Reset the stop message flag when recording starts
          hasAddedStopMessageRef.current = false;
          setIsConnected(true);
          break;
          
        case "recording_stopped":
          // Only add the stop message once
          if (!hasAddedStopMessageRef.current) {
            hasAddedStopMessageRef.current = true;
            setEntries(prev => [...prev, {
              id: `stop-${Date.now()}`,
              type: "system",
              content: "**⏹️ Recording stopped.**",
              timestamp: new Date(),
              isProcessing: false
            }]);
            setIsConnected(false);
          }
          break;
          
        case "recording_error":
          setEntries(prev => [...prev, {
            id: `error-${Date.now()}`,
            type: "error",
            content: `**⚠️ Recording Error:** ${payload.error || "Unknown error"}`,
            timestamp: new Date(),
            isProcessing: false
          }]);
          break;
          
        case "error":
          setEntries(prev => [...prev, {
            id: `error-${Date.now()}`,
            type: "error",
            content: `**⚠️ Error:** ${payload.message || payload}`,
            timestamp: new Date(),
            isProcessing: false
          }]);
          break;
      }
    };

    // Add event listeners
    window.addEventListener("audio-chunk-processed", handleAudioChunkProcessed as EventListener);
    window.addEventListener("lecture-stream-update", handleLectureStreamUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener("audio-chunk-processed", handleAudioChunkProcessed as EventListener);
      window.removeEventListener("lecture-stream-update", handleLectureStreamUpdate as EventListener);
    };
  }, [processTranscriptData]);

  // Add initial message when recording starts
  useEffect(() => {
    if (isRecording && lectureId && entries.length === 0) {
      // Clear any previous stop message flag
      hasAddedStopMessageRef.current = false;
      
      setEntries([{
        id: "start",
        type: "system",
        content: "**🎤 Recording started. Speak to begin transcription...**",
        timestamp: new Date(),
        isProcessing: false
      }]);
      setIsConnected(true);
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
        <div className={`sticky top-0 z-10 p-2 mb-4 rounded-lg text-sm backdrop-blur-sm ${
          isConnected 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {isConnected ? 'Live transcription active' : 'Ready to record'}
          </div>
          {lectureId && (
            <div className="mt-1 text-xs opacity-75">
              Lecture ID: {lectureId.substring(0, 8)}...
            </div>
          )}
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
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
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
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              TRANSCRIBING
            </span>
          </div>
          <MarkdownRenderer 
            content={streamingText} 
            streaming={isStreaming}
          />
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
            Start recording to see real-time transcription, highlights, and key concepts.
          </p>
        </div>
      )}

      {/* Larger empty div for better scroll target */}
      <div className="h-40 md:h-50" id="transcript-end" />
    </div>
  );
}