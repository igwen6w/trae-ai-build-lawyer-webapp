import { pool } from '../config/database';
import { IPayment } from '../types';

export class PaymentModel {
  static async create(paymentData: Partial<IPayment>): Promise<IPayment> {
    const {
      user_id,
      consultation_id,
      amount,
      currency = 'USD',
      payment_method,
      stripe_payment_intent_id,
      description = ''
    } = paymentData;
    
    const query = `
      INSERT INTO payments (
        user_id, consultation_id, amount, currency, payment_method, 
        stripe_payment_intent_id, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id,
      consultation_id,
      amount,
      currency,
      payment_method,
      stripe_payment_intent_id,
      description
    ]);
    
    return result.rows[0];
  }

  static async findById(id: string): Promise<IPayment | null> {
    const query = `
      SELECT p.*, 
             u.name as user_name, u.email as user_email,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string, limit: number = 10, offset: number = 0): Promise<IPayment[]> {
    const query = `
      SELECT p.*, 
             u.name as user_name, u.email as user_email,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async findByConsultationId(consultationId: string): Promise<IPayment | null> {
    const query = `
      SELECT p.*, 
             u.name as user_name, u.email as user_email,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.consultation_id = $1
    `;
    const result = await pool.query(query, [consultationId]);
    
    return result.rows[0] || null;
  }

  static async findByStripePaymentIntentId(stripePaymentIntentId: string): Promise<IPayment | null> {
    const query = `
      SELECT p.*, 
             u.name as user_name, u.email as user_email,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.stripe_payment_intent_id = $1
    `;
    const result = await pool.query(query, [stripePaymentIntentId]);
    
    return result.rows[0] || null;
  }

  static async updateById(id: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'user_id' && key !== 'consultation_id' && 
      key !== 'created_at' && key !== 'updated_at'
    );
    
    if (fields.length === 0) return null;
    
    const values = fields.map(field => updateData[field as keyof IPayment]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE payments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string): Promise<boolean> {
    const query = `
      UPDATE payments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `;
    const result = await pool.query(query, [status, id]);
    return result.rowCount! > 0;
  }

  static async updateByStripePaymentIntentId(stripePaymentIntentId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'user_id' && key !== 'consultation_id' && 
      key !== 'stripe_payment_intent_id' && key !== 'created_at' && key !== 'updated_at'
    );
    
    if (fields.length === 0) return null;
    
    const values = fields.map(field => updateData[field as keyof IPayment]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE payments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [stripePaymentIntentId, ...values]);
    return result.rows[0] || null;
  }

  static async deleteById(id: string): Promise<boolean> {
    const query = 'DELETE FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount! > 0;
  }

  static async findByStatus(status: string, limit: number = 10, offset: number = 0): Promise<IPayment[]> {
    const query = `
      SELECT p.*, 
             u.name as user_name, u.email as user_email,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.status = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [status, limit, offset]);
    return result.rows;
  }

  static async findByDateRange(startDate: Date, endDate: Date, limit: number = 50, offset: number = 0): Promise<IPayment[]> {
    const query = `
      SELECT p.*, 
             u.name as user_name, u.email as user_email,
             c.type as consultation_type, c.scheduled_at, c.duration
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN consultations c ON p.consultation_id = c.id
      WHERE p.created_at >= $1 AND p.created_at <= $2
      ORDER BY p.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await pool.query(query, [startDate, endDate, limit, offset]);
    return result.rows;
  }

  static async countAll(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM payments';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async countByStatus(status: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM payments WHERE status = $1';
    const result = await pool.query(query, [status]);
    return parseInt(result.rows[0].count);
  }

  static async getStatsByStatus(): Promise<any> {
    const query = `
      SELECT status, COUNT(*) as count, SUM(amount) as total_amount
      FROM payments 
      GROUP BY status
    `;
    const result = await pool.query(query);
    
    const stats: any = {
      pending: { count: 0, total_amount: 0 },
      processing: { count: 0, total_amount: 0 },
      succeeded: { count: 0, total_amount: 0 },
      failed: { count: 0, total_amount: 0 },
      cancelled: { count: 0, total_amount: 0 },
      refunded: { count: 0, total_amount: 0 }
    };
    
    result.rows.forEach(row => {
      stats[row.status] = {
        count: parseInt(row.count),
        total_amount: parseFloat(row.total_amount) || 0
      };
    });
    
    return stats;
  }

  static async getRevenueStats(startDate?: Date, endDate?: Date): Promise<any> {
    let query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        AVG(amount) as average_amount,
        COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as successful_revenue
      FROM payments
    `;
    
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE created_at >= $1 AND created_at <= $2';
      params.push(startDate, endDate);
    }
    
    const result = await pool.query(query, params);
    const stats = result.rows[0];
    
    return {
      total_payments: parseInt(stats.total_payments),
      total_revenue: parseFloat(stats.total_revenue) || 0,
      average_amount: parseFloat(stats.average_amount) || 0,
      successful_payments: parseInt(stats.successful_payments),
      successful_revenue: parseFloat(stats.successful_revenue) || 0,
      success_rate: stats.total_payments > 0 ? 
        (parseInt(stats.successful_payments) / parseInt(stats.total_payments) * 100).toFixed(2) + '%' : '0%'
    };
  }

  static async getMonthlyRevenue(year: number): Promise<any[]> {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'succeeded' THEN amount ELSE 0 END) as successful_amount
      FROM payments
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    
    const result = await pool.query(query, [year]);
    
    // Fill in missing months with zero values
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      payment_count: 0,
      total_amount: 0,
      successful_amount: 0
    }));
    
    result.rows.forEach(row => {
      const monthIndex = parseInt(row.month) - 1;
      monthlyData[monthIndex] = {
        month: parseInt(row.month),
        payment_count: parseInt(row.payment_count),
        total_amount: parseFloat(row.total_amount) || 0,
        successful_amount: parseFloat(row.successful_amount) || 0
      };
    });
    
    return monthlyData;
  }

  static async getTopPayingUsers(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(p.id) as payment_count,
        SUM(p.amount) as total_spent,
        AVG(p.amount) as average_payment
      FROM users u
      JOIN payments p ON u.id = p.user_id
      WHERE p.status = 'succeeded'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_spent DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      payment_count: parseInt(row.payment_count),
      total_spent: parseFloat(row.total_spent),
      average_payment: parseFloat(row.average_payment)
    }));
  }

  static async getPaymentMethodStats(): Promise<any> {
    const query = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM payments
      WHERE status = 'succeeded'
      GROUP BY payment_method
      ORDER BY count DESC
    `;
    
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      payment_method: row.payment_method,
      count: parseInt(row.count),
      total_amount: parseFloat(row.total_amount),
      average_amount: parseFloat(row.average_amount)
    }));
  }
}

export { PaymentModel as default };