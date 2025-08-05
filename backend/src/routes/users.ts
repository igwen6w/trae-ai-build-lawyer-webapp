import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  uploadAvatar,
  getUsers,
  getUserById,
  updateUserRole
} from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';
import { validate, validatePagination, validateUUID } from '../middleware/validation';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer configuration for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Profile validation
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters')
];

// Role update validation
const updateRoleValidation = [
  body('role')
    .isIn(['user', 'lawyer', 'admin'])
    .withMessage('Role must be user, lawyer, or admin')
];

// Public routes (with optional auth)

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.delete('/account', deleteAccount);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, getUsers);
router.get('/:id', authorize('admin'), validateUUID('id'), getUserById);
router.put('/:id/role', authorize('admin'), validateUUID('id'), updateRoleValidation, validate, updateUserRole);

export default router;