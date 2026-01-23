import fetch from "node-fetch";

export async function searchWeb(query) {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        throw new Error("SERPER_API_KEY is missing");
    }

    const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            q: query,
            num: 5,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.message || "Serper API error");
    }

    // Return only organic results (perfect for RAG)
    return data.organic || [];
}
