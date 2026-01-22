class LectureBufferService {
  constructor() {
    this.buffer = "";
    this.startTime = null;
    this.wordCount = 0;
  }

  /**
   * Appends a new text chunk to the buffer.
   * @param {string} text - The text chunk to append.
   */
  addChunk(text) {
    if (!text) return;

    if (this.buffer.length === 0) {
      this.startTime = Date.now();
    }

    // Add space if buffer is not empty and doesn't already end with space
    if (this.buffer.length > 0 && !this.buffer.endsWith(" ") && !text.startsWith(" ")) {
      this.buffer += " ";
    }

    this.buffer += text;
    this.updateWordCount();
  }

  /**
   * Updates the word count of the current buffer.
   */
  updateWordCount() {
    const cleanText = this.buffer.trim();
    this.wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  }

  /**
   * Checks if the buffer is ready to be flushed based on defined rules.
   * @returns {boolean}
   */
  isReady() {
    if (this.buffer.length === 0) return false;

    // Rule 1: Time-based (8 seconds)
    const timeElapsed = Date.now() - this.startTime;
    if (timeElapsed >= 8000) return true;

    // Rule 2: Length-based (25 words)
    if (this.wordCount >= 25) return true;

    // Rule 3: Sentence-based (ends with ., ?, or !)
    const trimmed = this.buffer.trim();
    const lastChar = trimmed[trimmed.length - 1];
    if (['.', '?', '!'].includes(lastChar)) return true;

    return false;
  }

  /**
   * Returns the full text if ready, resets the buffer, and returns null if not ready.
   * @returns {string|null}
   */
  flushIfReady() {
    if (this.isReady()) {
      const fullText = this.buffer.trim();
      this.reset();
      return fullText;
    }
    return null;
  }

  /**
   * Resets the buffer state.
   */
  reset() {
    this.buffer = "";
    this.startTime = null;
    this.wordCount = 0;
  }
}

// Export as a singleton for the current scope requirements
export default new LectureBufferService();
