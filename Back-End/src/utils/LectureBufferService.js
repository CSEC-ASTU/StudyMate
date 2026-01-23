class LectureBufferService {
  constructor() {
    this.buffer = "";
    this.startTime = null;
    this.wordCount = 0;
  }

  addChunk(text) {
    if (!text) return;

    if (this.buffer.length === 0) {
      this.startTime = Date.now();
    }

    if (
      this.buffer.length > 0 &&
      !this.buffer.endsWith(" ") &&
      !text.startsWith(" ")
    ) {
      this.buffer += " ";
    }

    this.buffer += text;
    this.updateWordCount();
  }

  updateWordCount() {
    const cleanText = this.buffer.trim();
    this.wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  }

  isReady() {
    if (this.buffer.length === 0) return false;

    const timeElapsed = Date.now() - this.startTime;
    if (timeElapsed >= 8000) return true;

    if (this.wordCount >= 25) return true;

    const trimmed = this.buffer.trim();
    const lastChar = trimmed[trimmed.length - 1];

    if ([".", "?", "!"].includes(lastChar)) return true;

    return false;
  }

  flushIfReady() {
    if (this.isReady()) {
      const fullText = this.buffer.trim();
      this.reset();
      return fullText;
    }
    return null;
  }

  reset() {
    this.buffer = "";
    this.startTime = null;
    this.wordCount = 0;
  }
}

export default new LectureBufferService();
