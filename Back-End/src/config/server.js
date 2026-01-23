export const config = {
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    apiUrl: process.env.GROQ_API_URL,
    model: process.env.GROQ_MODEL,
    timeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3
  },
  huggingface: {
    token: process.env.HF_TOKEN
  },
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};