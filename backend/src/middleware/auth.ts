import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { AppError } from '../utils/appError';
import { catchAsync } from './errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    isVerified: boolean;
  };
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Protect routes - require authentication
export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Get user from database
    const result = await pool.query(
      'SELECT id, name, email, role, is_verified FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('No user found with this token', 401));
    }

    const user = result.rows[0];

    // Check if user is still active (not deleted)
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Grant access to protected route
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: user.is_verified
    };

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

// Require email verification
export const requireVerification = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  if (!req.user.isVerified) {
    return next(new AppError('Please verify your email to access this resource', 403));
  }

  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token, continue without user
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Get user from database
    const result = await pool.query(
      'SELECT id, name, email, role, is_verified FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isVerified: user.is_verified
      };
    }
  } catch (error) {
    // Invalid token, but continue without user
    console.log('Invalid token in optional auth:', error);
  }

  next();
});

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceUserIdField: string = 'user_id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Get resource ID from params or body
    const resourceId = req.params.id || req.body.id;
    
    if (!resourceId) {
      return next(new AppError('Resource ID not found', 400));
    }

    try {
      // This is a generic check - specific implementations should override this
      // For now, just check if user ID matches
      if (req.user.id === resourceId) {
        return next();
      }

      return next(new AppError('Not authorized to access this resource', 403));
    } catch (error) {
      return next(new AppError('Error checking resource ownership', 500));
    }
  };
};

// Rate limiting for authentication attempts
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};