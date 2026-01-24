"use client";

import { WaveVisualizer } from "@/components/pages/livestream/WaveVisualizer";
import { TranscriptPanel } from "@/components/pages/livestream/TransactionPanel";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Mic, Square, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export default function LivestreamPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  
  // Add fallback to localStorage if courseId is not in URL
  useEffect(() => {
    if (!courseId) {
      const storedCourseId = localStorage.getItem("currentCourseId");
      if (storedCourseId) {
        console.log("[PAGE] Using courseId from localStorage:", storedCourseId);
        // You might want to update the URL or handle this differently
      }
    } else {
      // Store courseId in localStorage for persistence
      localStorage.setItem("currentCourseId", courseId);
    }
  }, [courseId]);

  const {
    isRecording,
    error,
    currentTime,
    lectureId,
    chunksSent,
    startRecording,
    stopRecording,
    getAnalyser,
  } = useAudioRecorder(courseId || "");

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastScrollTime = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (!courseId) {
        const storedCourseId = localStorage.getItem("currentCourseId");
        if (storedCourseId) {
          // You could redirect or use the stored courseId
          console.log("[PAGE] Would use stored courseId:", storedCourseId);
          alert("Using course from previous session. Starting recording...");
        } else {
          alert("Please select a course first or check the URL for courseId parameter.");
          return;
        }
      }
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
    const isNearBottom = distanceFromBottom < 50;

    setAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom);
    lastScrollTime.current = Date.now();
  };

  // Force scroll to bottom
  const scrollToBottom = useCallback((instant = false) => {
    if (!transcriptContainerRef.current) return;

    const container = transcriptContainerRef.current;
    const endMarker = document.getElementById("transcript-end");

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const scroll = () => {
      if (endMarker) {
        endMarker.scrollIntoView({
          behavior: instant ? "auto" : "smooth",
          block: "end",
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }

      setAutoScroll(true);
      setShowScrollButton(false);
    };

    scrollTimeoutRef.current = setTimeout(scroll, 50);
  }, []);

  // Auto-scroll when new content appears
  useEffect(() => {
    if (isRecording && autoScroll) {
      scrollToBottom();
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
      <div className="flex flex-col mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-0">
        {/* Top Section - Transcript with proper styling */}
        <div
          ref={transcriptContainerRef}
          className="flex-1 overflow-y-auto pt-6 md:pt-10 pb-30 scroll-smooth"
          style={{
            scrollBehavior: "smooth",
          }}
        >
          <TranscriptPanel 
            isRecording={isRecording} 
            lectureId={lectureId} 
          />
        </div>

        {/* Status Bar - Shows multiple pieces of info */}
        <div className="fixed top-4 left-4 right-4 flex justify-between items-start z-40">
          <div className="flex flex-col gap-1">
            {/* Lecture ID Display */}
            {isRecording && lectureId && (
              <div className="px-3 py-1.5 bg-black/70 text-xs text-white/90 rounded-md backdrop-blur-sm max-w-xs truncate">
                <div className="font-medium">Lecture ID:</div>
                <div className="font-mono">{lectureId.substring(0, 8)}...</div>
              </div>
            )}
            
            {/* Course ID Display */}
            {courseId && (
              <div className="px-3 py-1.5 bg-blue-900/50 text-xs text-blue-200 rounded-md backdrop-blur-sm max-w-xs truncate">
                <div className="font-medium">Course ID:</div>
                <div className="font-mono">{courseId.substring(0, 8)}...</div>
              </div>
            )}
          </div>

          {/* Chunks sent counter */}
          {isRecording && (
            <div className="px-3 py-1.5 bg-green-900/50 text-xs text-green-200 rounded-md backdrop-blur-sm">
              <div className="font-medium">Chunks Sent:</div>
              <div className="text-center font-bold">{chunksSent}</div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom()}
            className="fixed z-50 p-3 bg-primary/95 text-primary-foreground rounded-full shadow-xl hover:bg-primary transition-all transform hover:scale-110 active:scale-95 border border-primary/30 backdrop-blur-sm"
            style={{
              top: "1.25rem",
              right: "1rem",
              fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
            }}
            aria-label="Scroll to latest"
          >
            <div className="flex items-center gap-1.5 md:gap-2 px-0.5 md:px-1">
              {isRecording && (
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs font-medium hidden sm:inline">
                Latest
              </span>
            </div>
          </button>
        )}

        {/* Bottom Section - Visualizer & Controls */}
        <div className="shrink-0 relative flex items-end justify-center pb-4 md:pb-6">
          <div className="fixed bottom-0 max-w-4xl w-full h-28 md:h-32 rounded-t-2xl md:rounded-2xl border mb-4 md:mb-8 dark:bg-[#1d1d1d] bg-[#fff8f8] px-4 md:px-0">
            {/* Wave Visualizer */}
            {isRecording && (
              <div className="absolute inset-0">
                <WaveVisualizer
                  analyserNode={getAnalyser()}
                  isRecording={isRecording}
                />
              </div>
            )}

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-3 md:p-4">
              {/* Recording status */}
              {isRecording && (
                <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse" />
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
                disabled={!courseId && !isRecording && !localStorage.getItem("currentCourseId")}
                className={`
                  relative flex items-center justify-center
                  w-12 h-12 md:w-14 md:h-14 rounded-full
                  transition-all duration-300 ease-out
                  border-2 backdrop-blur-sm
                  ${
                    isRecording
                      ? "bg-red-500/10 border-red-500 hover:bg-red-500/20 cursor-pointer"
                      : (!courseId && !localStorage.getItem("currentCourseId"))
                      ? "bg-gray-500/10 border-gray-500 cursor-not-allowed opacity-50"
                      : "bg-primary/10 border-primary hover:bg-primary/20 cursor-pointer"
                  }
                `}
                style={{
                  boxShadow: isRecording
                    ? "0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)"
                    : "0 0 20px rgba(var(--primary-glow), 0.3), 0 0 40px rgba(var(--primary-glow), 0.15)",
                }}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                {isRecording ? (
                  <Square className="w-5 h-5 md:w-7 md:h-7 text-red-500" />
                ) : (
                  <Mic className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                )}
              </button>

              {/* Instructions text */}
              {!isRecording && (
                <div className="text-center mt-3 md:mt-4">
                  {(!courseId && !localStorage.getItem("currentCourseId")) ? (
                    <div className="space-y-1">
                      <p className="text-destructive text-xs md:text-sm font-medium">
                        No course selected
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Please select a course first
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs md:text-sm">
                        Tap to start recording
                      </p>
                      <p className="text-muted-foreground/70 text-xs">
                        Audio chunks sent every 5 seconds
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-3 md:mt-4 px-3 py-1.5 md:px-4 md:py-2 bg-destructive/10 rounded-lg border border-destructive/30 backdrop-blur-sm max-w-[90vw]">
                  <p className="text-xs text-destructive text-center font-medium">
                    Error: {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 w-full max-w-4xl flex justify-center text-[10px] xs:text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-1.5 md:p-2 px-4 md:px-0">
          <p>Powered by StudyMate • Audio processed in real-time</p>
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
          width: 6px;
        }

        @media (min-width: 640px) {
          ::-webkit-scrollbar {
            width: 8px;
          }
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