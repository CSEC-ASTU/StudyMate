export default function highlightPrompt(text) {
  return `
You are an academic assistant.

Analyze the lecture chunk below.

Determine if it contains:
- a new concept
- a definition
- a formula
- an important example

If yes, extract it.

Respond ONLY in valid JSON:

{
  "isHighlight": boolean,
  "type": "concept|definition|formula|example|null",
  "title": string|null,
  "excerpt": string|null,
  "confidence": number (0 to 1)
}

Lecture chunk:
"${text}"
`;
}
