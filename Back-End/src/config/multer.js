import multer from 'multer';

// Use memory storage to process files before upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit to support larger files like videos/presentations
  },
});

export default upload;
