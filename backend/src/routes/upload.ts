import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadAvatar,
  uploadDocument,
  uploadChatFile,
  deleteFile,
  getFile
} from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { validateFileUpload } from '../middleware/validation';
import { AppError } from '../utils/appError';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'general';
    
    if (req.path.includes('/avatar')) {
      subfolder = 'avatars';
    } else if (req.path.includes('/document')) {
      subfolder = 'documents';
    } else if (req.path.includes('/chat')) {
      subfolder = 'chat';
    }
    
    const fullPath = path.join(uploadDir, subfolder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}_${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes: { [key: string]: string[] } = {
    avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ],
    chat: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ]
  };

  let category = 'general';
  if (req.path.includes('/avatar')) {
    category = 'avatar';
  } else if (req.path.includes('/document')) {
    category = 'document';
  } else if (req.path.includes('/chat')) {
    category = 'chat';
  }

  if (allowedTypes[category] && allowedTypes[category].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type for ${category}. Allowed types: ${allowedTypes[category]?.join(', ')}`, 400));
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB default
  }
});

// Routes
router.post('/avatar', upload.single('avatar'), validateFileUpload, uploadAvatar);
router.post('/document', upload.single('document'), validateFileUpload, uploadDocument);
router.post('/chat', upload.single('file'), validateFileUpload, uploadChatFile);
router.delete('/:filename', deleteFile);
router.get('/:filename', getFile);

export default router;