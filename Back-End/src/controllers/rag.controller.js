import multer from "multer";
import { ingestText } from "../services/rag/ingestion.service.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import officeparser from "officeparser";

const upload = multer({ storage: multer.memoryStorage() });

async function extractTextFromDoc(buffer) {
    return new Promise((resolve, reject) => {
        officeparser.parseBuffer(buffer, (err, data) => {
            if (err) reject(err);
            else resolve(data || "");
        });
    });
}

export async function ingestFile(req) {
    try {
        if (!req.file) {
            throw new Error("File required");
        }

        const { originalname, buffer } = req.file;
        let text = "";

        if (originalname.endsWith(".pdf")) {
            const pdfDoc = await pdfjsLib.getDocument({
                data: new Uint8Array(buffer),
            }).promise;

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item) => item.str).join(" ") + "\n";
            }
        } else if (originalname.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (originalname.endsWith(".doc")) {
            text = await extractTextFromDoc(buffer);
        } else if (originalname.endsWith(".pptx")) {
            const ast = await officeparser.parseOffice(buffer, {
                ignoreNotes: true,
                newlineDelimiter: "\n\n",
            });

            text = ast.toText();
        } else if (originalname.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            throw new Error("Unsupported file type");
        }

        if (!text.trim()) {
            throw new Error("No text could be extracted from file");
        }

        const count = await ingestText({
            text,
            metadata: req.body.metadata || {},
        });

        return {
            stored_chunks: count,
        };
    } catch (err) {
        console.error("File ingestion error:", err);
        throw err; // 👈 Let controller handle response
    }
}

export async function ingestTextController(req, res) {
    try {
        const { text, metadata } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });

        const count = await ingestText({ text, metadata });
        res.json({ stored_chunks: count });
    } catch (err) {
        console.error("Text ingestion error:", err);
        res.status(500).json({ error: err.message });
    }
}

export async function query(req, res) {
    const { question, filters } = req.body;

    const context = await retrieveContext({ question, filters });

    if (!context.length) {
        return res.json({
            answer: "I don’t have enough verified information to answer that.",
        });
    }

    const answer = await generateAnswer({ question, context });
    res.json({ answer });
}
