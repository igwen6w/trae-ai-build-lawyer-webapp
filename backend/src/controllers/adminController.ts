import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminModel, AdminLogModel, SystemSettingModel } from '../models/Admin';
import { UserModel } from '../models/User';
import { LawyerModel } from '../models/Lawyer';
import { ConsultationModel } from '../models/Consultation';
import { PaymentModel } from '../models/Payment';
import { ReviewModel } from '../models/Review';
import { pool } from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from '../middleware/errorHandler';
import { AdminRequest } from '../types';

// Admin login
export const adminLogin = catchAsync(async (req: AdminRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('请提供邮箱和密码', 400);
  }

  // Find user by email
  const user = await UserModel.findByEmailWithPassword(email);
  if (!user) {
    throw new AppError('邮箱或密码错误', 401);
  }

  // Check password
  const isPasswordValid = await UserModel.comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('邮箱或密码错误', 401);
  }

  // Check if user is admin
  const admin = await AdminModel.findByUserId(user.id);
  if (!admin) {
    throw new AppError('无管理员权限', 403);
  }

  if (!admin.is_active) {
    throw new AppError('管理员账户已被禁用', 403);
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || 'default_secret_key_for_development';
  const token = jwt.sign(
    { id: user.id }, 
    jwtSecret,
    { expiresIn: '2h' }
  );

  // Update last login
  await AdminModel.updateLastLogin(admin.id);

  // Log login action
  await AdminLogModel.create({
    admin_id: admin.id,
    action: 'admin_login',
    details: { email },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  // Set cookie
  res.cookie('admin_token', token, {
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    message: '登录成功',
    data: {
      token,
      admin: {
        id: admin.id,
        role: admin.role,
        permissions: admin.permissions,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      }
    }
  });
});

// Admin logout
export const adminLogout = catchAsync(async (req: AdminRequest, res: Response) => {
  if (req.admin) {
    await AdminLogModel.create({
      admin_id: req.admin.id,
      action: 'admin_logout',
      details: {},
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });
  }

  res.cookie('admin_token', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: '退出登录成功'
  });
});

// Get dashboard statistics
export const getDashboardStats = catchAsync(async (req: AdminRequest, res: Response) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Get basic counts
  const [usersResult, lawyersResult, consultationsResult, paymentsResult] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
    pool.query('SELECT COUNT(*) as count FROM lawyers'),
    pool.query('SELECT COUNT(*) as count FROM consultations'),
    pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = \'completed\'')
  ]);

  // Get today's statistics
  const [todayConsultationsResult, todayRevenueResult, todayUsersResult] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM consultations WHERE created_at >= $1', [startOfDay]),
    pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = \'completed\' AND created_at >= $1', [startOfDay]),
    pool.query('SELECT COUNT(*) as count FROM users WHERE created_at >= $1', [startOfDay])
  ]);

  // Get monthly statistics
  const [monthlyRevenueResult, monthlyConsultationsResult] = await Promise.all([
    pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = \'completed\' AND created_at >= $1', [startOfMonth]),
    pool.query('SELECT COUNT(*) as count FROM consultations WHERE created_at >= $1', [startOfMonth])
  ]);

  // Get pending items
  const [pendingLawyersResult, pendingReviewsResult] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM lawyers'),
    pool.query('SELECT COUNT(*) as count FROM reviews')
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalLawyers: parseInt(lawyersResult.rows[0].count),
        totalConsultations: parseInt(consultationsResult.rows[0].count),
        totalRevenue: parseFloat(paymentsResult.rows[0].total || '0')
      },
      today: {
        consultations: parseInt(todayConsultationsResult.rows[0].count),
        revenue: parseFloat(todayRevenueResult.rows[0].total || '0'),
        newUsers: parseInt(todayUsersResult.rows[0].count)
      },
      monthly: {
        revenue: parseFloat(monthlyRevenueResult.rows[0].total || '0'),
        consultations: parseInt(monthlyConsultationsResult.rows[0].count)
      },
      totals: {
        lawyers: parseInt(pendingLawyersResult.rows[0].count),
        reviews: parseInt(pendingReviewsResult.rows[0].count)
      }
    }
  });
});

// Get dashboard charts data
export const getDashboardCharts = catchAsync(async (req: AdminRequest, res: Response) => {
  const { period = '7d' } = req.query;
  
  let days: number;
  switch (period) {
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    default:
      days = 7;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get daily statistics
  const dailyStatsQuery = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as consultations,
      COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as revenue
    FROM consultations c
    LEFT JOIN payments p ON c.payment_id = p.id
    WHERE c.created_at >= $1
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const dailyStats = await pool.query(dailyStatsQuery, [startDate]);

  // Get user registration trend
  const userTrendQuery = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_users
    FROM users
    WHERE created_at >= $1
    GROUP BY DATE(created_at)
    ORDER BY date
  `;

  const userTrend = await pool.query(userTrendQuery, [startDate]);

  // Get consultation status distribution
  const statusDistQuery = `
    SELECT 
      status,
      COUNT(*) as count
    FROM consultations
    WHERE created_at >= $1
    GROUP BY status
  `;

  const statusDist = await pool.query(statusDistQuery, [startDate]);

  res.status(200).json({
    success: true,
    data: {
      dailyStats: dailyStats.rows,
      userTrend: userTrend.rows,
      statusDistribution: statusDist.rows
    }
  });
});

// Get all users with pagination
export const getUsers = catchAsync(async (req: AdminRequest, res: Response) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClause = 'WHERE 1=1';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (role) {
    whereClause += ` AND role = $${paramIndex}`;
    queryParams.push(role);
    paramIndex++;
  }

  if (status) {
    whereClause += ` AND is_active = $${paramIndex}`;
    queryParams.push(status === 'active');
    paramIndex++;
  }

  const usersQuery = `
    SELECT id, name, email, phone, role, avatar, is_verified, is_active, created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM users
    ${whereClause}
  `;

  const [users, count] = await Promise.all([
    pool.query(usersQuery, [...queryParams, Number(limit), offset]),
    pool.query(countQuery, queryParams)
  ]);

  const total = parseInt(count.rows[0].total);
  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      users: users.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    }
  });
});

// Get user details
export const getUserDetails = catchAsync(async (req: AdminRequest, res: Response) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  // Get user's consultations
  const consultationsQuery = `
    SELECT c.*, l.user_id as lawyer_user_id, u.name as lawyer_name
    FROM consultations c
    LEFT JOIN lawyers l ON c.lawyer_id = l.id
    LEFT JOIN users u ON l.user_id = u.id
    WHERE c.client_id = $1
    ORDER BY c.created_at DESC
    LIMIT 10
  `;

  const consultations = await pool.query(consultationsQuery, [id]);

  // Get user's payments
  const payments = await pool.query(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
    [id]
  );

  res.status(200).json({
    success: true,
    data: {
      user,
      consultations: consultations.rows,
      payments: payments.rows
    }
  });
});

// Update user status
export const updateUserStatus = catchAsync(async (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  await UserModel.updateStatus(id, is_active);

  // Log action
  await AdminLogModel.create({
    admin_id: req.admin!.id,
    action: is_active ? 'user_activate' : 'user_deactivate',
    target_type: 'user',
    target_id: id,
    details: { previous_status: user.is_active, new_status: is_active },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: `用户已${is_active ? '激活' : '禁用'}`,
    data: { is_active }
  });
});

// Get system settings
export const getSystemSettings = catchAsync(async (req: AdminRequest, res: Response) => {
  const { category } = req.query;

  let settings;
  if (category) {
    settings = await SystemSettingModel.findByCategory(category as string);
  } else {
    settings = await SystemSettingModel.findAll();
  }

  const categories = await SystemSettingModel.getCategories();

  res.status(200).json({
    success: true,
    data: {
      settings,
      categories
    }
  });
});

// Get all lawyers with pagination
export const getLawyers = catchAsync(async (req: AdminRequest, res: Response) => {
  const { page = 1, limit = 10, search, status, specialization } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClause = 'WHERE 1=1';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    whereClause += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR l.license_number ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (status) {
    if (status === 'active') {
      whereClause += ` AND u.is_active = $${paramIndex}`;
      queryParams.push(true);
    } else if (status === 'inactive') {
      whereClause += ` AND u.is_active = $${paramIndex}`;
      queryParams.push(false);
    }
    paramIndex++;
  }

  if (specialization) {
    whereClause += ` AND l.specialties::text ILIKE $${paramIndex}`;
    queryParams.push(`%${specialization}%`);
    paramIndex++;
  }

  const lawyersQuery = `
    SELECT 
      l.id, l.user_id, l.specialties, l.experience, l.education, 
      l.license_number, l.location, l.hourly_rate, l.bio, l.languages,
      l.rating, l.review_count, l.created_at, l.updated_at,
      u.name, u.email, u.phone, u.avatar, u.is_active, u.is_verified
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    ${whereClause}
  `;

  const [lawyers, count] = await Promise.all([
    pool.query(lawyersQuery, [...queryParams, Number(limit), offset]),
    pool.query(countQuery, queryParams)
  ]);

  // Parse JSON fields for each lawyer
  const parsedLawyers = lawyers.rows.map(lawyer => ({
    ...lawyer,
    specialties: typeof lawyer.specialties === 'string' ? JSON.parse(lawyer.specialties) : lawyer.specialties,
    languages: typeof lawyer.languages === 'string' ? JSON.parse(lawyer.languages) : lawyer.languages
  }));

  const total = parseInt(count.rows[0].total);
  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      lawyers: parsedLawyers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    }
  });
});

// Get lawyer details
export const getLawyerDetails = catchAsync(async (req: AdminRequest, res: Response) => {
  const { id } = req.params;

  const lawyerQuery = `
    SELECT 
      l.*, u.name, u.email, u.phone, u.avatar, u.is_active, u.is_verified as user_verified
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    WHERE l.id = $1
  `;

  const lawyerResult = await pool.query(lawyerQuery, [id]);
  
  if (lawyerResult.rows.length === 0) {
    throw new AppError('律师不存在', 404);
  }

  const lawyer = lawyerResult.rows[0];
  // Parse JSON fields
  lawyer.specialties = typeof lawyer.specialties === 'string' ? JSON.parse(lawyer.specialties) : lawyer.specialties;
  lawyer.languages = typeof lawyer.languages === 'string' ? JSON.parse(lawyer.languages) : lawyer.languages;
  lawyer.availability = typeof lawyer.availability === 'string' ? JSON.parse(lawyer.availability) : lawyer.availability;

  // Get lawyer's consultations
  const consultationsQuery = `
    SELECT c.*, u.name as client_name
    FROM consultations c
    LEFT JOIN users u ON c.client_id = u.id
    WHERE c.lawyer_id = $1
    ORDER BY c.created_at DESC
    LIMIT 10
  `;

  const consultations = await pool.query(consultationsQuery, [id]);

  // Get lawyer's reviews
  const reviewsQuery = `
    SELECT r.*, u.name as client_name
    FROM reviews r
    LEFT JOIN users u ON r.client_id = u.id
    WHERE r.lawyer_id = $1
    ORDER BY r.created_at DESC
    LIMIT 10
  `;

  const reviews = await pool.query(reviewsQuery, [id]);

  res.status(200).json({
    success: true,
    data: {
      lawyer,
      consultations: consultations.rows,
      reviews: reviews.rows
    }
  });
});

// Update lawyer status
export const updateLawyerStatus = catchAsync(async (req: AdminRequest, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const lawyerQuery = `
    SELECT l.*, u.is_active as current_status
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    WHERE l.id = $1
  `;
  const lawyerResult = await pool.query(lawyerQuery, [id]);
  
  if (lawyerResult.rows.length === 0) {
    throw new AppError('律师不存在', 404);
  }

  const lawyer = lawyerResult.rows[0];
  const isActive = status === 'active';

  // Update user status (since lawyer status is based on user is_active)
  const updateQuery = `
    UPDATE users 
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;

  await pool.query(updateQuery, [isActive, lawyer.user_id]);

  // Log action
  await AdminLogModel.create({
    admin_id: req.admin!.id,
    action: `lawyer_status_${status}`,
    target_type: 'lawyer',
    target_id: id,
    details: { 
      previous_status: lawyer.current_status ? 'active' : 'inactive', 
      new_status: status,
      reason: reason || ''
    },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: `律师状态已更新为${status}`,
    data: { status }
  });
});

// Update system setting
export const updateSystemSetting = catchAsync(async (req: AdminRequest, res: Response) => {
  const { key } = req.params;
  const { value, description } = req.body;

  const setting = await SystemSettingModel.findByKey(key);
  if (!setting) {
    throw new AppError('系统设置不存在', 404);
  }

  const updatedSetting = await SystemSettingModel.updateByKey(key, {
    value,
    description,
    updated_by: req.admin!.id
  });

  // Log action
  await AdminLogModel.create({
    admin_id: req.admin!.id,
    action: 'system_setting_update',
    target_type: 'system_setting',
    target_id: setting.id,
    details: { key, previous_value: setting.value, new_value: value },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: '系统设置更新成功',
    data: updatedSetting
  });
});

// Get admin logs
export const getAdminLogs = catchAsync(async (req: AdminRequest, res: Response) => {
  const { page = 1, limit = 50, action, admin_id } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClause = 'WHERE 1=1';
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (action) {
    whereClause += ` AND al.action = $${paramIndex}`;
    queryParams.push(action);
    paramIndex++;
  }

  if (admin_id) {
    whereClause += ` AND al.admin_id = $${paramIndex}`;
    queryParams.push(admin_id);
    paramIndex++;
  }

  const logsQuery = `
    SELECT al.*, u.name as admin_name, u.email as admin_email
    FROM admin_logs al
    LEFT JOIN admins a ON al.admin_id = a.id
    LEFT JOIN users u ON a.user_id = u.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM admin_logs al
    ${whereClause.replace('al.', 'admin_logs.')}
  `;

  const [logs, count] = await Promise.all([
    pool.query(logsQuery, [...queryParams, Number(limit), offset]),
    pool.query(countQuery, queryParams)
  ]);

  const total = parseInt(count.rows[0].total);
  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      logs: logs.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    }
  });
});