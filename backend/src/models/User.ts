import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { IUser } from '../types';

export class UserModel {
  static async create(userData: Partial<IUser>): Promise<IUser> {
    const { name, email, password, phone, role = 'user' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password!, 12);
    
    const query = `
      INSERT INTO users (name, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, email, hashedPassword, phone, role]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<IUser | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByEmailWithPassword(email: string): Promise<IUser | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async updateById(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const fields = Object.keys(updateData).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
    const values = fields.map(field => updateData[field as keyof IUser]);
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rowCount! > 0;
  }

  static async verifyEmail(id: string): Promise<boolean> {
    const query = 'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<IUser[]> {
    const query = `
      SELECT * FROM users 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async findByRole(role: string, limit: number = 10, offset: number = 0): Promise<IUser[]> {
    const query = `
      SELECT * FROM users 
      WHERE role = $1 AND is_active = true 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [role, limit, offset]);
    return result.rows;
  }

  static async updateAvatar(id: string, avatarPath: string): Promise<boolean> {
    const query = 'UPDATE users SET avatar = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [avatarPath, id]);
    return result.rowCount! > 0;
  }

  static async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    const query = 'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [isActive, id]);
    return result.rowCount! > 0;
  }
}

export default UserModel;