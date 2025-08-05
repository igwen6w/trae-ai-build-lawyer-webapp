import express from 'express';
import { body } from 'express-validator';
import {
  getConsultations,
  getConsultationById,
  bookConsultation,
  updateConsultation,
  cancelConsultation,
  completeConsultation,
  getAvailableSlots,
  sendMessage,
  getMessages,
  generateVideoToken,
  updateConsultationStatus
} from '../controllers/consultationController';
import { protect, authorize } from '../middleware/auth';
import { validate, validatePagination, validateUUID } from '../middleware/validation';

const router = express.Router();

// Consultation booking validation
const bookingValidation = [
  body('lawyer_id')
    .isUUID()
    .withMessage('Valid lawyer ID is required'),
  body('type')
    .isIn(['video', 'phone', 'text'])
    .withMessage('Consultation type must be video, phone, or text'),
  body('scheduled_at')
    .isISO8601()
    .withMessage('Valid scheduled date and time is required')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Scheduled time must be in the future');
      }
      return true;
    }),
  body('duration')
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('urgency_level')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Urgency level must be low, medium, high, or urgent')
];

// Update consultation validation
const updateValidation = [
  body('scheduled_at')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date and time is required')
    .custom((value) => {
      if (value) {
        const scheduledDate = new Date(value);
        const now = new Date();
        if (scheduledDate <= now) {
          throw new Error('Scheduled time must be in the future');
        }
      }
      return true;
    }),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('urgency_level')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Urgency level must be low, medium, high, or urgent')
];

// Message validation
const messageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('message_type')
    .optional()
    .isIn(['text', 'file', 'image'])
    .withMessage('Message type must be text, file, or image')
];

// Status update validation
const statusUpdateValidation = [
  body('status')
    .isIn(['confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status')
];

// All routes require authentication
router.use(protect);

// Consultation management
router.get('/', validatePagination, getConsultations);
router.get('/:id', validateUUID('id'), getConsultationById);
router.post('/book', bookingValidation, validate, bookConsultation);
router.put('/:id', validateUUID('id'), updateValidation, validate, updateConsultation);
router.delete('/:id', validateUUID('id'), cancelConsultation);
router.post('/:id/complete', validateUUID('id'), completeConsultation);

// Availability
router.get('/lawyers/:lawyerId/slots', validateUUID('lawyerId'), getAvailableSlots);

// Messaging
router.post('/:id/messages', validateUUID('id'), messageValidation, validate, sendMessage);
router.get('/:id/messages', validateUUID('id'), validatePagination, getMessages);

// Video calling
router.post('/:id/video-token', validateUUID('id'), generateVideoToken);

// Status updates (lawyer only)
router.put('/:id/status', authorize('lawyer'), validateUUID('id'), statusUpdateValidation, validate, updateConsultationStatus);

export default router;