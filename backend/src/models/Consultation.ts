import { pool } from '../config/database';
import { IConsultation, IMessage } from '../types';

export class ConsultationModel {
  static async create(consultationData: Partial<IConsultation>): Promise<IConsultation> {
    const {
      client_id,
      lawyer_id,
      type = 'text',
      scheduled_at,
      duration = 60,
      price,
      description = ''
    } = consultationData;
    
    const query = `
      INSERT INTO consultations (
        client_id, lawyer_id, type, scheduled_at, duration, price, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      client_id,
      lawyer_id,
      type,
      scheduled_at,
      duration,
      price,
      description
    ]);
    
    return result.rows[0];
  }

  static async findById(id: string): Promise<IConsultation | null> {
    const query = `
      SELECT c.*, 
             u1.name as client_name, u1.email as client_email, u1.avatar as client_avatar,
             u2.name as lawyer_name, u2.email as lawyer_email, u2.avatar as lawyer_avatar,
             l.hourly_rate, l.specialties
      FROM consultations c
      JOIN users u1 ON c.client_id = u1.id
      JOIN users u2 ON c.lawyer_id = u2.id
      JOIN lawyers l ON c.lawyer_id = l.user_id
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    
    const consultation = result.rows[0];
    // Parse JSON fields if any
    if (consultation.specialties) {
      consultation.specialties = JSON.parse(consultation.specialties);
    }
    
    return consultation;
  }

  static async findByUserId(userId: string, role: 'client' | 'lawyer', limit: number = 10, offset: number = 0): Promise<IConsultation[]> {
    const userField = role === 'client' ? 'client_id' : 'lawyer_id';
    
    const query = `
      SELECT c.*, 
             u1.name as client_name, u1.email as client_email, u1.avatar as client_avatar,
             u2.name as lawyer_name, u2.email as lawyer_email, u2.avatar as lawyer_avatar,
             l.hourly_rate, l.specialties
      FROM consultations c
      JOIN users u1 ON c.client_id = u1.id
      JOIN users u2 ON c.lawyer_id = u2.id
      JOIN lawyers l ON c.lawyer_id = l.user_id
      WHERE c.${userField} = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    
    return result.rows.map(consultation => {
      // Parse JSON fields if any
      if (consultation.specialties) {
        consultation.specialties = JSON.parse(consultation.specialties);
      }
      return consultation;
    });
  }

  static async updateById(id: string, updateData: Partial<IConsultation>): Promise<IConsultation | null> {
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'client_id' && key !== 'lawyer_id' && key !== 'created_at' && key !== 'updated_at'
    );
    
    if (fields.length === 0) return null;
    
    const values = fields.map(field => updateData[field as keyof IConsultation]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE consultations 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string): Promise<boolean> {
    const query = `
      UPDATE consultations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await pool.query(query, [status, id]);
    return result.rowCount! > 0;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM consultations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async findByStatus(status: string, limit: number = 10, offset: number = 0): Promise<IConsultation[]> {
    const query = `
      SELECT c.*, 
             u1.name as client_name, u1.email as client_email, u1.avatar as client_avatar,
             u2.name as lawyer_name, u2.email as lawyer_email, u2.avatar as lawyer_avatar,
             l.hourly_rate, l.specialties
      FROM consultations c
      JOIN users u1 ON c.client_id = u1.id
      JOIN users u2 ON c.lawyer_id = u2.id
      JOIN lawyers l ON c.lawyer_id = l.user_id
      WHERE c.status = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [status, limit, offset]);
    
    return result.rows.map(consultation => {
      // Parse JSON fields if any
      if (consultation.specialties) {
        consultation.specialties = JSON.parse(consultation.specialties);
      }
      return consultation;
    });
  }

  static async findConflicts(lawyerId: string, scheduledAt: Date, duration: number): Promise<IConsultation[]> {
    const endTime = new Date(scheduledAt.getTime() + duration * 60000);
    
    const query = `
      SELECT * FROM consultations 
      WHERE lawyer_id = $1 
        AND status IN ('accepted', 'in-progress')
        AND (
          (scheduled_at <= $2 AND scheduled_at + INTERVAL '1 minute' * duration > $2)
          OR
          (scheduled_at < $3 AND scheduled_at + INTERVAL '1 minute' * duration >= $3)
          OR
          (scheduled_at >= $2 AND scheduled_at < $3)
        )
    `;
    
    const result = await pool.query(query, [lawyerId, scheduledAt, endTime]);
    return result.rows;
  }

  static async getAvailableSlots(lawyerId: string, date: Date): Promise<any[]> {
    // Get lawyer's availability for the day
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    
    const lawyerQuery = 'SELECT availability FROM lawyers WHERE user_id = $1';
    const lawyerResult = await pool.query(lawyerQuery, [lawyerId]);
    
    if (lawyerResult.rows.length === 0) return [];
    
    const availability = JSON.parse(lawyerResult.rows[0].availability);
    const dayAvailability = availability[dayOfWeek] || [];
    
    // Get existing consultations for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const consultationsQuery = `
      SELECT scheduled_at, duration FROM consultations 
      WHERE lawyer_id = $1 
        AND scheduled_at >= $2 
        AND scheduled_at <= $3
        AND status IN ('accepted', 'in-progress')
    `;
    
    const consultationsResult = await pool.query(consultationsQuery, [lawyerId, startOfDay, endOfDay]);
    const bookedSlots = consultationsResult.rows;
    
    // Calculate available slots
    const availableSlots: any[] = [];
    
    dayAvailability.forEach((slot: any) => {
      if (!slot.available) return;
      
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);
      
      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);
      
      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);
      
      // Check for conflicts with booked slots
      let currentTime = new Date(slotStart);
      
      while (currentTime < slotEnd) {
        const slotEndTime = new Date(currentTime.getTime() + 60 * 60000); // 1 hour slot
        
        if (slotEndTime > slotEnd) break;
        
        const hasConflict = bookedSlots.some(booking => {
          const bookingStart = new Date(booking.scheduled_at);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
          
          return (
            (currentTime >= bookingStart && currentTime < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (currentTime <= bookingStart && slotEndTime >= bookingEnd)
          );
        });
        
        if (!hasConflict) {
          availableSlots.push({
            start: currentTime.toISOString(),
            end: slotEndTime.toISOString()
          });
        }
        
        currentTime = new Date(currentTime.getTime() + 60 * 60000); // Move to next hour
      }
    });
    
    return availableSlots;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM consultations';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async getStatsByStatus(): Promise<any> {
    const query = `
      SELECT status, COUNT(*) as count 
      FROM consultations 
      GROUP BY status
    `;
    const result = await pool.query(query);
    
    const stats: any = {
      pending: 0,
      accepted: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };
    
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
    });
    
    return stats;
  }

  static async getRevenueStats(startDate?: Date, endDate?: Date): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_consultations,
        SUM(price) as total_revenue,
        AVG(price) as average_price
      FROM consultations 
      WHERE status = 'completed'
    `;
    
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ' AND created_at >= $1 AND created_at <= $2';
      params.push(startDate, endDate);
    }
    
    const result = await pool.query(query, params);
    return result.rows[0];
  }
}

export class MessageModel {
  static async create(messageData: Partial<IMessage>): Promise<IMessage> {
    const {
      consultation_id,
      sender_id,
      sender_type,
      content,
      type = 'text'
    } = messageData;
    
    const query = `
      INSERT INTO messages (consultation_id, sender_id, sender_type, content, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      consultation_id,
      sender_id,
      sender_type,
      content,
      type
    ]);
    
    return result.rows[0];
  }

  static async findByConsultationId(consultationId: string, limit: number = 50, offset: number = 0): Promise<IMessage[]> {
    const query = `
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.consultation_id = $1
      ORDER BY m.timestamp ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [consultationId, limit, offset]);
    return result.rows;
  }

  static async markAsRead(consultationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE messages 
      SET is_read = true 
      WHERE consultation_id = $1 AND sender_id != $2
    `;
    
    const result = await pool.query(query, [consultationId, userId]);
    return result.rowCount! > 0;
  }

  static async getUnreadCount(consultationId: string, userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE consultation_id = $1 AND sender_id != $2 AND is_read = false
    `;
    
    const result = await pool.query(query, [consultationId, userId]);
    return parseInt(result.rows[0].count);
  }
}

export { ConsultationModel as default };