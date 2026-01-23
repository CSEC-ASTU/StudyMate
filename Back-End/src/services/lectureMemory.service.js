class LectureMemoryService {
    constructor() {
        this.shortTerm = [];
    }

    add(text) {
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
}

export default new LectureMemoryService();
