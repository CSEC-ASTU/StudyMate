// src/services/googleSearch.service.js

// Import the googleapis library using ES module syntax
import { google } from 'googleapis';

// Retrieve your keys from environment variables (recommended)
const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.GOOGLE_SEARCH_CX;

// Initialize the custom search client
const customsearch = google.customsearch('v1');

/**
 * Performs a web search using the Google Custom Search API.
 * @param {string} query The search term.
 * @returns {Promise<Array>} A list of search results.
 */
export async function searchWeb(query) { // Use 'export' here
    if (!apiKey || !cx) {
        console.error("Missing Google API Key or CX ID in environment variables.");
        // In a real app, you might want to log this error and stop gracefully
        return []; // Return empty array or throw an error
    }

    try {
        const response = await customsearch.cse.list({
            cx: cx,
            q: query, // The search query from your agent
            auth: apiKey, // The API key from Google Cloud Console
            num: 5, // Requesting 5 results
        });

        // This data is the clean JSON you need for your agent
        const searchResults = response.data.items || [];
        return searchResults;

    } catch (error) {
        console.error("Error during Google Search API call:", error.message);
        throw error; // Propagate the error for your agent logic to handle
    }
}
