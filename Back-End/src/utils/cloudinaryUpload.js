import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const sanitizedPublicId = filename 
      ? filename.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, '_') 
      : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'uploads',
        public_id: sanitizedPublicId,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};
