"use client";

import { useCallback, useRef, useState } from "react";

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  error: string | null;
  chunksSent: number;
  currentTime: number;
  lectureId: string | null;
}

interface AudioChunkResult {
  success: boolean;
  chunkNumber: number;
  data?: {
    transcript: string;
    highlights: string[];
    concepts: string[];
    ragStatus: string;
    highlightEmitted: boolean;
  };
  error?: string;
}

export function useAudioRecorder(courseId: string) {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    error: null,
    chunksSent: 0,
    currentTime: 0,
    lectureId: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioQueueRef = useRef<Array<{ blob: Blob; chunkNumber: number }>>([]);
  const isProcessingRef = useRef<boolean>(false);
  const isActiveRef = useRef<boolean>(false);
  const chunkCountRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Function to start lecture session
  const startLectureSession = useCallback(async (): Promise<string> => {
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const userId = user?.id;

      const token = localStorage.getItem("token");

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      console.log("[API] Starting lecture session...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            courseId: courseId,
            materialIds: [],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "[API] Failed to start lecture:",
          response.status,
          errorText,
        );
        throw new Error(
          `Failed to start lecture: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("[API] Lecture started with ID:", data.lectureId);
      return data.lectureId;
    } catch (error) {
      console.error("[API] Failed to start lecture session:", error);
      throw error;
    }
  }, [courseId]);

  // Function to process audio queue
  const processAudioQueue = useCallback(async (lectureId: string) => {
    if (isProcessingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const { blob, chunkNumber } = audioQueueRef.current.shift()!;

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        console.log(`[API] Sending audio chunk #${chunkNumber}...`);

        // Create FormData exactly like Postman
        const formData = new FormData();

        // IMPORTANT: Use the exact field name and format from Postman
        formData.append("audio", blob, `chunk-${chunkNumber}.opus`);
        formData.append("lecture_id", lectureId);

        // Log the audio blob details for debugging
        console.log(`[API] Audio blob details:`, {
          type: blob.type,
          size: `${(blob.size / 1024).toFixed(2)} KB`,
          lectureId: lectureId,
        });

        // Convert blob to array buffer to verify it has data
        const arrayBuffer = await blob.arrayBuffer();
        console.log(`[API] Audio data size: ${arrayBuffer.byteLength} bytes`);

        if (arrayBuffer.byteLength === 0) {
          console.warn(`[API] Audio chunk #${chunkNumber} is empty!`);
          continue;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/live/audio`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        console.log(`[API] Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[API] Failed to send audio chunk #${chunkNumber}:`,
            response.status,
            errorText,
          );

          // Try to parse as JSON if possible
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(
              `Server error: ${errorData.message || response.statusText}`,
            );
          } catch {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }

        const data = await response.json();
        console.log(`[API] Audio Chunk #${chunkNumber} sent successfully`);
        console.log(`[API] Response:`, data);

        // Update chunks sent count
        setState((prev) => ({ ...prev, chunksSent: chunkNumber }));

        // Dispatch event for transcript panel
        if (data.transcript && data.transcript !== "empty") {
          window.dispatchEvent(
            new CustomEvent("audio-chunk-processed", {
              detail: {
                type: "audio_processed",
                payload: {
                  transcript: data.transcript,
                  highlights: data.highlights || [],
                  concepts: data.concepts || [],
                  ragStatus: data.ragStatus,
                  highlightEmitted: data.highlightEmitted,
                  chunkNumber: chunkNumber,
                },
              },
            }),
          );
        } else if (data.status === "empty") {
          console.warn(
            `[API] Server reported empty audio for chunk #${chunkNumber}`,
          );

          window.dispatchEvent(
            new CustomEvent("audio-chunk-processed", {
              detail: {
                type: "audio_processed",
                payload: {
                  transcript: "Audio chunk received but no speech detected.",
                  highlights: [],
                  concepts: [],
                  ragStatus: "empty",
                  highlightEmitted: false,
                  chunkNumber: chunkNumber,
                },
              },
            }),
          );
        }
      } catch (error) {
        console.error(
          `[API] Error sending audio chunk #${chunkNumber}:`,
          error,
        );

        window.dispatchEvent(
          new CustomEvent("audio-chunk-processed", {
            detail: {
              type: "error",
              payload: {
                message: `Failed to process audio chunk #${chunkNumber}: ${error instanceof Error ? error.message : "Unknown error"}`,
                chunkNumber: chunkNumber,
              },
            },
          }),
        );
      }

      // Small delay between chunks to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    isProcessingRef.current = false;
  }, []);

  // Function to send audio chunk to backend
  const enqueueAudioChunk = useCallback(
    (audioBlob: Blob, chunkNumber: number, lectureId: string) => {
      // Add to queue
      audioQueueRef.current.push({ blob: audioBlob, chunkNumber });

      // Process queue
      processAudioQueue(lectureId);
    },
    [processAudioQueue],
  );

  // Function to record a chunk
  const recordChunk = useCallback(() => {
    if (!mediaRecorderRef.current || !isActiveRef.current || !state.isRecording)
      return;

    console.log(`[AUDIO] Starting chunk #${chunkCountRef.current + 1}`);
    mediaRecorderRef.current.start();

    // Stop after 10 seconds
    setTimeout(() => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        console.log(
          `[AUDIO] Stopping chunk #${chunkCountRef.current + 1} after 10 seconds`,
        );
        mediaRecorderRef.current.stop();
      }
    }, 10000);
  }, [state.isRecording]);

  // Set up SSE connection for real-time updates
  const setupSSEConnection = useCallback(
    (lectureId: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[SSE] No authentication token found");
        return null;
      }

      console.log(`[SSE] Connecting to lecture stream: ${lectureId}`);

      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/${lectureId}/stream?token=${encodeURIComponent(token)}`,
      );

      eventSource.onopen = () => {
        console.log("[SSE] Connected to lecture stream");
        window.dispatchEvent(
          new CustomEvent("lecture-stream-update", {
            detail: {
              type: "connection_established",
              payload: { lectureId },
            },
          }),
        );
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[SSE] Received update:", data);

          // Dispatch a custom event that TranscriptPanel can listen to
          window.dispatchEvent(
            new CustomEvent("lecture-stream-update", {
              detail: {
                type: data.type || "unknown",
                payload: data.payload || data,
                timestamp: new Date().toISOString(),
              },
            }),
          );
        } catch (error) {
          console.error("[SSE] Error parsing event data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("[SSE] Connection error:", error);

        window.dispatchEvent(
          new CustomEvent("lecture-stream-update", {
            detail: {
              type: "connection_error",
              payload: { error: "Connection lost" },
            },
          }),
        );

        // Implement reconnection logic
        setTimeout(() => {
          if (state.lectureId && isActiveRef.current) {
            console.log("[SSE] Attempting to reconnect...");
            setupSSEConnection(state.lectureId);
          }
        }, 5000);
      };

      eventSourceRef.current = eventSource;
      return eventSource;
    },
    [state.lectureId],
  );

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // Reset counters and flags
      chunkCountRef.current = 0;
      audioQueueRef.current = [];
      isActiveRef.current = true;
      startTimeRef.current = Date.now();

      // 1. Start lecture session
      const lectureId = await startLectureSession();

      // 2. Update state with lectureId immediately
      setState((prev) => ({ ...prev, lectureId }));

      // 3. Set up SSE connection for real-time updates
      setupSSEConnection(lectureId);

      // 4. Request microphone access with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Higher sample rate for better quality
          channelCount: 1, // Mono is better for speech recognition
          sampleSize: 16, // 16-bit samples
        },
      });

      streamRef.current = stream;

      // 5. Set up audio context for visualization
      const audioContext = new AudioContext({ sampleRate: 48000 });
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Smaller for faster processing
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // 6. Test for supported audio formats - prioritize Opus
      let mimeType: string;

      // Try Opus first (most efficient for speech)
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
        console.log("[AUDIO] Using Opus codec (WebM container)");
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
        console.log("[AUDIO] Using Opus codec (Ogg container)");
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
        console.log("[AUDIO] Using WebM format");
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
        console.log("[AUDIO] Using MP4 format");
      } else {
        mimeType = "audio/webm"; // Fallback
        console.warn(
          "[AUDIO] Using default WebM format, some browsers may not support this",
        );
      }

      console.log(`[AUDIO] Selected mime type: ${mimeType}`);

      // 7. Create MediaRecorder with optimal settings
      const options: MediaRecorderOptions = {
        mimeType: mimeType,
        audioBitsPerSecond: 64000, // Lower bitrate for speech (saves bandwidth)
      };

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      // 8. Handle audio data - collect chunks and send them
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunkCountRef.current++;

          console.log(`[AUDIO] Chunk #${chunkCountRef.current} available:`, {
            size: `${(event.data.size / 1024).toFixed(2)} KB`,
            type: event.data.type,
          });

          // Create a fresh blob with proper type
          const audioBlob = new Blob([event.data], {
            type: mimeType,
          });

          // Enqueue for sending
          enqueueAudioChunk(audioBlob, chunkCountRef.current, lectureId);
        } else {
          console.warn("[AUDIO] Empty or invalid audio data received");
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("[AUDIO] MediaRecorder error:", event);
        setState((prev) => ({
          ...prev,
          error: "Recording error occurred",
          isRecording: false,
        }));

        isActiveRef.current = false;

        window.dispatchEvent(
          new CustomEvent("lecture-stream-update", {
            detail: {
              type: "recording_error",
              payload: { error: "MediaRecorder error" },
            },
          }),
        );
      };

      mediaRecorder.onstop = () => {
        console.log(`[AUDIO] Chunk #${chunkCountRef.current} stopped`);

        if (state.isRecording && isActiveRef.current) {
          // Start next chunk with fresh header
          recordChunk();
        }
      };

      // 9. Start the first chunk
      recordChunk();

      // 10. Update current time every 100ms
      timeIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState((prev) => ({ ...prev, currentTime: elapsed }));
      }, 100);

      // 11. Update state
      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        chunksSent: 0,
        currentTime: 0,
      }));

      console.log("[AUDIO] Recording started successfully");
      console.log(`[AUDIO] Lecture ID: ${lectureId}`);
      console.log("---");

      // Notify transcript panel
      window.dispatchEvent(
        new CustomEvent("lecture-stream-update", {
          detail: {
            type: "recording_started",
            payload: { lectureId },
          },
        }),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start recording";
      console.error("[AUDIO] Recording error:", errorMessage, err);

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isRecording: false,
      }));

      isActiveRef.current = false;

      window.dispatchEvent(
        new CustomEvent("lecture-stream-update", {
          detail: {
            type: "recording_error",
            payload: { error: errorMessage },
          },
        }),
      );
    }
  }, [
    startLectureSession,
    setupSSEConnection,
    enqueueAudioChunk,
    recordChunk,
    state.isRecording,
  ]);

  const stopRecording = useCallback(() => {
    console.log("[AUDIO] Stopping recording...");

    // Set active flag to false to stop recording loop
    isActiveRef.current = false;

    // Stop MediaRecorder if it's recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      console.log(`[AUDIO] MediaRecorder stopped (was recording)`);
    } else if (mediaRecorderRef.current) {
      console.log(
        `[AUDIO] MediaRecorder state: ${mediaRecorderRef.current.state}`,
      );
    }

    console.log(`[AUDIO] Total chunks sent: ${chunkCountRef.current}`);
    console.log(`[AUDIO] Final Lecture ID: ${state.lectureId}`);
    console.log("---");

    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log("[SSE] Connection closed");
    }

    // Clean up media resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`[AUDIO] Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      console.log("[AUDIO] AudioContext closed");
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
      console.log("[AUDIO] Timers cleared");
    }

    // Clear audio queue
    audioQueueRef.current = [];
    isProcessingRef.current = false;

    analyserRef.current = null;
    mediaRecorderRef.current = null;

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }));

    // Notify transcript panel with delay to ensure it only fires once
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("lecture-stream-update", {
          detail: {
            type: "recording_stopped",
            payload: {},
          },
        }),
      );
    }, 100);
  }, [state.lectureId]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    getAnalyser,
  };
}
