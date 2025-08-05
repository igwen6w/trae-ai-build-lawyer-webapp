import { pool } from '../config/database';
import { IAdmin, IAdminLog, ISystemSetting } from '../types';

export class AdminModel {
  static async create(adminData: Partial<IAdmin>): Promise<IAdmin> {
    const { user_id, role = 'admin', permissions = {} } = adminData;
    
    const query = `
      INSERT INTO admins (user_id, role, permissions)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, role, JSON.stringify(permissions)]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<IAdmin | null> {
    const query = 'SELECT * FROM admins WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<IAdmin | null> {
    const query = 'SELECT * FROM admins WHERE user_id = $1 AND is_active = true';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findWithUserInfo(id: string): Promise<any | null> {
    const query = `
      SELECT a.*, u.name, u.email, u.avatar
      FROM admins a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = $1 AND a.is_active = true
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT a.*, u.name, u.email, u.avatar
      FROM admins a
      JOIN users u ON a.user_id = u.id
      WHERE a.is_active = true
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async updateById(id: string, updateData: Partial<IAdmin>): Promise<IAdmin | null> {
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'user_id'
    );
    const values = fields.map(field => {
      if (field === 'permissions') {
        return JSON.stringify(updateData[field as keyof IAdmin]);
      }
      return updateData[field as keyof IAdmin];
    });
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE admins 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async updateLastLogin(id: string): Promise<boolean> {
    const query = 'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    const query = 'UPDATE admins SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [isActive, id]);
    return result.rowCount! > 0;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'UPDATE admins SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM admins WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async findByRole(role: string, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT a.*, u.name, u.email, u.avatar
      FROM admins a
      JOIN users u ON a.user_id = u.id
      WHERE a.role = $1 AND a.is_active = true
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [role, limit, offset]);
    return result.rows;
  }

  static async hasPermission(adminId: string, permission: string): Promise<boolean> {
    const admin = await this.findById(adminId);
    if (!admin) return false;
    
    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;
    
    // Check specific permission
    const permissions = admin.permissions as any;
    return permissions[permission] === true;
  }
}

export class AdminLogModel {
  static async create(logData: Partial<IAdminLog>): Promise<IAdminLog> {
    const { admin_id, action, target_type, target_id, details = {}, ip_address, user_agent } = logData;
    
    const query = `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      admin_id, action, target_type, target_id, 
      JSON.stringify(details), ip_address, user_agent
    ]);
    return result.rows[0];
  }

  static async findByAdminId(adminId: string, limit: number = 50, offset: number = 0): Promise<IAdminLog[]> {
    const query = `
      SELECT * FROM admin_logs 
      WHERE admin_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [adminId, limit, offset]);
    return result.rows;
  }

  static async findAll(limit: number = 100, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT al.*, u.name as admin_name, u.email as admin_email
      FROM admin_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByAction(action: string, limit: number = 50, offset: number = 0): Promise<IAdminLog[]> {
    const query = `
      SELECT * FROM admin_logs 
      WHERE action = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [action, limit, offset]);
    return result.rows;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM admin_logs';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const query = `
      DELETE FROM admin_logs 
      WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
    `;
    const result = await pool.query(query);
    return result.rowCount || 0;
  }
}

export class SystemSettingModel {
  static async create(settingData: Partial<ISystemSetting>): Promise<ISystemSetting> {
    const { key, value, description, category = 'general', is_public = false, updated_by } = settingData;
    
    const query = `
      INSERT INTO system_settings (key, value, description, category, is_public, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      key, JSON.stringify(value), description, category, is_public, updated_by
    ]);
    return result.rows[0];
  }

  static async findByKey(key: string): Promise<ISystemSetting | null> {
    const query = 'SELECT * FROM system_settings WHERE key = $1';
    const result = await pool.query(query, [key]);
    return result.rows[0] || null;
  }

  static async findAll(limit: number = 100, offset: number = 0): Promise<ISystemSetting[]> {
    const query = `
      SELECT * FROM system_settings 
      ORDER BY category, key 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByCategory(category: string): Promise<ISystemSetting[]> {
    const query = 'SELECT * FROM system_settings WHERE category = $1 ORDER BY key';
    const result = await pool.query(query, [category]);
    return result.rows;
  }

  static async findPublicSettings(): Promise<ISystemSetting[]> {
    const query = 'SELECT * FROM system_settings WHERE is_public = true ORDER BY category, key';
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateByKey(key: string, updateData: Partial<ISystemSetting>): Promise<ISystemSetting | null> {
    const fields = Object.keys(updateData).filter(field => 
      field !== 'id' && field !== 'key' && field !== 'created_at' && field !== 'updated_at'
    );
    const values = fields.map(field => {
      if (field === 'value') {
        return JSON.stringify(updateData[field as keyof ISystemSetting]);
      }
      return updateData[field as keyof ISystemSetting];
    });
    
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE system_settings 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE key = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [key, ...values]);
    return result.rows[0] || null;
  }

  static async deleteByKey(key: string): Promise<boolean> {
    const query = 'DELETE FROM system_settings WHERE key = $1';
    const result = await pool.query(query, [key]);
    return result.rowCount! > 0;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM system_settings';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async getCategories(): Promise<string[]> {
    const query = 'SELECT DISTINCT category FROM system_settings ORDER BY category';
    const result = await pool.query(query);
    return result.rows.map(row => row.category);
  }
}

export default AdminModel;