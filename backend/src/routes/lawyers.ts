import express from 'express';
import { body } from 'express-validator';
import {
  getLawyers,
  getLawyerById,
  createLawyerProfile,
  updateLawyerProfile,
  deleteLawyerProfile,
  getLawyerReviews,
  addLawyerReview,
  updateLawyerAvailability,
  searchLawyers,
  getLawyerStats
} from '../controllers/lawyerController';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { validate, validatePagination, validateUUID } from '../middleware/validation';

const router = express.Router();

// Lawyer profile validation
const lawyerProfileValidation = [
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('At least one specialty is required'),
  body('specialties.*')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each specialty must be between 2 and 50 characters'),
  body('experience_years')
    .isInt({ min: 0, max: 70 })
    .withMessage('Experience years must be between 0 and 70'),
  body('education')
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Education must be between 10 and 500 characters'),
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  body('hourly_rate')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),
  body('office_address')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Office address must not exceed 200 characters'),
  body('consultation_types')
    .optional()
    .isArray()
    .withMessage('Consultation types must be an array')
];

// Review validation
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
];

// Availability validation
const availabilityValidation = [
  body('available_days')
    .isArray({ min: 1 })
    .withMessage('At least one available day is required'),
  body('available_days.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('available_hours')
    .isObject()
    .withMessage('Available hours must be an object'),
  body('available_hours.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('available_hours.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

// Test route without middleware
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test route working' });
});

// Public routes
router.get('/', optionalAuth, validatePagination, getLawyers);
router.get('/simple', getLawyers);
router.get('/search', optionalAuth, validatePagination, searchLawyers);
router.get('/:id', optionalAuth, validateUUID('id'), getLawyerById);
router.get('/:id/reviews', validateUUID('id'), validatePagination, getLawyerReviews);

// Protected routes
router.use(protect);

// Lawyer profile management
router.post('/profile', authorize('lawyer'), lawyerProfileValidation, validate, createLawyerProfile);
router.put('/profile', authorize('lawyer'), lawyerProfileValidation, validate, updateLawyerProfile);
router.delete('/profile', authorize('lawyer'), deleteLawyerProfile);
router.put('/availability', authorize('lawyer'), availabilityValidation, validate, updateLawyerAvailability);

// Reviews
router.post('/:id/reviews', validateUUID('id'), reviewValidation, validate, addLawyerReview);

// Admin routes
router.get('/:id/stats', authorize('admin'), validateUUID('id'), getLawyerStats);

export default router;