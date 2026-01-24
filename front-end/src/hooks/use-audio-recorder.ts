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
  const currentLectureIdRef = useRef<string | null>(null); // Added ref to track lectureId
  const chunkCountRef = useRef<number>(0); // Added ref to track chunk count

  // Function to start lecture session
  const startLectureSession = useCallback(async () => {
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const userId = user?.id;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            courseId: courseId,
            materialIds: [],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to start lecture: ${response.statusText}`);
      }

      const data = await response.json();
      return data.lectureId;
    } catch (error) {
      console.error("[v0] Failed to start lecture session:", error);
      throw error;
    }
  }, [courseId]);

  // Function to send audio chunk to backend
  const sendAudioChunk = useCallback(
    async (audioBlob: Blob, chunkNumber: number, lectureId: string) => {
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("lecture_id", lectureId);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/live/audio`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to send audio chunk: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[v0] Audio Chunk #${chunkNumber} sent successfully`);
        console.log(`[v0] Transcript: ${data.transcript}`);
        console.log(`[v0] Highlights: ${JSON.stringify(data.highlights)}`);
        console.log(`[v0] Concepts: ${JSON.stringify(data.concepts)}`);

        return { success: true, chunkNumber, data };
      } catch (error) {
        console.error(`[v0] Error sending audio chunk #${chunkNumber}:`, error);
        return { success: false, chunkNumber, error };
      }
    },
    [],
  );

  // Set up SSE connection for real-time updates
  const setupSSEConnection = useCallback((lectureId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/lectures/${lectureId}/stream`,
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE] Received update:", data);

        switch (data.type) {
          case "transcript_update":
            console.log("[SSE] Transcript update:", data.payload);
            break;
          case "highlight_update":
            console.log("[SSE] Highlight update:", data.payload);
            break;
          case "concept_update":
            console.log("[SSE] Concept update:", data.payload);
            break;
          case "summary_update":
            console.log("[SSE] Summary update:", data.payload);
            break;
          case "quiz_update":
            console.log("[SSE] Quiz question:", data.payload);
            break;
          default:
            console.log("[SSE] Unknown event type:", data.type);
        }
      } catch (error) {
        console.error("[SSE] Error parsing event data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
    };

    eventSourceRef.current = eventSource;
    return eventSource;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // 1. Start lecture session
      console.log("[v0] Starting lecture session...");
      const lectureId = await startLectureSession();
      console.log("[v0] Lecture started with ID:", lectureId);

      // Store lectureId in ref for use in callback
      currentLectureIdRef.current = lectureId;
      chunkCountRef.current = 0; // Reset chunk counter

      // 2. Set up SSE connection for real-time updates
      setupSSEConnection(lectureId);

      // 3. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // 4. Set up audio context for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // 5. Determine the best supported audio format
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      const startTime = Date.now();

      // 6. Handle audio data - using refs instead of state
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && currentLectureIdRef.current) {
          chunkCountRef.current++;
          const chunkNumber = chunkCountRef.current;
          const lectureId = currentLectureIdRef.current;

          console.log(
            `[v0] Data available for chunk #${chunkNumber}, size: ${event.data.size} bytes`,
          );

          // Send chunk to backend
          await sendAudioChunk(event.data, chunkNumber, lectureId);

          // Update state with current chunk count
          setState((prev) => ({ ...prev, chunksSent: chunkNumber }));
        }
      };

      mediaRecorder.onerror = (error) => {
        console.error("[v0] MediaRecorder error:", error);
        setState((prev) => ({
          ...prev,
          error: "Recording error occurred",
          isRecording: false,
        }));
      };

      // 7. Start recording with 3-second intervals
      mediaRecorder.start(3000);
      console.log("[v0] MediaRecorder started with 3000ms timeslice");

      // 8. Update current time every 100ms
      timeIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setState((prev) => ({ ...prev, currentTime: elapsed }));
      }, 100);

      // 9. Update state
      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        chunksSent: 0,
        currentTime: 0,
        lectureId: lectureId,
      }));

      console.log("[v0] Recording started");
      console.log(`[v0] Audio format: ${mimeType}`);
      console.log(`[v0] Lecture ID: ${lectureId}`);
      console.log("[v0] Sending audio chunks every 3 seconds...");
      console.log("---");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start recording";
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error("[v0] Recording error:", errorMessage);
    }
  }, [startLectureSession, setupSSEConnection, sendAudioChunk]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
      console.log("[v0] Recording paused");
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
      console.log("[v0] Recording resumed");
    }
  }, [state.isRecording, state.isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      console.log("[v0] Recording stopped");
      console.log(`[v0] Total chunks sent: ${state.chunksSent}`);
      console.log(`[v0] Lecture ID: ${state.lectureId}`);
      console.log("---");
    }

    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clean up media resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }

    analyserRef.current = null;
    mediaRecorderRef.current = null;
    currentLectureIdRef.current = null;
    chunkCountRef.current = 0;

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
      lectureId: null,
    }));
  }, [state.isRecording, state.chunksSent, state.lectureId]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getAnalyser,
  };
}
