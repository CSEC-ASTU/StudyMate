import { approximateTokens } from "../../utils/tokenCounter.js";
import { normalizeText } from "../../utils/textNormalizer.js";

export function chunkDocument(text, options = {}) {
    const {
        maxTokens = 180,
        overlapTokens = 30,
    } = options;

    text = normalizeText(text);

    // Step 1: split by paragraphs / sections
    const sections = text.split(/\n(?=[A-Z][^\n]{3,80}\n)/);

    const chunks = [];

    for (const section of sections) {
        const sentences = section.split(/(?<=[.?!])\s+/);

        let buffer = "";
        let tokenCount = 0;

        for (const s of sentences) {
            const t = approximateTokens(s);

            if (tokenCount + t > maxTokens) {
                chunks.push(buffer.trim());

                // overlap
                const overlap = buffer
                    .split(" ")
                    .slice(-overlapTokens)
                    .join(" ");

                buffer = overlap + " " + s;
                tokenCount = approximateTokens(buffer);
            } else {
                buffer += " " + s;
                tokenCount += t;
            }
        }

        if (buffer.trim()) chunks.push(buffer.trim());
    }

    return chunks.filter(Boolean);
}
