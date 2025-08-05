import { Request, Response } from 'express';
import Stripe from 'stripe';
import { pool } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, NotFoundError, ConflictError } from '../utils/appError';
import { sendTemplatedEmail, emailTemplates } from '../services/emailService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    isVerified: boolean;
  };
  pagination?: {
    page: number;
    limit: number;
    offset: number;
    sort: string;
    order: 'ASC' | 'DESC';
  };
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    consultation_id,
    amount,
    currency = 'usd',
    payment_method = 'card'
  } = req.body;

  // Verify consultation exists and belongs to user
  const consultationResult = await pool.query(
    `SELECT c.*, l.hourly_rate, u.name as lawyer_name, u.email as lawyer_email
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     JOIN users u ON l.user_id = u.id
     WHERE c.id = $1 AND c.client_id = $2`,
    [consultation_id, userId]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Calculate amount if not provided
  const finalAmount = amount || (consultation.hourly_rate * consultation.duration / 60);

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency,
      payment_method_types: [payment_method],
      metadata: {
        consultation_id: consultation_id.toString(),
        user_id: userId
      }
    });

    // Store payment record
    await pool.query(
      `INSERT INTO payments (consultation_id, user_id, amount, currency, stripe_payment_intent_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [consultation_id, userId, finalAmount, currency, paymentIntent.id]
    );

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: finalAmount
      }
    });
  } catch (error) {
    throw new AppError('Failed to create payment intent', 500);
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const { payment_intent_id } = req.body;
  const userId = req.user!.id;

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status in database
      const result = await pool.query(
        `UPDATE payments 
         SET status = 'completed', stripe_payment_method_id = $1, completed_at = NOW()
         WHERE stripe_payment_intent_id = $2 AND user_id = $3
         RETURNING *`,
        [paymentIntent.payment_method, payment_intent_id, userId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Payment not found');
      }

      const payment = result.rows[0];

      // Update consultation status to confirmed
      await pool.query(
        'UPDATE consultations SET status = \'confirmed\' WHERE id = $1',
        [payment.consultation_id]
      );

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount
        }
      });
    } else {
      throw new AppError('Payment not successful', 400);
    }
  } catch (error) {
    throw new AppError('Failed to confirm payment', 500);
  }
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { page, limit, offset } = req.pagination!;

  // Get total count
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM payments WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count);

  // Get payments with consultation details
  const result = await pool.query(
    `SELECT 
      p.id, p.amount, p.currency, p.status, p.created_at, p.completed_at,
      c.type, c.scheduled_at, c.duration,
      u.name as lawyer_name
    FROM payments p
    JOIN consultations c ON p.consultation_id = c.id
    JOIN lawyers l ON c.lawyer_id = l.id
    JOIN users u ON l.user_id = u.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const payments = result.rows.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    createdAt: payment.created_at,
    completedAt: payment.completed_at,
    consultation: {
      type: payment.type,
      scheduledAt: payment.scheduled_at,
      durationMinutes: payment.duration,
      lawyerName: payment.lawyer_name
    }
  }));

  res.status(200).json({
    success: true,
    data: payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  let query = `
    SELECT 
      p.*, 
      c.type, c.scheduled_at, c.duration,
      u.name as lawyer_name, u.email as lawyer_email,
      client.name as client_name, client.email as client_email
    FROM payments p
    JOIN consultations c ON p.consultation_id = c.id
    JOIN lawyers l ON c.lawyer_id = l.id
    JOIN users u ON l.user_id = u.id
    JOIN users client ON p.user_id = client.id
    WHERE p.id = $1`;
  
  const params = [id];
  
  // Add authorization filter
  if (userRole !== 'admin') {
    if (userRole === 'lawyer') {
      query += ' AND l.user_id = $2';
    } else {
      query += ' AND p.user_id = $2';
    }
    params.push(userId);
  }

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    throw new NotFoundError('Payment not found');
  }

  const payment = result.rows[0];

  res.status(200).json({
    success: true,
    data: {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      stripePaymentIntentId: payment.stripe_payment_intent_id,
      createdAt: payment.created_at,
      completedAt: payment.completed_at,
      consultation: {
        id: payment.consultation_id,
        type: payment.type,
        scheduledAt: payment.scheduled_at,
        durationMinutes: payment.duration
      },
      lawyer: {
        name: payment.lawyer_name,
        email: payment.lawyer_email
      },
      client: {
        name: payment.client_name,
        email: payment.client_email
      }
    }
  });
});

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
export const refundPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Get payment details
  const paymentResult = await pool.query(
    'SELECT * FROM payments WHERE id = $1 AND status = \'completed\'',
    [id]
  );

  if (paymentResult.rows.length === 0) {
    throw new NotFoundError('Payment not found or not eligible for refund');
  }

  const payment = paymentResult.rows[0];

  try {
    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      reason: 'requested_by_customer',
      metadata: {
        reason: reason || 'Admin refund'
      }
    });

    // Update payment status
    await pool.query(
      'UPDATE payments SET status = \'refunded\', refunded_at = NOW() WHERE id = $1',
      [id]
    );

    // Update consultation status
    await pool.query(
      'UPDATE consultations SET status = \'cancelled\' WHERE id = $1',
      [payment.consultation_id]
    );

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    throw new AppError('Failed to process refund', 500);
  }
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
export const getPaymentStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const { period = '30' } = req.query;
  const days = parseInt(period as string);

  // Get payment statistics
  const statsResult = await pool.query(
    `SELECT 
      COUNT(*) as total_payments,
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
      SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as total_refunded,
      AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_payment
    FROM payments 
    WHERE created_at >= NOW() - INTERVAL '${days} days'`
  );

  const stats = statsResult.rows[0];

  // Get daily revenue for the period
  const dailyRevenueResult = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue,
      COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END) as payments
    FROM payments 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date`
  );

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalPayments: parseInt(stats.total_payments),
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        completedPayments: parseInt(stats.completed_payments),
        totalRefunded: parseFloat(stats.total_refunded) || 0,
        averagePayment: parseFloat(stats.average_payment) || 0
      },
      dailyRevenue: dailyRevenueResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        payments: parseInt(row.payments)
      }))
    }
  });
});