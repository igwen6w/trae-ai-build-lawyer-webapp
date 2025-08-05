import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, NotFoundError } from '../utils/appError';
import fs from 'fs';
import path from 'path';

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

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const result = await pool.query(
    `SELECT id, name, email, phone, role, bio, location, avatar, is_verified, 
            created_at, updated_at, last_login
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  const user = result.rows[0];

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      location: user.location,
      avatar: user.avatar,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, phone, bio, location } = req.body;

  // Build dynamic query
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount}`);
    values.push(name);
    paramCount++;
  }

  if (phone !== undefined) {
    updates.push(`phone = $${paramCount}`);
    values.push(phone);
    paramCount++;
  }

  if (bio !== undefined) {
    updates.push(`bio = $${paramCount}`);
    values.push(bio);
    paramCount++;
  }

  if (location !== undefined) {
    updates.push(`location = $${paramCount}`);
    values.push(location);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, name, email, phone, role, bio, location, avatar, is_verified, updated_at
  `;

  const result = await pool.query(query, values);
  const user = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      location: user.location,
      avatar: user.avatar,
      isVerified: user.is_verified,
      updatedAt: user.updated_at
    }
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // Get user's avatar to delete file
  const userResult = await pool.query(
    'SELECT avatar FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  const user = userResult.rows[0];

  // Delete user from database
  await pool.query('DELETE FROM users WHERE id = $1', [userId]);

  // Delete avatar file if exists
  if (user.avatar) {
    const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(user.avatar));
    if (fs.existsSync(avatarPath)) {
      fs.unlinkSync(avatarPath);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  // Get current avatar to delete old file
  const currentUser = await pool.query(
    'SELECT avatar FROM users WHERE id = $1',
    [userId]
  );

  const oldAvatar = currentUser.rows[0]?.avatar;

  // Update user with new avatar path
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  
  const result = await pool.query(
    'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING avatar',
    [avatarUrl, userId]
  );

  // Delete old avatar file if exists
  if (oldAvatar) {
    const oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', path.basename(oldAvatar));
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatar: result.rows[0].avatar
    }
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page, limit, offset, sort, order } = req.pagination!;
  const { search, role, verified } = req.query;

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (search) {
    conditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
    values.push(`%${search}%`);
    paramCount++;
  }

  if (role) {
    conditions.push(`role = $${paramCount}`);
    values.push(role);
    paramCount++;
  }

  if (verified !== undefined) {
    conditions.push(`is_verified = $${paramCount}`);
    values.push(verified === 'true');
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Get users with pagination
  const query = `
    SELECT id, name, email, phone, role, bio, location, avatar, is_verified, 
           created_at, updated_at, last_login
    FROM users 
    ${whereClause}
    ORDER BY ${sort} ${order}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);
  const result = await pool.query(query, values);

  const users = result.rows.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    bio: user.bio,
    location: user.location,
    avatar: user.avatar,
    isVerified: user.is_verified,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login
  }));

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT id, name, email, phone, role, bio, location, avatar, is_verified, 
            created_at, updated_at, last_login
     FROM users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  const user = result.rows[0];

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      bio: user.bio,
      location: user.location,
      avatar: user.avatar,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login
    }
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const result = await pool.query(
    'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role',
    [role, id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }

  const user = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});