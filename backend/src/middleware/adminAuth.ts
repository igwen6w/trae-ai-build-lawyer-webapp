import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { AdminModel, AdminLogModel } from '../models/Admin';
import { UserModel } from '../models/User';
import { AppError } from '../utils/appError';
import { catchAsync } from './errorHandler';
import { AdminRequest } from '../types';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Admin authentication middleware
export const adminProtect = catchAsync(async (req: AdminRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError('管理员未登录，请先登录', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return next(new AppError('用户不存在', 401));
    }

    // Get admin info
    const admin = await AdminModel.findByUserId(user.id);
    if (!admin) {
      return next(new AppError('管理员权限不存在', 403));
    }

    // Check if admin is active
    if (!admin.is_active) {
      return next(new AppError('管理员账户已被禁用', 403));
    }

    // Grant access to protected route
    req.user = user;
    req.admin = admin;

    // Update last login
    await AdminModel.updateLastLogin(admin.id);

    next();
  } catch (error) {
    return next(new AppError('管理员身份验证失败', 401));
  }
});

// Admin role authorization
export const adminAuthorize = (...roles: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError('管理员身份验证失败', 401));
    }

    if (!roles.includes(req.admin.role)) {
      return next(
        new AppError(
          `管理员角色 ${req.admin.role} 无权访问此资源`,
          403
        )
      );
    }

    next();
  };
};

// Permission-based authorization
export const adminPermission = (permissions: string[]) => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError('管理员身份验证失败', 401));
    }

    try {
      // Check if admin has any of the required permissions
      const hasAnyPermission = await Promise.all(
        permissions.map(permission => AdminModel.hasPermission(req.admin!.id, permission))
      );
      
      if (!hasAnyPermission.some(Boolean)) {
        return next(new AppError(`无权限执行此操作: ${permissions.join(', ')}`, 403));
      }

      next();
    } catch (error) {
      return next(new AppError('权限检查失败', 500));
    }
  };
};

// Super admin only
export const superAdminOnly = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.admin) {
    return next(new AppError('管理员身份验证失败', 401));
  }

  if (req.admin.role !== 'super_admin') {
    return next(new AppError('仅超级管理员可访问', 403));
  }

  next();
};

// Log admin actions
export const logAdminAction = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.admin) {
      return next();
    }

    const originalSend = res.send;
    res.send = function(data) {
      // Log action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action = `${req.method.toLowerCase()}_${req.route?.path?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'}`;
        AdminLogModel.create({
          admin_id: req.admin!.id,
          action,
          target_type: req.params.id ? 'resource' : undefined,
          target_id: req.params.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            params: req.params,
            query: req.query
          },
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }).catch(console.error);
      }
      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Admin rate limiting - More permissive for development
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased to 1000 requests per windowMs for development
  message: '管理员操作过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validate admin session
export const validateAdminSession = catchAsync(async (req: AdminRequest, res: Response, next: NextFunction) => {
  if (!req.admin) {
    return next(new AppError('管理员会话无效', 401));
  }

  // Check if admin is still active
  const currentAdmin = await AdminModel.findById(req.admin.id);
  if (!currentAdmin || !currentAdmin.is_active) {
    return next(new AppError('管理员账户状态异常', 403));
  }

  // Update admin info in request
  req.admin = currentAdmin;
  
  next();
});

// Optional admin auth - doesn't fail if no token
export const optionalAdminAuth = catchAsync(async (req: AdminRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  // If no token, continue without admin
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user and admin info
    const user = await UserModel.findById(decoded.id);
    if (user) {
      const admin = await AdminModel.findByUserId(user.id);
      if (admin && admin.is_active) {
        req.user = user;
        req.admin = admin;
      }
    }
  } catch (error) {
    // Invalid token, but continue without admin
    console.log('Invalid admin token in optional auth:', error);
  }

  next();
});

// Check if admin can manage specific resource
export const canManageResource = (resourceType: string) => {
  return async (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError('管理员身份验证失败', 401));
    }

    // Super admin can manage everything
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check specific permissions based on resource type
    let requiredPermission: string;
    
    switch (resourceType) {
      case 'users':
        requiredPermission = 'users';
        break;
      case 'lawyers':
        requiredPermission = 'lawyers';
        break;
      case 'consultations':
        requiredPermission = 'consultations';
        break;
      case 'payments':
        requiredPermission = 'payments';
        break;
      case 'content':
        requiredPermission = 'content';
        break;
      case 'system':
        requiredPermission = 'system';
        break;
      case 'reports':
        requiredPermission = 'reports';
        break;
      default:
        return next(new AppError('未知的资源类型', 400));
    }

    try {
      const hasPermission = await AdminModel.hasPermission(req.admin.id, requiredPermission);
      
      if (!hasPermission) {
        return next(new AppError(`无权限管理${resourceType}`, 403));
      }

      next();
    } catch (error) {
      return next(new AppError('权限检查失败', 500));
    }
  };
};