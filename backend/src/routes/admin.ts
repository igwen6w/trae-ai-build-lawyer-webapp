import express, { Request, Response, NextFunction } from 'express';
import {
  adminLogin,
  adminLogout,
  getDashboardStats,
  getDashboardCharts,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getLawyers,
  getLawyerDetails,
  updateLawyerStatus,
  createLawyer,
  updateLawyer,
  getSystemSettings,
  updateSystemSetting,
  getAdminLogs
} from '../controllers/adminController';
import {
  adminProtect,
  adminAuthorize,
  adminPermission,
  superAdminOnly,
  logAdminAction,
  adminRateLimit
} from '../middleware/adminAuth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';
import { AdminRequest } from '../types';

const router = express.Router();

// Authentication routes
router.post('/login', 
  adminRateLimit,
  [
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位')
  ],
  validateRequest,
  adminLogin
);

router.post('/logout', adminLogout);

// Protected routes - require admin authentication
router.use(adminProtect);

// Dashboard routes
router.get('/dashboard/stats', 
  adminPermission(['dashboard:read']),
  getDashboardStats
);

router.get('/dashboard/charts',
  adminPermission(['dashboard:read']),
  [
    query('period').optional().isIn(['7d', '30d', '90d']).withMessage('时间周期必须是7d、30d或90d')
  ],
  validateRequest,
  getDashboardCharts
);

// User management routes
router.get('/users',
  adminPermission(['users:read']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('search').optional().isLength({ max: 100 }).withMessage('搜索关键词不能超过100字符'),
    query('role').optional().custom((value) => {
      if (!value || value === '') return true;
      return ['client', 'lawyer'].includes(value);
    }).withMessage('角色必须是client或lawyer'),
    query('status').optional().custom((value) => {
      if (!value || value === '') return true;
      return ['active', 'inactive'].includes(value);
    }).withMessage('状态必须是active或inactive')
  ],
  validateRequest,
  getUsers
);

router.get('/users/:id',
  adminPermission(['users:read']),
  [
    param('id').isUUID().withMessage('用户ID格式无效')
  ],
  validateRequest,
  getUserDetails
);

router.patch('/users/:id/status',
  adminPermission(['users:write']),
  logAdminAction,
  [
    param('id').isUUID().withMessage('用户ID格式无效'),
    body('is_active').isBoolean().withMessage('状态必须是布尔值')
  ],
  validateRequest,
  updateUserStatus
);

// Lawyer management routes
router.get('/lawyers',
  adminPermission(['lawyers:read']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('search').optional().isLength({ max: 100 }).withMessage('搜索关键词不能超过100字符'),
    query('status').optional().custom((value) => {
      if (!value || value === '') return true;
      return ['pending', 'approved', 'rejected'].includes(value);
    }).withMessage('状态无效'),
    query('specialization').optional().isLength({ max: 50 }).withMessage('专业领域不能超过50字符')
  ],
  validateRequest,
  getLawyers
);

router.get('/lawyers/:id',
  adminPermission(['lawyers:read']),
  [
    param('id').isUUID().withMessage('律师ID格式无效')
  ],
  validateRequest,
  getLawyerDetails
);

router.patch('/lawyers/:id/status',
  adminPermission(['lawyers:write']),
  logAdminAction,
  [
    param('id').isUUID().withMessage('律师ID格式无效'),
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('状态无效'),
    body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500字符')
  ],
  validateRequest,
  updateLawyerStatus
);

router.post('/lawyers',
  adminPermission(['lawyers:write']),
  logAdminAction,
  [
    body('name').isLength({ min: 1, max: 100 }).withMessage('姓名长度必须在1-100字符之间'),
    body('email').isEmail().withMessage('请输入有效的邮箱地址'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
    body('specialties').optional().isArray().withMessage('专业领域必须是数组'),
    body('experience').optional().isInt({ min: 0 }).withMessage('执业年限必须是非负整数'),
    body('education').optional().isLength({ max: 500 }).withMessage('教育背景不能超过500字符'),
    body('licenseNumber').optional().isLength({ max: 50 }).withMessage('执业证号不能超过50字符'),
    body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('时薪必须是非负数'),
    body('bio').optional().isLength({ max: 1000 }).withMessage('个人简介不能超过1000字符'),
    body('languages').optional().isArray().withMessage('语言能力必须是数组')
  ],
  validateRequest,
  createLawyer
);

router.put('/lawyers/:id',
  adminPermission(['lawyers:write']),
  logAdminAction,
  [
    param('id').isUUID().withMessage('律师ID格式无效'),
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('姓名长度必须在1-100字符之间'),
    body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
    body('specialties').optional().isArray().withMessage('专业领域必须是数组'),
    body('experience').optional().isInt({ min: 0 }).withMessage('执业年限必须是非负整数'),
    body('education').optional().isLength({ max: 500 }).withMessage('教育背景不能超过500字符'),
    body('license_number').optional().isLength({ max: 50 }).withMessage('执业证号不能超过50字符'),
    body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('时薪必须是非负数'),
    body('bio').optional().isLength({ max: 1000 }).withMessage('个人简介不能超过1000字符'),
    body('languages').optional().isArray().withMessage('语言能力必须是数组')
  ],
  validateRequest,
  updateLawyer
);

// Consultation management routes
router.get('/consultations',
  adminPermission(['consultations:read']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['pending', 'active', 'completed', 'cancelled']).withMessage('状态无效'),
    query('date_from').optional().isISO8601().withMessage('开始日期格式无效'),
    query('date_to').optional().isISO8601().withMessage('结束日期格式无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.get('/consultations/:id',
  adminPermission(['consultations:read']),
  [
    param('id').isUUID().withMessage('咨询ID格式无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

// Payment management routes
router.get('/payments',
  adminPermission(['payments:read']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('状态无效'),
    query('date_from').optional().isISO8601().withMessage('开始日期格式无效'),
    query('date_to').optional().isISO8601().withMessage('结束日期格式无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.get('/payments/:id',
  adminPermission(['payments:read']),
  [
    param('id').isUUID().withMessage('支付ID格式无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

// Review management routes
router.get('/reviews',
  adminPermission(['reviews:read']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('状态无效'),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.patch('/reviews/:id/status',
  adminPermission(['reviews:write']),
  logAdminAction,
  [
    param('id').isUUID().withMessage('评价ID格式无效'),
    body('status').isIn(['pending', 'approved', 'rejected']).withMessage('状态无效'),
    body('reason').optional().isLength({ max: 500 }).withMessage('原因不能超过500字符')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

// Content management routes
router.get('/content',
  adminPermission(['content:read']),
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.post('/content',
  adminPermission(['content:write']),
  logAdminAction,
  [
    body('title').isLength({ min: 1, max: 200 }).withMessage('标题长度必须在1-200字符之间'),
    body('content').isLength({ min: 1 }).withMessage('内容不能为空'),
    body('type').isIn(['announcement', 'faq', 'terms', 'privacy']).withMessage('内容类型无效'),
    body('status').optional().isIn(['draft', 'published']).withMessage('状态无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.put('/content/:id',
  adminPermission(['content:write']),
  logAdminAction,
  [
    param('id').isUUID().withMessage('内容ID格式无效'),
    body('title').optional().isLength({ min: 1, max: 200 }).withMessage('标题长度必须在1-200字符之间'),
    body('content').optional().isLength({ min: 1 }).withMessage('内容不能为空'),
    body('status').optional().isIn(['draft', 'published']).withMessage('状态无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.delete('/content/:id',
  adminPermission(['content:delete']),
  logAdminAction,
  [
    param('id').isUUID().withMessage('内容ID格式无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

// System settings routes
router.get('/settings',
  adminPermission(['settings:read']),
  [
    query('category').optional().isLength({ max: 50 }).withMessage('分类名称不能超过50字符')
  ],
  validateRequest,
  getSystemSettings
);

router.patch('/settings/:key',
  adminPermission(['settings:write']),
  logAdminAction,
  [
    param('key').isLength({ min: 1, max: 100 }).withMessage('设置键名长度必须在1-100字符之间'),
    body('value').notEmpty().withMessage('设置值不能为空'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500字符')
  ],
  validateRequest,
  updateSystemSetting
);

// Admin management routes (super admin only)
router.get('/admins',
  superAdminOnly,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.post('/admins',
  superAdminOnly,
  logAdminAction,
  [
    body('user_id').isUUID().withMessage('用户ID格式无效'),
    body('role').isIn(['admin', 'super_admin']).withMessage('角色无效'),
    body('permissions').isArray().withMessage('权限必须是数组')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.patch('/admins/:id',
  superAdminOnly,
  logAdminAction,
  [
    param('id').isUUID().withMessage('管理员ID格式无效'),
    body('role').optional().isIn(['admin', 'super_admin']).withMessage('角色无效'),
    body('permissions').optional().isArray().withMessage('权限必须是数组'),
    body('is_active').optional().isBoolean().withMessage('状态必须是布尔值')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

router.delete('/admins/:id',
  superAdminOnly,
  logAdminAction,
  [
    param('id').isUUID().withMessage('管理员ID格式无效')
  ],
  validateRequest,
  async (req: AdminRequest, res: Response, next: NextFunction) => {
    res.status(501).json({ success: false, message: '功能开发中' });
  }
);

// Admin logs routes
router.get('/logs',
  adminPermission(['logs:read']),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('action').optional().isLength({ max: 50 }).withMessage('操作类型不能超过50字符'),
    query('admin_id').optional().isUUID().withMessage('管理员ID格式无效')
  ],
  validateRequest,
  getAdminLogs
);

export default router;