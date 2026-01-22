import fetch from 'node-fetch';
import { config } from '../config/server.js';

export class GroqAPIClient {
  constructor() {
    this.apiKey = config.groq.apiKey;
    this.apiUrl = config.groq.apiUrl;
    this.model = config.groq.model;
  }

  async chatCompletion(messages, options = {}) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    const body = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Groq API Error:', error);
      throw error;
    }
  }
}

export const groqClient = new GroqAPIClient();