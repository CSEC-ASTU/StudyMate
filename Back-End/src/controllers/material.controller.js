import MaterialService from "../services/material.service.js";
import { materialUploadSchema } from "../validators/material.validator.js";
import { ingestFile } from "../controllers/rag.controller.js";

export const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1. Validate request with Zod
    const validationResult = materialUploadSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: JSON.parse(validationResult.error?.message),
      });
    }

    const { material, attachment, isKnownMaterial } =
      await MaterialService.uploadMaterial(
        req.file,
        validationResult.data,
        req.user.id
      );

    console.log("Material uploaded:", material);

    // Optionally ingest the file content for RAG if it's a new material
    let count;
    if (!isKnownMaterial) {
      req.body.metadata = {
        materialId: material.id,
        uploadedByUserId: req.user.id,
        title: material.title,
        courseId: validationResult.data.courseId,
      };

      count = await ingestFile(req);
    }

    return res.status(201).json({
      message: "Material processed successfully",
      material,
      attachment,
      isKnownMaterial,
      stored_chunks: count ? count.stored_chunks : 0,
    });
  } catch (error) {
    console.error("Material Controller Error:", error);
    return res.status(500).json({
      error: "Failed to process material",
      details: error.message,
    });
  }
};
