import { qdrant } from "./qdrant.client.js";

export async function initQdrant() {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === "studymate_docs");

    if (!exists) {
        await qdrant.createCollection("studymate_docs", {
            vectors: {
                size: 384,
                distance: "Cosine",
            },
        });
    }

    // Keyword indexes
    const keywordFields = [
        "course_id",
        "semester_id",
        "type",
        "source",
        "lecture_id",
    ];

    for (const field of keywordFields) {
        await qdrant.createPayloadIndex("studymate_docs", {
            field_name: field,
            field_schema: "keyword",
        });
    }

    // Datetime index
    await qdrant.createPayloadIndex("studymate_docs", {
        field_name: "timestamp",
        field_schema: "datetime",
    });

    console.log("✅ Qdrant ready");
}
