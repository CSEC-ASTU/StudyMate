"use client";

import { WaveVisualizer } from "@/components/pages/livestream/WaveVisualizer";
import { TranscriptPanel } from "@/components/pages/livestream/TransactionPanel";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Mic, Square, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

export default function LivestreamPage() {
  const {
    isRecording,
    error,
    currentTime,
    startRecording,
    stopRecording,
    getAnalyser,
  } = useAudioRecorder();

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastScrollTime = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle scroll events with debouncing
  const handleScroll = () => {
    if (!transcriptContainerRef.current) return;

    const container = transcriptContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 50; // Reduced threshold

    setAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom);
    lastScrollTime.current = Date.now();
  };

  // Force scroll to bottom
  const scrollToBottom = useCallback((instant = false) => {
    if (!transcriptContainerRef.current) return;

    const container = transcriptContainerRef.current;
    const endMarker = document.getElementById("transcript-end");

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Use requestAnimationFrame for smooth scrolling
    const scroll = () => {
      if (endMarker) {
        // Scroll to the end marker
        endMarker.scrollIntoView({
          behavior: instant ? "auto" : "smooth",
          block: "end",
        });
      } else {
        // Fallback to scrollHeight
        container.scrollTop = container.scrollHeight;
      }

      setAutoScroll(true);
      setShowScrollButton(false);
    };

    // Small delay to ensure DOM is updated
    scrollTimeoutRef.current = setTimeout(scroll, 50);
  }, []);

  // Track entries count for the effect above
  const [entriesCount, setEntriesCount] = useState(0);

  // Auto-scroll when new content appears (more aggressive)
  useEffect(() => {
    if (isRecording && autoScroll) {
      scrollToBottom();
    }
  }, [isRecording, entriesCount, autoScroll, scrollToBottom]); // Watch for entries count

  // This effect runs when entries update in TranscriptPanel
  useEffect(() => {
    // This is a hack to detect when TranscriptPanel updates
    // In a real app, you might want to lift the state up or use context
    const checkForUpdates = () => {
      const transcriptEntries = document.querySelectorAll(".markdown-content");
      if (transcriptEntries.length !== entriesCount) {
        setEntriesCount(transcriptEntries.length);
      }
    };

    const interval = setInterval(checkForUpdates, 100);
    return () => clearInterval(interval);
  }, [entriesCount]);

  // Auto-scroll on mount and when recording starts
  useEffect(() => {
    if (isRecording) {
      // Initial scroll to bottom with a bit more delay
      setTimeout(() => scrollToBottom(true), 200);

      // Set up periodic checks for new content
      const scrollInterval = setInterval(() => {
        if (autoScroll && Date.now() - lastScrollTime.current > 300) {
          scrollToBottom();
        }
      }, 500);

      return () => clearInterval(scrollInterval);
    }
  }, [isRecording, autoScroll, scrollToBottom]);

  // Add scroll event listener with throttle
  useEffect(() => {
    const container = transcriptContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 50);
    };

    container.addEventListener("scroll", throttledScroll);
    return () => {
      container.removeEventListener("scroll", throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main container */}
      <div className="flex flex-col mx-auto w-full max-w-4xl">
        {/* Top Section - Transcript with proper styling */}
        <div
          ref={transcriptContainerRef}
          className="flex-1 overflow-y-auto pt-10 pb-30 scroll-smooth"
          style={{
            scrollBehavior: "smooth"
          }}
        >
          <TranscriptPanel isRecording={isRecording} />
        </div>

        {/* Scroll to bottom button - More prominent */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="fixed top-20 right-6 z-50 p-3 bg-primary/95 text-primary-foreground rounded-full shadow-xl hover:bg-primary transition-all transform hover:scale-110 active:scale-95 border border-primary/30 backdrop-blur-sm"
            aria-label="Scroll to latest"
          >
            <div className="flex items-center gap-2 px-1">
              {isRecording && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <ChevronDown className="w-5 h-5" />
              <span className="text-xs font-medium">Latest</span>
            </div>
          </button>
        )}

        {/* Bottom Section - Visualizer & Controls */}
        <div className="shrink-0 relative flex items-end justify-center pb-6">
          <div className="fixed bottom-0 max-w-4xl w-full h-32 rounded-2xl border mb-9 dark:bg-[#1d1d1d] bg-[#f5f5f5]">
            {/* Wave Visualizer - only shown when recording */}
            {isRecording && (
              <div className="absolute inset-0">
                <WaveVisualizer
                  analyserNode={getAnalyser()}
                  isRecording={isRecording}
                />
              </div>
            )}

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
              {/* Recording status - shown above button when recording */}
              {isRecording && (
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 font-medium">Recording</span>
                  </div>
                  <span className="text-foreground font-mono">
                    {formatTime(currentTime)}
                  </span>
                </div>
              )}

              {/* Mic Button */}
              <button
                type="button"
                onClick={handleToggle}
                className={`
                  relative flex items-center justify-center
                  w-14 h-14 rounded-full
                  transition-all duration-300 ease-out
                  cursor-pointer
                  border-2 backdrop-blur-sm
                  ${
                    isRecording
                      ? "bg-red-500/10 border-red-500 hover:bg-red-500/20"
                      : "bg-primary/10 border-primary hover:bg-primary/20"
                  }
                `}
                style={{
                  boxShadow: isRecording
                    ? "0 0 30px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)"
                    : "0 0 30px rgba(var(--primary-glow), 0.3), 0 0 60px rgba(var(--primary-glow), 0.15)",
                }}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <Square className="w-7 h-7 text-red-500" />
                ) : (
                  <Mic className="w-8 h-8 text-primary" />
                )}
              </button>

              {/* Tap to start text - only when not recording */}
              {!isRecording && (
                <p className="text-muted-foreground text-sm mt-4">
                  Tap to start recording
                </p>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 px-4 py-2 bg-destructive/10 rounded-lg border border-destructive/30 backdrop-blur-sm">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 w-full max-w-4xl flex justify-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2">
          <p className="text-center">Powered by StudyMate</p>
        </div>
      </div>

      {/* Add global styles */}
      <style jsx global>{`
        :root {
          --gradient-start: rgba(15, 15, 20, 1);
          --gradient-middle: rgba(20, 20, 28, 0.98);
          --gradient-end: rgba(25, 25, 35, 0.9);
          --primary-glow: 220, 220, 230;
        }

        .light {
          --gradient-start: rgba(245, 245, 250, 1);
          --gradient-middle: rgba(235, 235, 240, 0.98);
          --gradient-end: rgba(225, 225, 230, 0.9);
          --primary-glow: 40, 40, 50;
        }

        /* Custom scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(var(--primary-glow), 0.2) transparent;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-glow), 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-glow), 0.4);
        }

        /* Ensure smooth scrolling */
        .scroll-smooth {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}
