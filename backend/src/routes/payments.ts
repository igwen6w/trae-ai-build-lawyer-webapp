import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  refundPayment,
  getPaymentStats
} from '../controllers/paymentController';
import { protect, authorize } from '../middleware/auth';
import { validatePagination } from '../middleware/validation';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @route   POST /api/payments/create-intent
// @desc    Create payment intent
// @access  Private
router.post(
  '/create-intent',
  [
    body('consultation_id')
      .isUUID()
      .withMessage('Valid consultation ID is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('currency')
      .optional()
      .isIn(['usd', 'eur', 'gbp', 'cad', 'aud'])
      .withMessage('Invalid currency'),
    body('payment_method')
      .optional()
      .isIn(['card', 'bank_transfer', 'wallet'])
      .withMessage('Invalid payment method')
  ],
  validate,
  createPaymentIntent
);

// @route   POST /api/payments/:id/confirm
// @desc    Confirm payment
// @access  Private
router.post(
  '/:id/confirm',
  [
    body('payment_method_id')
      .notEmpty()
      .withMessage('Payment method ID is required')
  ],
  validate,
  confirmPayment
);

// @route   GET /api/payments
// @desc    Get payment history
// @access  Private
router.get(
  '/',
  validatePagination,
  getPaymentHistory
);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', getPaymentById);

// @route   POST /api/payments/:id/refund
// @desc    Refund payment
// @access  Private/Admin
router.post(
  '/:id/refund',
  authorize('admin'),
  [
    body('reason')
      .notEmpty()
      .withMessage('Refund reason is required'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Refund amount must be greater than 0')
  ],
  validate,
  refundPayment
);

// @route   GET /api/payments/stats
// @desc    Get payment statistics
// @access  Private/Admin
router.get(
  '/admin/stats',
  authorize('admin'),
  getPaymentStats
);

export default router;