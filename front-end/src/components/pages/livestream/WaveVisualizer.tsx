"use client";

import { useEffect, useRef } from "react";

interface WaveVisualizerProps {
  analyserNode: AnalyserNode | null;
  isRecording: boolean;
}

export function WaveVisualizer({
  analyserNode,
  isRecording,
}: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const transitionRef = useRef(0);
  const smoothedDataRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const dataArray = analyserNode
      ? new Uint8Array(analyserNode.frequencyBinCount)
      : new Uint8Array(256);

    if (smoothedDataRef.current.length !== dataArray.length) {
      smoothedDataRef.current = new Array(dataArray.length).fill(0);
    }

    // Helper function to draw smooth bezier curves through points
    const drawSmoothCurve = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? i : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 >= points.length ? i + 1 : i + 2];

        const tension = 0.3;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isRecording) {
        analyserNode.getByteFrequencyData(dataArray);

        for (let i = 0; i < dataArray.length; i++) {
          const target = dataArray[i] / 255;
          const current = smoothedDataRef.current[i];
          if (target > current) {
            smoothedDataRef.current[i] = current + (target - current) * 0.6;
          } else {
            smoothedDataRef.current[i] = current + (target - current) * 0.08;
          }
        }
      } else {
        for (let i = 0; i < smoothedDataRef.current.length; i++) {
          smoothedDataRef.current[i] *= 0.92;
        }
      }

      const voiceStart = Math.floor(dataArray.length * 0.03);
      const voiceEnd = Math.floor(dataArray.length * 0.5);
      let voiceSum = 0;
      for (let i = voiceStart; i < voiceEnd; i++) {
        voiceSum += smoothedDataRef.current[i];
      }
      const avgFrequency = voiceSum / (voiceEnd - voiceStart);
      const boostedAvg = Math.min(1, avgFrequency * 4);

      timeRef.current += 0.012;
      const time = timeRef.current;

      const targetTransition = isRecording ? 1 : 0;
      transitionRef.current += (targetTransition - transitionRef.current) * 0.08;
      const transition = transitionRef.current;

      const centerY = height / 2;

      if (transition > 0.01) {
        const waveAlpha = transition;
        const waveHeight = height * 0.35;
        const numPoints = 80;

        // Wave configurations
        const waves = [
          { offset: 0, amplitude: 0.35, speed: 1.2, color1: "59, 130, 246", color2: "99, 102, 241", alpha: 0.25 },
          { offset: 0.8, amplitude: 0.28, speed: -0.9, color1: "236, 72, 153", color2: "192, 38, 211", alpha: 0.35 },
          { offset: 0.5, amplitude: 0.22, speed: 1.5, color1: "139, 92, 246", color2: "168, 85, 247", alpha: 0.45 },
          { offset: 0.3, amplitude: 0.18, speed: -1.1, color1: "45, 212, 191", color2: "56, 189, 248", alpha: 0.6 },
          { offset: 0, amplitude: 0.12, speed: 1.8, color1: "56, 189, 248", color2: "99, 200, 255", alpha: 0.85 },
        ];

        // Draw each wave layer
        for (const wave of waves) {
          const points: { x: number; y: number }[] = [];

          for (let i = 0; i <= numPoints; i++) {
            const normalizedX = i / numPoints;
            const x = normalizedX * width;

            const dataIndex = Math.floor(normalizedX * (dataArray.length * 0.5));
            const freqValue = smoothedDataRef.current[dataIndex] || 0;

            // Smooth wave functions
            const w1 = Math.sin(normalizedX * Math.PI * 2.5 + time * wave.speed + wave.offset);
            const w2 = Math.sin(normalizedX * Math.PI * 4 - time * wave.speed * 0.7 + wave.offset * 1.5);
            const w3 = Math.sin(normalizedX * Math.PI * 1.5 + time * wave.speed * 0.5);

            const combinedWave = w1 * 0.5 + w2 * 0.35 + w3 * 0.15;

            // Audio reactivity with smooth envelope
            const audioMod = 1 + freqValue * 5 + boostedAvg * 4;
            const edgeFade = Math.sin(normalizedX * Math.PI);

            const y = centerY + combinedWave * waveHeight * wave.amplitude * audioMod * edgeFade;
            points.push({ x, y });
          }

          drawSmoothCurve(points);

          const gradient = ctx.createLinearGradient(0, centerY - waveHeight, 0, centerY + waveHeight);
          gradient.addColorStop(0, `rgba(${wave.color1}, ${wave.alpha * waveAlpha})`);
          gradient.addColorStop(0.5, `rgba(${wave.color2}, ${wave.alpha * waveAlpha * 0.9})`);
          gradient.addColorStop(1, `rgba(${wave.color1}, ${wave.alpha * waveAlpha})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          const glowIntensity = 10 + boostedAvg * 20;
          ctx.shadowColor = `rgba(${wave.color1}, 0.5)`;
          ctx.shadowBlur = glowIntensity;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw bright center core
        const corePoints: { x: number; y: number }[] = [];
        for (let i = 0; i <= numPoints; i++) {
          const normalizedX = i / numPoints;
          const x = normalizedX * width;

          const dataIndex = Math.floor(normalizedX * (dataArray.length * 0.4));
          const freqValue = smoothedDataRef.current[dataIndex] || 0;

          const w1 = Math.sin(normalizedX * Math.PI * 2.5 + time * 1.8);
          const w2 = Math.sin(normalizedX * Math.PI * 4 - time * 1.2);

          const audioMod = 1 + freqValue * 6 + boostedAvg * 5;
          const edgeFade = Math.sin(normalizedX * Math.PI);

          const y = centerY + (w1 * 0.6 + w2 * 0.4) * waveHeight * 0.05 * audioMod * edgeFade;
          corePoints.push({ x, y });
        }

        drawSmoothCurve(corePoints);

        const coreGradient = ctx.createLinearGradient(0, 0, width, 0);
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${0.02 * waveAlpha})`);
        coreGradient.addColorStop(0.15, `rgba(255, 255, 255, ${0.6 * waveAlpha})`);
        coreGradient.addColorStop(0.5, `rgba(220, 250, 255, ${0.95 * waveAlpha})`);
        coreGradient.addColorStop(0.85, `rgba(255, 255, 255, ${0.6 * waveAlpha})`);
        coreGradient.addColorStop(1, `rgba(255, 255, 255, ${0.02 * waveAlpha})`);

        ctx.strokeStyle = coreGradient;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx.shadowBlur = 12 + boostedAvg * 25;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyserNode, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
