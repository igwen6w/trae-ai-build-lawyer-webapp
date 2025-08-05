import { Request, Response } from 'express';
import { pool } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError } from '../utils/appError';
import fs from 'fs';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Upload avatar
export const uploadAvatar = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const userId = req.user?.id;
  const filename = req.file.filename;
  const filePath = req.file.path;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;

  // Save file info to database
  const result = await pool.query(
    `INSERT INTO files (user_id, filename, original_name, file_path, file_size, mime_type, file_type, created_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *`,
    [userId, filename, req.file.originalname, filePath, fileSize, mimeType, 'avatar']
  );

  // Update user's avatar
  await pool.query(
    'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [filename, userId]
  );

  res.status(200).json({
    success: true,
    data: {
      file: result.rows[0],
      url: `/api/upload/${filename}`
    },
    message: 'Avatar uploaded successfully'
  });
});

// Upload document
export const uploadDocument = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const userId = req.user?.id;
  const filename = req.file.filename;
  const filePath = req.file.path;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;
  const { description, category } = req.body;

  // Save file info to database
  const result = await pool.query(
    `INSERT INTO files (user_id, filename, original_name, file_path, file_size, mime_type, file_type, description, category, created_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING *`,
    [userId, filename, req.file.originalname, filePath, fileSize, mimeType, 'document', description, category]
  );

  res.status(200).json({
    success: true,
    data: {
      file: result.rows[0],
      url: `/api/upload/${filename}`
    },
    message: 'Document uploaded successfully'
  });
});

// Upload chat file
export const uploadChatFile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const userId = req.user?.id;
  const filename = req.file.filename;
  const filePath = req.file.path;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;
  const { consultationId } = req.body;

  // Verify consultation exists and user has access
  const consultationResult = await pool.query(
    'SELECT * FROM consultations WHERE id = $1 AND (user_id = $2 OR lawyer_id = $2)',
    [consultationId, userId]
  );

  if (consultationResult.rows.length === 0) {
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    throw new AppError('Consultation not found or access denied', 404);
  }

  // Save file info to database
  const result = await pool.query(
    `INSERT INTO files (user_id, filename, original_name, file_path, file_size, mime_type, file_type, consultation_id, created_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`,
    [userId, filename, req.file.originalname, filePath, fileSize, mimeType, 'chat', consultationId]
  );

  res.status(200).json({
    success: true,
    data: {
      file: result.rows[0],
      url: `/api/upload/${filename}`
    },
    message: 'File uploaded successfully'
  });
});

// Delete file
export const deleteFile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { filename } = req.params;
  const userId = req.user?.id;

  // Get file info from database
  const fileResult = await pool.query(
    'SELECT * FROM files WHERE filename = $1',
    [filename]
  );

  if (fileResult.rows.length === 0) {
    throw new AppError('File not found', 404);
  }

  const file = fileResult.rows[0];

  // Check if user owns the file or is admin
  if (file.user_id !== userId && req.user?.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }

  // Delete physical file
  if (fs.existsSync(file.file_path)) {
    fs.unlinkSync(file.file_path);
  }

  // Delete from database
  await pool.query('DELETE FROM files WHERE id = $1', [file.id]);

  // If it was an avatar, update user record
  if (file.file_type === 'avatar') {
    await pool.query(
      'UPDATE users SET avatar = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [file.user_id]
    );
  }

  res.status(200).json({
    success: true,
    message: 'File deleted successfully'
  });
});

// Get file
export const getFile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { filename } = req.params;
  const userId = req.user?.id;

  // Get file info from database
  const fileResult = await pool.query(
    'SELECT * FROM files WHERE filename = $1',
    [filename]
  );

  if (fileResult.rows.length === 0) {
    throw new AppError('File not found', 404);
  }

  const file = fileResult.rows[0];

  // Check access permissions
  let hasAccess = false;

  if (file.user_id === userId || req.user?.role === 'admin') {
    hasAccess = true;
  } else if (file.file_type === 'chat' && file.consultation_id) {
    // Check if user is part of the consultation
    const consultationResult = await pool.query(
      'SELECT * FROM consultations WHERE id = $1 AND (user_id = $2 OR lawyer_id = $2)',
      [file.consultation_id, userId]
    );
    hasAccess = consultationResult.rows.length > 0;
  } else if (file.file_type === 'avatar') {
    // Avatars are generally accessible
    hasAccess = true;
  }

  if (!hasAccess) {
    throw new AppError('Access denied', 403);
  }

  // Check if file exists
  if (!fs.existsSync(file.file_path)) {
    throw new AppError('File not found on disk', 404);
  }

  // Set appropriate headers
  res.setHeader('Content-Type', file.mime_type);
  res.setHeader('Content-Length', file.file_size);
  res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);

  // Stream the file
  const fileStream = fs.createReadStream(file.file_path);
  fileStream.pipe(res);
});

// Get user files
export const getUserFiles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { type, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM files WHERE user_id = $1';
  const params: any[] = [userId];

  if (type) {
    query += ' AND file_type = $2';
    params.push(type);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(Number(limit), offset);

  const [files, total] = await Promise.all([
    pool.query(query, params),
    pool.query(
      `SELECT COUNT(*) FROM files WHERE user_id = $1${type ? ' AND file_type = $2' : ''}`,
      type ? [userId, type] : [userId]
    )
  ]);

  res.status(200).json({
    success: true,
    data: {
      files: files.rows.map(file => ({
        ...file,
        url: `/api/upload/${file.filename}`
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(total.rows[0].count),
        pages: Math.ceil(parseInt(total.rows[0].count) / Number(limit))
      }
    }
  });
});