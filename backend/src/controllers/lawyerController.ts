import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, NotFoundError, ConflictError } from '../utils/appError';

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

// @desc    Get all lawyers
// @route   GET /api/lawyers
// @access  Public
export const getLawyers = catchAsync(async (req: AuthRequest, res: Response) => {
  console.log('getLawyers called with query:', req.query);
  console.log('pagination:', req.pagination);
  
  try {
  // Provide default pagination values if middleware didn't set them
  const pagination = req.pagination || {
    page: 1,
    limit: 10,
    offset: 0,
    sort: 'created_at',
    order: 'DESC'
  };
  const { page, limit, offset, sort, order } = pagination;
  const { specialty, min_rating, max_rate, location } = req.query;

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (specialty) {
    conditions.push(`$${paramCount} = ANY(l.specialties)`);
    values.push(specialty);
    paramCount++;
  }

  if (min_rating) {
    conditions.push(`l.rating >= $${paramCount}`);
    values.push(parseFloat(min_rating as string));
    paramCount++;
  }

  if (max_rate) {
    conditions.push(`l.hourly_rate <= $${paramCount}`);
    values.push(parseFloat(max_rate as string));
    paramCount++;
  }

  if (location) {
    conditions.push(`l.location ILIKE $${paramCount}`);
    values.push(`%${location}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) 
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Get lawyers with pagination
  const query = `
    SELECT 
      l.id, l.user_id, l.specialties, l.experience, l.education,
      l.license_number, l.hourly_rate, l.languages, l.location as office_address,
      l.availability, l.rating, l.review_count, l.is_online, l.created_at,
      u.name, u.email, u.phone, u.avatar, l.bio
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    ${whereClause}
    ORDER BY ${sort === 'created_at' ? 'l.created_at' : sort === 'name' ? 'u.name' : `l.${sort}`} ${order}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);
  const result = await pool.query(query, values);

  const lawyers = result.rows.map(lawyer => ({
    id: lawyer.id,
    userId: lawyer.user_id,
    name: lawyer.name,
    email: lawyer.email,
    phone: lawyer.phone,
    bio: lawyer.bio,
    location: lawyer.office_address,
    avatar: lawyer.avatar,
    specialties: lawyer.specialties,
    experienceYears: lawyer.experience,
    education: lawyer.education,
    licenseNumber: lawyer.license_number,
    hourlyRate: lawyer.hourly_rate,
    languages: lawyer.languages,
    availability: lawyer.availability,
    rating: lawyer.rating,
    reviewCount: lawyer.review_count,
    isOnline: lawyer.is_online,
    createdAt: lawyer.created_at
  }));

  res.status(200).json({
    success: true,
    data: lawyers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
  
  } catch (error) {
    console.error('Error in getLawyers:', error);
    throw error;
  }
});

// @desc    Get lawyer by ID
// @route   GET /api/lawyers/:id
// @access  Public
export const getLawyerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT 
      l.id, l.user_id, l.specialties, l.experience, l.education,
      l.license_number, l.hourly_rate, l.languages, l.location as office_address,
      l.availability, l.rating, l.review_count, l.is_online, l.created_at, l.updated_at,
      u.name, u.email, u.phone, u.avatar, l.bio
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    WHERE l.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Lawyer not found');
  }

  const lawyer = result.rows[0];

  res.status(200).json({
    success: true,
    data: {
      id: lawyer.id,
      userId: lawyer.user_id,
      name: lawyer.name,
      email: lawyer.email,
      phone: lawyer.phone,
      bio: lawyer.bio,
      location: lawyer.office_address,
      avatar: lawyer.avatar,
      specialties: lawyer.specialties,
      experienceYears: lawyer.experience,
      education: lawyer.education,
      licenseNumber: lawyer.license_number,
      hourlyRate: lawyer.hourly_rate,
      languages: lawyer.languages,
      availability: lawyer.availability,
      rating: lawyer.rating,
      reviewCount: lawyer.review_count,
      isOnline: lawyer.is_online,
      createdAt: lawyer.created_at,
      updatedAt: lawyer.updated_at
    }
  });
});

// @desc    Create lawyer profile
// @route   POST /api/lawyers/profile
// @access  Private/Lawyer
export const createLawyerProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    specialties,
    experience,
    education,
    license_number = '',
    hourly_rate,
    languages = [],
    location = '',
    bio = ''
  } = req.body;

  // Check if lawyer profile already exists
  const existingProfile = await pool.query(
    'SELECT id FROM lawyers WHERE user_id = $1',
    [userId]
  );

  if (existingProfile.rows.length > 0) {
    throw new ConflictError('Lawyer profile already exists');
  }

  // Create lawyer profile
  const result = await pool.query(
    `INSERT INTO lawyers (
      user_id, specialties, experience, education, license_number,
      hourly_rate, languages, location, bio
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      userId, specialties, experience, education, license_number,
      hourly_rate, languages, location, bio
    ]
  );

  const lawyer = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'Lawyer profile created successfully',
    data: {
      id: lawyer.id,
      userId: lawyer.user_id,
      specialties: lawyer.specialties,
      experienceYears: lawyer.experience,
      education: lawyer.education,
      licenseNumber: lawyer.license_number,
      hourlyRate: lawyer.hourly_rate,
      languages: lawyer.languages,
      location: lawyer.location,
      bio: lawyer.bio,
      createdAt: lawyer.created_at
    }
  });
});

// @desc    Update lawyer profile
// @route   PUT /api/lawyers/profile
// @access  Private/Lawyer
export const updateLawyerProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    specialties,
    experience,
    education,
    license_number,
    hourly_rate,
    languages,
    location,
    bio
  } = req.body;

  // Build dynamic query
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (specialties !== undefined) {
    updates.push(`specialties = $${paramCount}`);
    values.push(specialties);
    paramCount++;
  }

  if (experience !== undefined) {
    updates.push(`experience = $${paramCount}`);
    values.push(experience);
    paramCount++;
  }

  if (education !== undefined) {
    updates.push(`education = $${paramCount}`);
    values.push(education);
    paramCount++;
  }

  if (license_number !== undefined) {
    updates.push(`license_number = $${paramCount}`);
    values.push(license_number);
    paramCount++;
  }

  if (hourly_rate !== undefined) {
    updates.push(`hourly_rate = $${paramCount}`);
    values.push(hourly_rate);
    paramCount++;
  }

  if (languages !== undefined) {
    updates.push(`languages = $${paramCount}`);
    values.push(languages);
    paramCount++;
  }

  if (location !== undefined) {
    updates.push(`location = $${paramCount}`);
    values.push(location);
    paramCount++;
  }

  if (bio !== undefined) {
    updates.push(`bio = $${paramCount}`);
    values.push(bio);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE lawyers 
    SET ${updates.join(', ')}
    WHERE user_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new NotFoundError('Lawyer profile not found');
  }

  const lawyer = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'Lawyer profile updated successfully',
    data: {
      id: lawyer.id,
      userId: lawyer.user_id,
      specialties: lawyer.specialties,
      experienceYears: lawyer.experience,
      education: lawyer.education,
      licenseNumber: lawyer.license_number,
      hourlyRate: lawyer.hourly_rate,
      languages: lawyer.languages,
      location: lawyer.location,
      bio: lawyer.bio,
      updatedAt: lawyer.updated_at
    }
  });
});

// @desc    Delete lawyer profile
// @route   DELETE /api/lawyers/profile
// @access  Private/Lawyer
export const deleteLawyerProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const result = await pool.query(
    'DELETE FROM lawyers WHERE user_id = $1 RETURNING id',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Lawyer profile not found');
  }

  res.status(200).json({
    success: true,
    message: 'Lawyer profile deactivated successfully'
  });
});

// @desc    Get lawyer reviews
// @route   GET /api/lawyers/:id/reviews
// @access  Public
export const getLawyerReviews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page, limit, offset } = req.pagination!;

  // Get total count
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM reviews WHERE lawyer_id = $1',
    [id]
  );
  const total = parseInt(countResult.rows[0].count);

  // Get reviews with pagination
  const result = await pool.query(
    `SELECT 
      r.id, r.rating, r.comment, r.created_at,
      u.name as client_name, u.avatar as client_avatar
    FROM reviews r
    JOIN users u ON r.client_id = u.id
    WHERE r.lawyer_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3`,
    [id, limit, offset]
  );

  const reviews = result.rows.map(review => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    client: {
      name: review.client_name,
      avatar: review.client_avatar
    }
  }));

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Add lawyer review
// @route   POST /api/lawyers/:id/reviews
// @access  Private
export const addLawyerReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { rating, comment } = req.body;

  // Check if lawyer exists
  const lawyerExists = await pool.query(
    'SELECT id FROM lawyers WHERE id = $1',
    [id]
  );

  if (lawyerExists.rows.length === 0) {
    throw new NotFoundError('Lawyer not found');
  }

  // Check if user already reviewed this lawyer
  const existingReview = await pool.query(
    'SELECT id FROM reviews WHERE client_id = $1 AND lawyer_id = $2',
    [userId, id]
  );

  if (existingReview.rows.length > 0) {
    throw new ConflictError('You have already reviewed this lawyer');
  }

  // Add review
  const result = await pool.query(
    'INSERT INTO reviews (client_id, lawyer_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, id, rating, comment]
  );

  // Update lawyer's average rating
  await pool.query(
    `UPDATE lawyers 
     SET average_rating = (
       SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE lawyer_id = $1
     ),
     total_reviews = (
       SELECT COUNT(*) FROM reviews WHERE lawyer_id = $1
     )
     WHERE id = $1`,
    [id]
  );

  const review = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at
    }
  });
});

// @desc    Update lawyer availability
// @route   PUT /api/lawyers/availability
// @access  Private/Lawyer
export const updateLawyerAvailability = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { available_days, available_hours } = req.body;

  const result = await pool.query(
    `UPDATE lawyers 
     SET available_days = $1, available_hours = $2, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $3
     RETURNING available_days, available_hours`,
    [available_days, available_hours, userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Lawyer profile not found');
  }

  const lawyer = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'Availability updated successfully',
    data: {
      availableDays: lawyer.available_days,
      availableHours: lawyer.available_hours
    }
  });
});

// @desc    Search lawyers
// @route   GET /api/lawyers/search
// @access  Public
export const searchLawyers = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page, limit, offset } = req.pagination!;
  const { q, specialty, location, min_rating, max_rate } = req.query;

  // Build search conditions
  const conditions: string[] = ['l.is_active = true'];
  const values: any[] = [];
  let paramCount = 1;

  if (q) {
    conditions.push(`(
      u.name ILIKE $${paramCount} OR 
      u.bio ILIKE $${paramCount} OR 
      l.education ILIKE $${paramCount} OR
      array_to_string(l.specialties, ' ') ILIKE $${paramCount}
    )`);
    values.push(`%${q}%`);
    paramCount++;
  }

  if (specialty) {
    conditions.push(`$${paramCount} = ANY(l.specialties)`);
    values.push(specialty);
    paramCount++;
  }

  if (location) {
    conditions.push(`(u.location ILIKE $${paramCount} OR l.office_address ILIKE $${paramCount})`);
    values.push(`%${location}%`);
    paramCount++;
  }

  if (min_rating) {
    conditions.push(`l.average_rating >= $${paramCount}`);
    values.push(parseFloat(min_rating as string));
    paramCount++;
  }

  if (max_rate) {
    conditions.push(`l.hourly_rate <= $${paramCount}`);
    values.push(parseFloat(max_rate as string));
    paramCount++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Get total count
  const countQuery = `
    SELECT COUNT(*) 
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Get search results
  const query = `
    SELECT 
      l.id, l.user_id, l.specialties, l.experience_years, l.hourly_rate,
      l.average_rating, l.total_reviews, l.office_address,
      u.name, u.bio, u.location, u.avatar
    FROM lawyers l
    JOIN users u ON l.user_id = u.id
    ${whereClause}
    ORDER BY 
      CASE WHEN l.average_rating IS NOT NULL THEN l.average_rating ELSE 0 END DESC,
      l.total_reviews DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);
  const result = await pool.query(query, values);

  const lawyers = result.rows.map(lawyer => ({
    id: lawyer.id,
    userId: lawyer.user_id,
    name: lawyer.name,
    bio: lawyer.bio,
    location: lawyer.location,
    avatar: lawyer.avatar,
    specialties: lawyer.specialties,
    experienceYears: lawyer.experience_years,
    hourlyRate: lawyer.hourly_rate,
    averageRating: lawyer.average_rating,
    totalReviews: lawyer.total_reviews,
    officeAddress: lawyer.office_address
  }));

  res.status(200).json({
    success: true,
    data: lawyers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get lawyer statistics (Admin only)
// @route   GET /api/lawyers/:id/stats
// @access  Private/Admin
export const getLawyerStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get basic stats
  const statsResult = await pool.query(
    `SELECT 
      COUNT(c.id) as total_consultations,
      COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_consultations,
      COUNT(CASE WHEN c.status = 'cancelled' THEN 1 END) as cancelled_consultations,
      AVG(CASE WHEN c.status = 'completed' THEN c.duration END) as avg_consultation_duration,
      SUM(CASE WHEN p.status = 'completed' THEN p.amount END) as total_earnings
    FROM lawyers l
    LEFT JOIN consultations c ON l.id = c.lawyer_id
    LEFT JOIN payments p ON c.id = p.consultation_id
    WHERE l.id = $1
    GROUP BY l.id`,
    [id]
  );

  // Get monthly consultation counts for the last 12 months
  const monthlyResult = await pool.query(
    `SELECT 
      DATE_TRUNC('month', c.scheduled_at) as month,
      COUNT(*) as consultation_count
    FROM consultations c
    WHERE c.lawyer_id = $1 
      AND c.scheduled_at >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', c.scheduled_at)
    ORDER BY month`,
    [id]
  );

  const stats = statsResult.rows[0] || {
    total_consultations: 0,
    completed_consultations: 0,
    cancelled_consultations: 0,
    avg_consultation_duration: 0,
    total_earnings: 0
  };

  res.status(200).json({
    success: true,
    data: {
      totalConsultations: parseInt(stats.total_consultations),
      completedConsultations: parseInt(stats.completed_consultations),
      cancelledConsultations: parseInt(stats.cancelled_consultations),
      avgConsultationDuration: parseFloat(stats.avg_consultation_duration) || 0,
      totalEarnings: parseFloat(stats.total_earnings) || 0,
      monthlyStats: monthlyResult.rows.map(row => ({
        month: row.month,
        consultationCount: parseInt(row.consultation_count)
      }))
    }
  });
});