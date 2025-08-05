import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/appError';

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
        sort: string;
        order: 'ASC' | 'DESC';
      };
    }
  }
}

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(errorMessages.join('. '), 400));
  }
  
  next();
};

// Alias for validate function
export const validateRequest = validate;

// Sanitize input middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files: any[] = [];
  
  if (req.file) {
    files.push(req.file);
  }
  
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      // req.files is an object with field names as keys
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          files.push(...fileArray);
        } else {
          files.push(fileArray);
        }
      });
    }
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB default
  
  for (const file of files) {
    if (!file) continue;
    
    // Check file size
    if (file.size > maxSize) {
      return next(new AppError(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`, 400));
    }
    
    // Basic file validation - specific type checking is done in multer fileFilter
    if (!file.mimetype) {
      return next(new AppError('Invalid file type', 400));
    }
  }

  next();
};

// File upload validation with custom parameters
export const createFileUploadValidator = (allowedTypes: string[], maxSize: number = 5 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files: any[] = [];
    
    if (req.file) {
      files.push(req.file);
    }
    
    if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        // req.files is an object with field names as keys
        Object.values(req.files).forEach(fileArray => {
          if (Array.isArray(fileArray)) {
            files.push(...fileArray);
          } else {
            files.push(fileArray);
          }
        });
      }
    }
    
    for (const file of files) {
      if (!file) continue;
      
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return next(new AppError(`File type ${file.mimetype} is not allowed`, 400));
      }
      
      // Check file size
      if (file.size > maxSize) {
        return next(new AppError(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`, 400));
      }
    }

    next();
  };
};

// Pagination validation
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = req.query.sort as string || 'created_at';
  const order = req.query.order as string || 'DESC';

  // Validate page
  if (page < 1) {
    return next(new AppError('Page must be greater than 0', 400));
  }

  // Validate limit
  if (limit < 1 || limit > 100) {
    return next(new AppError('Limit must be between 1 and 100', 400));
  }

  // Validate order
  if (!['ASC', 'DESC', 'asc', 'desc'].includes(order)) {
    return next(new AppError('Order must be ASC or DESC', 400));
  }

  // Add validated pagination to request
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
    sort,
    order: order.toUpperCase() as 'ASC' | 'DESC'
  };

  next();
};

// UUID validation
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuid || !uuidRegex.test(uuid)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }
    
    next();
  };
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
        sort: string;
        order: 'ASC' | 'DESC';
      };
    }
  }
}