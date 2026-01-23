// src/utils/confidence.util.js

export function computeConfidence({ similarities, contextCount, selfRated }) {
    const similarityScore =
        similarities.reduce((a, b) => a + b, 0) / similarities.length;

    const coverageScore = Math.min(contextCount / 4, 1);

    const modelScore = selfRated ?? 0.7;

    const confidence =
        similarityScore * 0.4 +
        coverageScore * 0.3 +
        modelScore * 0.3;

    return Number(confidence.toFixed(2));
}
