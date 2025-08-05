import { pool } from '../config/database';
import { ILawyer } from '../types';

export class LawyerModel {
  static async create(lawyerData: Partial<ILawyer>): Promise<ILawyer> {
    const {
      user_id,
      specialties = [],
      experience = 0,
      education = '',
      license_number = '',
      location = '',
      hourly_rate = 0,
      bio = '',
      languages = [],
      availability = {}
    } = lawyerData;
    
    const query = `
      INSERT INTO lawyers (
        user_id, specialties, experience, education, license_number,
        location, hourly_rate, bio, languages, availability
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id,
      JSON.stringify(specialties),
      experience,
      education,
      license_number,
      location,
      hourly_rate,
      bio,
      JSON.stringify(languages),
      JSON.stringify(availability)
    ]);
    
    const lawyer = result.rows[0];
    // Parse JSON fields
    lawyer.specialties = JSON.parse(lawyer.specialties);
    lawyer.languages = JSON.parse(lawyer.languages);
    lawyer.availability = JSON.parse(lawyer.availability);
    
    return lawyer;
  }

  static async findById(id: string): Promise<ILawyer | null> {
    const query = 'SELECT * FROM lawyers WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    
    const lawyer = result.rows[0];
    // Parse JSON fields
    lawyer.specialties = JSON.parse(lawyer.specialties);
    lawyer.languages = JSON.parse(lawyer.languages);
    lawyer.availability = JSON.parse(lawyer.availability);
    
    return lawyer;
  }

  static async findByUserId(userId: string): Promise<ILawyer | null> {
    const query = 'SELECT * FROM lawyers WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const lawyer = result.rows[0];
    // Parse JSON fields
    lawyer.specialties = JSON.parse(lawyer.specialties);
    lawyer.languages = JSON.parse(lawyer.languages);
    lawyer.availability = JSON.parse(lawyer.availability);
    
    return lawyer;
  }

  static async updateById(id: string, updateData: Partial<ILawyer>): Promise<ILawyer | null> {
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'updated_at'
    );
    
    if (fields.length === 0) return null;
    
    // Handle JSON fields
    const values = fields.map(field => {
      const value = updateData[field as keyof ILawyer];
      if (field === 'specialties' || field === 'languages' || field === 'availability') {
        return JSON.stringify(value);
      }
      return value;
    });
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE lawyers 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    
    if (result.rows.length === 0) return null;
    
    const lawyer = result.rows[0];
    // Parse JSON fields
    lawyer.specialties = JSON.parse(lawyer.specialties);
    lawyer.languages = JSON.parse(lawyer.languages);
    lawyer.availability = JSON.parse(lawyer.availability);
    
    return lawyer;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM lawyers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<ILawyer[]> {
    const query = `
      SELECT l.*, u.name, u.email, u.avatar, u.is_verified
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true
      ORDER BY l.created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    
    return result.rows.map(lawyer => {
      // Parse JSON fields
      lawyer.specialties = JSON.parse(lawyer.specialties);
      lawyer.languages = JSON.parse(lawyer.languages);
      lawyer.availability = JSON.parse(lawyer.availability);
      return lawyer;
    });
  }

  static async search(filters: any, limit: number = 10, offset: number = 0): Promise<ILawyer[]> {
    let whereConditions = ['u.is_active = true'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (filters.specialties && filters.specialties.length > 0) {
      whereConditions.push(`l.specialties::jsonb ?| $${paramIndex}`);
      queryParams.push(filters.specialties);
      paramIndex++;
    }

    if (filters.location) {
      whereConditions.push(`l.location ILIKE $${paramIndex}`);
      queryParams.push(`%${filters.location}%`);
      paramIndex++;
    }

    if (filters.minRating) {
      whereConditions.push(`l.rating >= $${paramIndex}`);
      queryParams.push(filters.minRating);
      paramIndex++;
    }

    if (filters.maxHourlyRate) {
      whereConditions.push(`l.hourly_rate <= $${paramIndex}`);
      queryParams.push(filters.maxHourlyRate);
      paramIndex++;
    }

    if (filters.isOnline !== undefined) {
      whereConditions.push(`l.is_online = $${paramIndex}`);
      queryParams.push(filters.isOnline);
      paramIndex++;
    }

    if (filters.experience) {
      whereConditions.push(`l.experience >= $${paramIndex}`);
      queryParams.push(filters.experience);
      paramIndex++;
    }

    const query = `
      SELECT l.*, u.name, u.email, u.avatar, u.is_verified
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY l.rating DESC, l.review_count DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const result = await pool.query(query, queryParams);
    
    return result.rows.map(lawyer => {
      // Parse JSON fields
      lawyer.specialties = JSON.parse(lawyer.specialties);
      lawyer.languages = JSON.parse(lawyer.languages);
      lawyer.availability = JSON.parse(lawyer.availability);
      return lawyer;
    });
  }

  static async updateOnlineStatus(id: string, isOnline: boolean): Promise<boolean> {
    const query = 'UPDATE lawyers SET is_online = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [isOnline, id]);
    return result.rowCount! > 0;
  }

  static async updateRating(id: string, rating: number, reviewCount: number): Promise<boolean> {
    const query = `
      UPDATE lawyers 
      SET rating = $1, review_count = $2, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
    `;
    const result = await pool.query(query, [rating, reviewCount, id]);
    return result.rowCount! > 0;
  }

  static async updateAvailability(id: string, availability: any): Promise<boolean> {
    const query = `
      UPDATE lawyers 
      SET availability = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await pool.query(query, [JSON.stringify(availability), id]);
    return result.rowCount! > 0;
  }

  static async getTopRated(limit: number = 10): Promise<ILawyer[]> {
    const query = `
      SELECT l.*, u.name, u.email, u.avatar, u.is_verified
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true AND l.review_count > 0
      ORDER BY l.rating DESC, l.review_count DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(lawyer => {
      // Parse JSON fields
      lawyer.specialties = JSON.parse(lawyer.specialties);
      lawyer.languages = JSON.parse(lawyer.languages);
      lawyer.availability = JSON.parse(lawyer.availability);
      return lawyer;
    });
  }

  static async countAll(): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE u.is_active = true
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

export default LawyerModel;