import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const prisma = new PrismaClient();

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Calculate file hash (SHA-256) for deduplication
    const hashSum = crypto.createHash('sha256');
    hashSum.update(req.file.buffer);
    const fileHash = hashSum.digest('hex');

    // 2. Check if file already exists in DB
    const existingMaterial = await prisma.material.findUnique({
      where: { fileHash },
    });

    if (existingMaterial) {
      return res.status(200).json({
        message: 'File already exists',
        material: existingMaterial,
      });
    }

    // 3. Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // 4. Save to Database
    const { title, universityName, courseName, keywords, isGlobal, type } = req.body;
    // Assuming auth middleware populates req.user
    const uploadedByUserId = req.user?.id; 

    if (!uploadedByUserId) {
        return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const newMaterial = await prisma.material.create({
      data: {
        title: title || req.file.originalname,
        type: type || 'auto', // You might want to derive this from mimetype
        fileUrl: result.secure_url,
        fileHash: fileHash,
        universityName: universityName || null,
        courseName: courseName || null,
        keywords: keywords ? (Array.isArray(keywords) ? keywords : [keywords]) : [],
        uploadedByUserId: uploadedByUserId,
        isGlobal: isGlobal === 'true' || isGlobal === true,
      },
    });

    // Return formatted JSON response
    return res.status(201).json({
      message: 'File uploaded and saved successfully',
      material: newMaterial,
      cloudinary: {
        public_id: result.public_id,
        resource_type: result.resource_type,
        mime_type: req.file.mimetype,
        size: req.file.size,
      }
    });

  } catch (error) {
    console.error('Upload Controller Error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
};


