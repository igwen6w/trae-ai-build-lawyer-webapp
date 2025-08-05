import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, NotFoundError, ConflictError } from '../utils/appError';
import { sendTemplatedEmail, emailTemplates } from '../services/emailService';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

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

// @desc    Get user's consultations
// @route   GET /api/consultations
// @access  Private
export const getConsultations = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { page, limit, offset, sort, order } = req.pagination!;
  const { status, type } = req.query;

  // Build WHERE clause based on user role
  const conditions: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (userRole === 'lawyer') {
    conditions.push(`l.user_id = $${paramCount}`);
  } else {
    conditions.push(`c.client_id = $${paramCount}`);
  }
  values.push(userId);
  paramCount++;

  if (status) {
    conditions.push(`c.status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }

  if (type) {
    conditions.push(`c.type = $${paramCount}`);
    values.push(type);
    paramCount++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Get total count
  const countQuery = `
    SELECT COUNT(*) 
    FROM consultations c
    JOIN lawyers l ON c.lawyer_id = l.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Get consultations with pagination
  const query = `
    SELECT 
      c.id, c.type, c.scheduled_at, c.duration,
      c.description, c.status,
      c.created_at, c.updated_at,
      u_client.name as client_name, u_client.email as client_email, u_client.avatar as client_avatar,
      u_lawyer.name as lawyer_name, u_lawyer.email as lawyer_email, u_lawyer.avatar as lawyer_avatar,
      l.id as lawyer_id, l.hourly_rate
    FROM consultations c
    JOIN users u_client ON c.client_id = u_client.id
    JOIN lawyers l ON c.lawyer_id = l.id
    JOIN users u_lawyer ON l.user_id = u_lawyer.id
    ${whereClause}
    ORDER BY ${sort === 'created_at' ? 'c.created_at' : `c.${sort}`} ${order}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  values.push(limit, offset);
  const result = await pool.query(query, values);

  const consultations = result.rows.map(consultation => ({
    id: consultation.id,
    consultationType: consultation.type,
    scheduledAt: consultation.scheduled_at,
    durationMinutes: consultation.duration_minutes,
    description: consultation.description,
    urgencyLevel: consultation.urgency_level,
    status: consultation.status,
    meetingLink: consultation.meeting_link,
    createdAt: consultation.created_at,
    updatedAt: consultation.updated_at,
    client: {
      name: consultation.client_name,
      email: consultation.client_email,
      avatar: consultation.client_avatar
    },
    lawyer: {
      id: consultation.lawyer_id,
      name: consultation.lawyer_name,
      email: consultation.lawyer_email,
      avatar: consultation.lawyer_avatar,
      hourlyRate: consultation.hourly_rate
    }
  }));

  res.status(200).json({
    success: true,
    data: consultations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get consultation by ID
// @route   GET /api/consultations/:id
// @access  Private
export const getConsultationById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await pool.query(
    `SELECT 
      c.id, c.client_id, c.lawyer_id, c.type, c.scheduled_at, 
      c.duration, c.description, c.status, 
      c.meeting_link, c.notes, c.created_at, c.updated_at,
      u_client.name as client_name, u_client.email as client_email, 
      u_client.phone as client_phone, u_client.avatar as client_avatar,
      u_lawyer.name as lawyer_name, u_lawyer.email as lawyer_email, 
      u_lawyer.phone as lawyer_phone, u_lawyer.avatar as lawyer_avatar,
      l.hourly_rate, l.specialties
    FROM consultations c
    JOIN users u_client ON c.client_id = u_client.id
    JOIN lawyers l ON c.lawyer_id = l.id
    JOIN users u_lawyer ON l.user_id = u_lawyer.id
    WHERE c.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = result.rows[0];

  // Check if user has access to this consultation
  if (userRole === 'lawyer') {
    const lawyerCheck = await pool.query(
      'SELECT id FROM lawyers WHERE id = $1 AND user_id = $2',
      [consultation.lawyer_id, userId]
    );
    if (lawyerCheck.rows.length === 0) {
      throw new AppError('Not authorized to access this consultation', 403);
    }
  } else if (consultation.client_id !== userId && userRole !== 'admin') {
    throw new AppError('Not authorized to access this consultation', 403);
  }

  res.status(200).json({
    success: true,
    data: {
      id: consultation.id,
      consultationType: consultation.type,
      scheduledAt: consultation.scheduled_at,
      durationMinutes: consultation.duration,
      description: consultation.description,

      status: consultation.status,
      meetingLink: consultation.meeting_link,
      notes: consultation.notes,
      createdAt: consultation.created_at,
      updatedAt: consultation.updated_at,
      client: {
        id: consultation.client_id,
        name: consultation.client_name,
        email: consultation.client_email,
        phone: consultation.client_phone,
        avatar: consultation.client_avatar
      },
      lawyer: {
        id: consultation.lawyer_id,
        name: consultation.lawyer_name,
        email: consultation.lawyer_email,
        phone: consultation.lawyer_phone,
        avatar: consultation.lawyer_avatar,
        hourlyRate: consultation.hourly_rate,
        specialties: consultation.specialties
      }
    }
  });
});

// @desc    Book a consultation
// @route   POST /api/consultations/book
// @access  Private
export const bookConsultation = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const {
      lawyer_id,
      type,
      scheduled_at,
      duration,
      description
    } = req.body;

  // Check if lawyer exists and is active
  const lawyerResult = await pool.query(
    `SELECT l.id, l.user_id, l.hourly_rate, l.availability,
            u.name as lawyer_name, u.email as lawyer_email
     FROM lawyers l
       JOIN users u ON l.user_id = u.id
       WHERE l.user_id = $1 AND u.is_active = true`,
    [lawyer_id]
  );

  if (lawyerResult.rows.length === 0) {
    throw new NotFoundError('Lawyer not found or not available');
  }

  const lawyer = lawyerResult.rows[0];

  // Check for scheduling conflicts
  const conflictResult = await pool.query(
    `SELECT id FROM consultations 
     WHERE lawyer_id = $1 
       AND status NOT IN ('cancelled', 'completed')
       AND (
         (scheduled_at <= $2 AND scheduled_at + INTERVAL '1 minute' * duration > $2) OR
      (scheduled_at < $3 AND scheduled_at + INTERVAL '1 minute' * duration >= $3) OR
         (scheduled_at >= $2 AND scheduled_at < $3)
       )`,
    [lawyer_id, scheduled_at, new Date(new Date(scheduled_at).getTime() + duration * 60000)]
  );

  if (conflictResult.rows.length > 0) {
    throw new ConflictError('The selected time slot is not available');
  }

  // Generate meeting link for video consultations
  let meetingLink = null;
  if (type === 'video') {
    const consultationId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    meetingLink = `${process.env.CLIENT_URL}/consultation/${consultationId}/video`;
  }

  // Create consultation
  const result = await pool.query(
      `INSERT INTO consultations (
       client_id, lawyer_id, type, scheduled_at, duration,
       description
     ) VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
      [
       userId, lawyer_id, type, scheduled_at, duration,
       description
      ]
  );

  const consultation = result.rows[0];

  // Get client info for email
  const clientResult = await pool.query(
    'SELECT name, email FROM users WHERE id = $1',
    [userId]
  );
  const client = clientResult.rows[0];

  // Send confirmation emails
  try {
    const scheduledDate = new Date(scheduled_at).toLocaleDateString();
    const scheduledTime = new Date(scheduled_at).toLocaleTimeString();

    // Email to client
    await sendTemplatedEmail(
      client.email,
      emailTemplates.consultationBooked(
        client.name,
        lawyer.lawyer_name,
        scheduledDate,
        scheduledTime
      )
    );

    // Email to lawyer
    await sendTemplatedEmail(
      lawyer.lawyer_email,
      emailTemplates.consultationBooked(
        lawyer.lawyer_name,
        client.name,
        scheduledDate,
        scheduledTime
      )
    );
  } catch (error) {
    console.error('Failed to send confirmation emails:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Consultation booked successfully',
    data: {
      id: consultation.id,
      consultationType: consultation.type,
      scheduledAt: consultation.scheduled_at,
      durationMinutes: consultation.duration,
      description: consultation.description,

      status: consultation.status,
      meetingLink: consultation.meeting_link,
      createdAt: consultation.created_at
    }
  });
});

// @desc    Update consultation
// @route   PUT /api/consultations/:id
// @access  Private
export const updateConsultation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { scheduled_at, duration, description } = req.body;

  // Check if consultation exists and user has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization
  if (userRole === 'lawyer' && consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to update this consultation', 403);
  } else if (userRole === 'user' && consultation.client_id !== userId) {
    throw new AppError('Not authorized to update this consultation', 403);
  }

  // Check if consultation can be updated
  if (['completed', 'cancelled'].includes(consultation.status)) {
    throw new AppError('Cannot update completed or cancelled consultation', 400);
  }

  // Build dynamic query
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (scheduled_at !== undefined) {
    // Check for conflicts if rescheduling
    const conflictResult = await pool.query(
      `SELECT id FROM consultations 
       WHERE lawyer_id = $1 AND id != $2
         AND status NOT IN ('cancelled', 'completed')
         AND (
           (scheduled_at <= $3 AND scheduled_at + INTERVAL '1 minute' * duration > $3) OR
      (scheduled_at < $4 AND scheduled_at + INTERVAL '1 minute' * duration >= $4) OR
           (scheduled_at >= $3 AND scheduled_at < $4)
         )`,
      [
        consultation.lawyer_id,
        id,
        scheduled_at,
        new Date(new Date(scheduled_at).getTime() + (duration || consultation.duration) * 60000)
      ]
    );

    if (conflictResult.rows.length > 0) {
      throw new ConflictError('The selected time slot is not available');
    }

    updates.push(`scheduled_at = $${paramCount}`);
    values.push(scheduled_at);
    paramCount++;
  }

  if (duration !== undefined) {
      updates.push(`duration = $${paramCount}`);
      values.push(duration);
      paramCount++;
    }

  if (description !== undefined) {
    updates.push(`description = $${paramCount}`);
    values.push(description);
    paramCount++;
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE consultations 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  const updatedConsultation = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'Consultation updated successfully',
    data: {
      id: updatedConsultation.id,
      consultationType: updatedConsultation.type,
      scheduledAt: updatedConsultation.scheduled_at,
      durationMinutes: updatedConsultation.duration,
      description: updatedConsultation.description,

      status: updatedConsultation.status,
      updatedAt: updatedConsultation.updated_at
    }
  });
});

// @desc    Cancel consultation
// @route   DELETE /api/consultations/:id
// @access  Private
export const cancelConsultation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // Check if consultation exists and user has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization
  if (userRole === 'lawyer' && consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to cancel this consultation', 403);
  } else if (userRole === 'user' && consultation.client_id !== userId) {
    throw new AppError('Not authorized to cancel this consultation', 403);
  }

  // Check if consultation can be cancelled
  if (['completed', 'cancelled'].includes(consultation.status)) {
    throw new AppError('Cannot cancel completed or already cancelled consultation', 400);
  }

  // Update consultation status
  await pool.query(
    'UPDATE consultations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    ['cancelled', id]
  );

  res.status(200).json({
    success: true,
    message: 'Consultation cancelled successfully'
  });
});

// @desc    Complete consultation
// @route   POST /api/consultations/:id/complete
// @access  Private/Lawyer
export const completeConsultation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { notes } = req.body;

  // Check if consultation exists and lawyer has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization (only lawyer can complete)
  if (consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to complete this consultation', 403);
  }

  // Check if consultation can be completed
  if (['completed', 'cancelled'].includes(consultation.status)) {
    throw new AppError('Consultation is already completed or cancelled', 400);
  }

  // Update consultation status
  const result = await pool.query(
    'UPDATE consultations SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    ['completed', notes, id]
  );

  const updatedConsultation = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'Consultation completed successfully',
    data: {
      id: updatedConsultation.id,
      status: updatedConsultation.status,
      notes: updatedConsultation.notes,
      updatedAt: updatedConsultation.updated_at
    }
  });
});

// @desc    Get available time slots for a lawyer
// @route   GET /api/consultations/lawyers/:lawyerId/slots
// @access  Private
export const getAvailableSlots = catchAsync(async (req: Request, res: Response) => {
  const { lawyerId } = req.params;
  const { date, duration = 60 } = req.query;

  if (!date) {
    throw new AppError('Date parameter is required', 400);
  }

  // Get lawyer's availability
  const lawyerResult = await pool.query(
    'SELECT availability FROM lawyers WHERE user_id = $1',
    [lawyerId]
  );

  if (lawyerResult.rows.length === 0) {
    throw new NotFoundError('Lawyer not found');
  }

  const lawyer = lawyerResult.rows[0];
  const requestedDate = new Date(date as string);
  const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Check if lawyer is available on this day
  // Skip availability check for now - using JSONB availability field
  // TODO: Implement proper availability checking with JSONB field
  
  // Get existing consultations for the lawyer on the requested date
  const consultationsResult = await pool.query(
    `SELECT scheduled_at, duration 
     FROM consultations 
     WHERE lawyer_id = $1 
       AND DATE(scheduled_at) = DATE($2) 
       AND status NOT IN ('cancelled', 'completed')
     ORDER BY scheduled_at`,
    [lawyerId, date]
  );

  const bookedSlots = consultationsResult.rows.map(consultation => ({
    start: new Date(consultation.scheduled_at),
    end: new Date(new Date(consultation.scheduled_at).getTime() + consultation.duration * 60000)
  }));

  // Generate available time slots (simplified - every hour from 9 AM to 5 PM)
  const availableSlots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    const slotStart = new Date(date as string);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60000); // 1 hour slots
    
    // Check if this slot conflicts with any booked consultation
    const hasConflict = bookedSlots.some(booked => 
      (slotStart < booked.end && slotEnd > booked.start)
    );
    
    // Only include slots that are in the future and don't conflict
    if (!hasConflict && slotStart > new Date()) {
      availableSlots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString()
      });
    }
  }

  res.status(200).json({
    success: true,
    data: availableSlots
  });
});

// @desc    Send message in consultation
// @route   POST /api/consultations/:id/messages
// @access  Private
export const sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { message, message_type = 'text' } = req.body;

  // Check if consultation exists and user has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization
  if (userRole === 'lawyer' && consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to send messages in this consultation', 403);
  } else if (userRole === 'user' && consultation.client_id !== userId) {
    throw new AppError('Not authorized to send messages in this consultation', 403);
  }

  // Insert message
  const result = await pool.query(
    'INSERT INTO messages (consultation_id, sender_id, message, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, userId, message, message_type]
  );

  const newMessage = result.rows[0];

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      id: newMessage.id,
      message: newMessage.message,
      messageType: newMessage.message_type,
      senderId: newMessage.sender_id,
      createdAt: newMessage.created_at
    }
  });
});

// @desc    Get consultation messages
// @route   GET /api/consultations/:id/messages
// @access  Private
export const getMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const { page, limit, offset } = req.pagination!;

  // Check if consultation exists and user has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization
  if (userRole === 'lawyer' && consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to view messages in this consultation', 403);
  } else if (userRole === 'user' && consultation.client_id !== userId) {
    throw new AppError('Not authorized to view messages in this consultation', 403);
  }

  // Get total count
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM messages WHERE consultation_id = $1',
    [id]
  );
  const total = parseInt(countResult.rows[0].count);

  // Get messages with pagination
  const result = await pool.query(
    `SELECT 
      m.id, m.message, m.message_type, m.sender_id, m.created_at,
      u.name as sender_name, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.consultation_id = $1
    ORDER BY m.created_at ASC
    LIMIT $2 OFFSET $3`,
    [id, limit, offset]
  );

  const messages = result.rows.map(msg => ({
    id: msg.id,
    message: msg.message,
    messageType: msg.message_type,
    senderId: msg.sender_id,
    createdAt: msg.created_at,
    sender: {
      name: msg.sender_name,
      avatar: msg.sender_avatar
    }
  }));

  res.status(200).json({
    success: true,
    data: messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Generate video call token
// @route   POST /api/consultations/:id/video-token
// @access  Private
export const generateVideoToken = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  // Check if consultation exists and user has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization
  if (userRole === 'lawyer' && consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to join this consultation', 403);
  } else if (userRole === 'user' && consultation.client_id !== userId) {
    throw new AppError('Not authorized to join this consultation', 403);
  }

  // Check if consultation is scheduled for video
  if (consultation.type !== 'video') {
    throw new AppError('This consultation is not scheduled for video call', 400);
  }

  // Generate Agora token
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  const channelName = `consultation_${id}`;
  const uid = parseInt(userId.replace(/-/g, '').substring(0, 8), 16); // Convert UUID to number
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  res.status(200).json({
    success: true,
    data: {
      token,
      channelName,
      uid,
      appId
    }
  });
});

// @desc    Update consultation status (Lawyer only)
// @route   PUT /api/consultations/:id/status
// @access  Private/Lawyer
export const updateConsultationStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { status } = req.body;

  // Check if consultation exists and lawyer has access
  const consultationResult = await pool.query(
    `SELECT c.*, l.user_id as lawyer_user_id
     FROM consultations c
     JOIN lawyers l ON c.lawyer_id = l.id
     WHERE c.id = $1`,
    [id]
  );

  if (consultationResult.rows.length === 0) {
    throw new NotFoundError('Consultation not found');
  }

  const consultation = consultationResult.rows[0];

  // Check authorization (only lawyer can update status)
  if (consultation.lawyer_user_id !== userId) {
    throw new AppError('Not authorized to update this consultation status', 403);
  }

  // Update consultation status
  const result = await pool.query(
    'UPDATE consultations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );

  const updatedConsultation = result.rows[0];

  res.status(200).json({
    success: true,
    message: 'Consultation status updated successfully',
    data: {
      id: updatedConsultation.id,
      status: updatedConsultation.status,
      updatedAt: updatedConsultation.updated_at
    }
  });
});