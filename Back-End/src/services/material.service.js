import prisma from '../config/prisma.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { generateFileHash } from '../utils/hash.js';

class MaterialService {
  async uploadMaterial(file, data, userId) {
    const { title, universityName, courseName, keywords, courseId, isGlobal } = data;

    // 1. Generate File Hash
    const fileHash = generateFileHash(file.buffer);

    // 2. Deduplication Logic
    let material = await prisma.material.findUnique({
      where: { fileHash },
    });

    let isKnownMaterial = Boolean(material);

    if (!material) {
      // 3. Cloudinary Upload if not found
      const uploadResult = await uploadToCloudinary(file.buffer, file.originalname);
      
      // Derive type from mimetype or originalname extension if needed
      const fileType = file.mimetype.split('/')[1] || 'auto';

      // 4. Create new Material record
      material = await prisma.material.create({
        data: {
          title,
          type: fileType,
          fileUrl: uploadResult.secure_url,
          fileHash,
          universityName,
          courseName,
          keywords,
          uploadedByUserId: userId,
          isGlobal,
        },
      });
    }

    // 5. Course Attachment (many-to-many via CourseMaterial)
    // Use upsert or findFirst to prevent duplicate attachment errors
    const attachment = await prisma.courseMaterial.upsert({
      where: {
        courseId_materialId: {
          courseId,
          materialId: material.id,
        },
      },
      update: {}, // No updates needed if it already exists
      create: {
        courseId,
        materialId: material.id,
      },
    });

    return { material, attachment, isKnownMaterial };
  }

  async searchMaterials(query, excludeMaterialId) {
    const materials = await prisma.material.findMany({
      where: {
        AND: [
          {
            id: { not: excludeMaterialId || undefined },
          },
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { universityName: { contains: query, mode: "insensitive" } },
              { courseName: { contains: query, mode: "insensitive" } },
              { keywords: { has: query } },
            ],
          },
        ],
      },
    });

    return materials;
  } 
}


export default new MaterialService();
export const { uploadMaterial, searchMaterials } = new MaterialService();
