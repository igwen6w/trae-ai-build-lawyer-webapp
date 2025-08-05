import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle PostgreSQL errors
const handleQueryFailedError = (err: any): AppError => {
  const message = 'Database query failed';
  return new AppError(message, 400);
};

// Handle PostgreSQL unique constraint violation
const handleUniqueViolation = (err: any): AppError => {
  const message = 'Duplicate field value entered';
  return new AppError(message, 400);
};

// Handle PostgreSQL foreign key constraint violation
const handleForeignKeyViolation = (err: any): AppError => {
  const message = 'Referenced resource not found';
  return new AppError(message, 400);
};

// Handle cast errors (invalid ObjectId)
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle duplicate field errors
const handleDuplicateFieldsDB = (err: any): AppError => {
  const message = 'Duplicate field value. Please use another value!';
  return new AppError(message, 400);
};

// Handle validation errors
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

// Send error response in development
const sendErrorDev = (err: AppError, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    message: err.message,
    error: `Status: ${err.statusCode}, Message: ${err.message}, Stack: ${err.stack}`
  };

  res.status(err.statusCode).json(response);
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: ApiResponse<null> = {
      success: false,
      message: err.message
    };

    res.status(err.statusCode).json(response);
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    const response: ApiResponse<null> = {
      success: false,
      message: 'Something went wrong!'
    };

    res.status(500).json(response);
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'QueryFailedError') error = handleQueryFailedError(error);
    if (error.code === '23505') error = handleUniqueViolation(error);
    if (error.code === '23503') error = handleForeignKeyViolation(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Async error handler wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Handle unhandled routes
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};