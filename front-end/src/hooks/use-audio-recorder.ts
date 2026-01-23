"use client"

import { useCallback, useRef, useState } from "react"

interface AudioRecorderState {
  isRecording: boolean
  isPaused: boolean
  error: string | null
  chunksSent: number
  currentTime: number
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    error: null,
    chunksSent: 0,
    currentTime: 0,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const sendAudioChunk = useCallback(async (audioBlob: Blob, chunkNumber: number) => {
    // Convert blob to base64 for logging
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    )

    // Log to console (replace with actual backend call)
    console.log(`[v0] Audio Chunk #${chunkNumber}`)
    console.log(`[v0] Format: ${audioBlob.type}`)
    console.log(`[v0] Size: ${(audioBlob.size / 1024).toFixed(2)} KB`)
    console.log(`[v0] Base64 Preview (first 100 chars): ${base64.substring(0, 100)}...`)
    console.log(`[v0] Timestamp: ${new Date().toISOString()}`)
    console.log("---")

    // Example of how to send to backend:
    // await fetch('/api/audio', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     audio: base64,
    //     format: audioBlob.type,
    //     chunkNumber,
    //     timestamp: Date.now()
    //   })
    // })

    return { success: true, chunkNumber }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }))

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      streamRef.current = stream

      // Set up audio context for visualization
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.4
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Determine the best supported audio format
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "audio/webm"

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      let chunkCount = 0
      const startTime = Date.now()

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          chunkCount++
          await sendAudioChunk(event.data, chunkCount)
          setState((prev) => ({ ...prev, chunksSent: chunkCount }))
        }
      }

      mediaRecorder.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: "Recording error occurred",
          isRecording: false,
        }))
      }

      // Start recording with 3-second intervals
      mediaRecorder.start(3000)

      // Update current time every 100ms
      timeIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setState((prev) => ({ ...prev, currentTime: elapsed }))
      }, 100)

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        chunksSent: 0,
        currentTime: 0,
      }))

      console.log("[v0] Recording started")
      console.log(`[v0] Audio format: ${mimeType}`)
      console.log("[v0] Sending audio chunks every 3 seconds...")
      console.log("---")
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to access microphone"
      setState((prev) => ({ ...prev, error: errorMessage }))
      console.error("[v0] Recording error:", errorMessage)
    }
  }, [sendAudioChunk])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      console.log("[v0] Recording stopped")
      console.log(`[v0] Total chunks sent: ${state.chunksSent}`)
      console.log("---")
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current)
      timeIntervalRef.current = null
    }

    analyserRef.current = null
    mediaRecorderRef.current = null

    setState((prev) => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }))
  }, [state.isRecording, state.chunksSent])

  const getAnalyser = useCallback(() => analyserRef.current, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    getAnalyser,
  }
}
