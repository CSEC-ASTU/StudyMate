// lectureMemory.service.js
class LectureMemoryService {
    constructor() {
        this.shortTerm = [];
        this.bufferSize = 5; // or whatever threshold you want
    }

    addChunk(text) {
        this.shortTerm.push({
            text,
            time: Date.now(),
        });

        this.shortTerm = this.shortTerm.filter(
            c => Date.now() - c.time < 15 * 60 * 1000
        );
    }

    getRecentText() {
        return this.shortTerm.map(c => c.text).join(" ");
    }

    // NEW: Check if buffer should be flushed
    shouldFlush() {
        return this.shortTerm.length >= this.bufferSize;
        // Or could be based on time: Date.now() - this.shortTerm[0]?.time > someThreshold
    }

    // NEW: Clear buffer and return all text
    flush() {
        const windowText = this.getRecentText();
        this.shortTerm = []; // Clear the buffer
        return windowText;
    }
}

export default new LectureMemoryService();