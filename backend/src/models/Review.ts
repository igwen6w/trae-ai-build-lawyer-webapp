import { pool } from '../config/database';
import { IReview } from '../types';

export class ReviewModel {
  static async create(reviewData: Partial<IReview>): Promise<IReview> {
    const {
      consultation_id,
      client_id,
      lawyer_id,
      rating,
      comment = '',
      is_anonymous = false
    } = reviewData;
    
    const query = `
      INSERT INTO reviews (
        consultation_id, client_id, lawyer_id, rating, comment, is_anonymous
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      consultation_id,
      client_id,
      lawyer_id,
      rating,
      comment,
      is_anonymous
    ]);
    
    return result.rows[0];
  }

  static async findById(id: string): Promise<IReview | null> {
    const query = `
      SELECT r.*, 
             u1.name as client_name, u1.avatar as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  static async findByLawyerId(lawyerId: string, limit: number = 10, offset: number = 0): Promise<IReview[]> {
    const query = `
      SELECT r.*, 
             CASE 
               WHEN r.is_anonymous = true THEN 'Anonymous'
               ELSE u1.name
             END as client_name,
             CASE 
               WHEN r.is_anonymous = true THEN NULL
               ELSE u1.avatar
             END as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.lawyer_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [lawyerId, limit, offset]);
    return result.rows;
  }

  static async findByClientId(clientId: string, limit: number = 10, offset: number = 0): Promise<IReview[]> {
    const query = `
      SELECT r.*, 
             u1.name as client_name, u1.avatar as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.client_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [clientId, limit, offset]);
    return result.rows;
  }

  static async findByConsultationId(consultationId: string): Promise<IReview | null> {
    const query = `
      SELECT r.*, 
             u1.name as client_name, u1.avatar as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.consultation_id = $1
    `;
    const result = await pool.query(query, [consultationId]);
    
    return result.rows[0] || null;
  }

  static async updateById(id: string, updateData: Partial<IReview>): Promise<IReview | null> {
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'consultation_id' && key !== 'client_id' && 
      key !== 'lawyer_id' && key !== 'created_at' && key !== 'updated_at'
    );
    
    if (fields.length === 0) return null;
    
    const values = fields.map(field => updateData[field as keyof IReview]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE reviews 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM reviews WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async findByRating(rating: number, limit: number = 10, offset: number = 0): Promise<IReview[]> {
    const query = `
      SELECT r.*, 
             CASE 
               WHEN r.is_anonymous = true THEN 'Anonymous'
               ELSE u1.name
             END as client_name,
             CASE 
               WHEN r.is_anonymous = true THEN NULL
               ELSE u1.avatar
             END as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.rating = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [rating, limit, offset]);
    return result.rows;
  }

  static async findByRatingRange(minRating: number, maxRating: number, limit: number = 10, offset: number = 0): Promise<IReview[]> {
    const query = `
      SELECT r.*, 
             CASE 
               WHEN r.is_anonymous = true THEN 'Anonymous'
               ELSE u1.name
             END as client_name,
             CASE 
               WHEN r.is_anonymous = true THEN NULL
               ELSE u1.avatar
             END as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.rating >= $1 AND r.rating <= $2
      ORDER BY r.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await pool.query(query, [minRating, maxRating, limit, offset]);
    return result.rows;
  }

  static async getAverageRatingByLawyerId(lawyerId: string): Promise<{ average_rating: number; total_reviews: number }> {
    const query = `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE lawyer_id = $1
    `;
    
    const result = await pool.query(query, [lawyerId]);
    const row = result.rows[0];
    
    return {
      average_rating: parseFloat(row.average_rating) || 0,
      total_reviews: parseInt(row.total_reviews) || 0
    };
  }

  static async getRatingDistributionByLawyerId(lawyerId: string): Promise<any> {
    const query = `
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews 
      WHERE lawyer_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    const result = await pool.query(query, [lawyerId]);
    
    // Initialize distribution with all possible ratings
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    
    result.rows.forEach(row => {
      distribution[row.rating as keyof typeof distribution] = parseInt(row.count);
    });
    
    return distribution;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM reviews';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async countByLawyerId(lawyerId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM reviews WHERE lawyer_id = $1';
    const result = await pool.query(query, [lawyerId]);
    return parseInt(result.rows[0].count);
  }

  static async countByClientId(clientId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM reviews WHERE client_id = $1';
    const result = await pool.query(query, [clientId]);
    return parseInt(result.rows[0].count);
  }

  static async getTopRatedLawyers(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        l.user_id,
        u.name as lawyer_name,
        u.email as lawyer_email,
        u.avatar as lawyer_avatar,
        l.specialties,
        l.hourly_rate,
        AVG(r.rating) as average_rating,
        COUNT(r.id) as total_reviews
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN reviews r ON l.user_id = r.lawyer_id
      GROUP BY l.user_id, u.name, u.email, u.avatar, l.specialties, l.hourly_rate
      HAVING COUNT(r.id) > 0
      ORDER BY average_rating DESC, total_reviews DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      user_id: row.user_id,
      lawyer_name: row.lawyer_name,
      lawyer_email: row.lawyer_email,
      lawyer_avatar: row.lawyer_avatar,
      specialties: row.specialties ? JSON.parse(row.specialties) : [],
      hourly_rate: parseFloat(row.hourly_rate),
      average_rating: parseFloat(row.average_rating),
      total_reviews: parseInt(row.total_reviews)
    }));
  }

  static async getRecentReviews(limit: number = 10, offset: number = 0): Promise<IReview[]> {
    const query = `
      SELECT r.*, 
             CASE 
               WHEN r.is_anonymous = true THEN 'Anonymous'
               ELSE u1.name
             END as client_name,
             CASE 
               WHEN r.is_anonymous = true THEN NULL
               ELSE u1.avatar
             END as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async getOverallStats(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count,
        COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymous_count
      FROM reviews
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];
    
    return {
      total_reviews: parseInt(stats.total_reviews),
      average_rating: parseFloat(stats.average_rating) || 0,
      rating_distribution: {
        5: parseInt(stats.five_star_count),
        4: parseInt(stats.four_star_count),
        3: parseInt(stats.three_star_count),
        2: parseInt(stats.two_star_count),
        1: parseInt(stats.one_star_count)
      },
      anonymous_count: parseInt(stats.anonymous_count)
    };
  }

  static async searchReviews(searchTerm: string, limit: number = 10, offset: number = 0): Promise<IReview[]> {
    const query = `
      SELECT r.*, 
             CASE 
               WHEN r.is_anonymous = true THEN 'Anonymous'
               ELSE u1.name
             END as client_name,
             CASE 
               WHEN r.is_anonymous = true THEN NULL
               ELSE u1.avatar
             END as client_avatar,
             u2.name as lawyer_name, u2.avatar as lawyer_avatar,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM reviews r
      JOIN users u1 ON r.client_id = u1.id
      JOIN users u2 ON r.lawyer_id = u2.id
      JOIN consultations c ON r.consultation_id = c.id
      WHERE r.comment ILIKE $1 OR u2.name ILIKE $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.query(query, [searchPattern, limit, offset]);
    return result.rows;
  }

  static async getMonthlyReviewStats(year: number): Promise<any[]> {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as review_count,
        AVG(rating) as average_rating
      FROM reviews
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [year]);
    
    // Fill in missing months with zero values
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      review_count: 0,
      average_rating: 0
    }));
    
    result.rows.forEach(row => {
      const monthIndex = parseInt(row.month) - 1;
      monthlyData[monthIndex] = {
        month: parseInt(row.month),
        review_count: parseInt(row.review_count),
        average_rating: parseFloat(row.average_rating) || 0
      };
    });
    
    return monthlyData;
  }

  static async hasUserReviewedConsultation(clientId: string, consultationId: string): Promise<boolean> {
    const query = 'SELECT id FROM reviews WHERE client_id = $1 AND consultation_id = $2';
    const result = await pool.query(query, [clientId, consultationId]);
    return result.rows.length > 0;
  }
}

export { ReviewModel as default };