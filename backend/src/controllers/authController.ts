import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';
import { AppError } from '../utils/appError';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Generate JWT Token
const generateToken = (id: string): string => {
  const payload = { id };
  const secret = process.env.JWT_SECRET as string;
  const options: any = {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  };
  
  return jwt.sign(payload, secret, options) as string;
};

// Send token response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user.id);

  const options = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE!) || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified,
        avatar: user.avatar
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone, role = 'user' } = req.body;

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role, email_verification_token, email_verification_expire)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, is_verified, avatar, created_at`,
    [name, email, hashedPassword, phone, role, emailVerificationToken, emailVerificationExpire]
  );

  const user = result.rows[0];

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    const message = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Lawyer Platform',
      message
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't fail registration if email fails
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Get user with password
  const result = await pool.query(
    'SELECT id, name, email, password, role, is_verified, avatar FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid credentials', 401));
  }

  const user = result.rows[0];

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const result = await pool.query(
    'SELECT id, name, email FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('No user found with this email', 404));
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save reset token
  await pool.query(
    'UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3',
    [resetPasswordToken, resetPasswordExpire, user.id]
  );

  // Send reset email
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>You have requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset - Lawyer Platform',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    // Clear reset token if email fails
    await pool.query(
      'UPDATE users SET reset_password_token = NULL, reset_password_expire = NULL WHERE id = $1',
      [user.id]
    );

    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const resetToken = req.params.token;

  // Hash the token
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const result = await pool.query(
    'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expire > CURRENT_TIMESTAMP',
    [resetPasswordToken]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  const user = result.rows[0];

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password and clear reset token
  await pool.query(
    'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2',
    [hashedPassword, user.id]
  );

  // Get updated user
  const updatedUser = await pool.query(
    'SELECT id, name, email, role, is_verified, avatar FROM users WHERE id = $1',
    [user.id]
  );

  sendTokenResponse(updatedUser.rows[0], 200, res);
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  // Get user with password
  const result = await pool.query(
    'SELECT id, password FROM users WHERE id = $1',
    [userId]
  );

  const user = result.rows[0];

  // Check current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 400));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2',
    [hashedPassword, userId]
  );

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  const result = await pool.query(
    'SELECT id FROM users WHERE email_verification_token = $1 AND email_verification_expire > CURRENT_TIMESTAMP',
    [token]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  const user = result.rows[0];

  // Update user as verified
  await pool.query(
    'UPDATE users SET is_verified = true, email_verification_token = NULL, email_verification_expire = NULL WHERE id = $1',
    [user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  const result = await pool.query(
    'SELECT id, name, email, is_verified FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return next(new AppError('No user found with this email', 404));
  }

  const user = result.rows[0];

  if (user.is_verified) {
    return next(new AppError('Email is already verified', 400));
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Update user with new token
  await pool.query(
    'UPDATE users SET email_verification_token = $1, email_verification_expire = $2 WHERE id = $3',
    [emailVerificationToken, emailVerificationExpire, user.id]
  );

  // Send verification email
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    const message = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Lawyer Platform',
      message
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    return next(new AppError('Email could not be sent', 500));
  }
});