const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function runAdminMigration() {
  try {
    console.log('🔄 Running admin tables migration...');
    
    const migrationPath = path.join(__dirname, '../migrations/004_create_admin_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Admin tables migration completed successfully!');
    
    // Test the connection by querying admin tables
    const adminResult = await pool.query('SELECT COUNT(*) FROM admins');
    console.log(`📊 Admins table has ${adminResult.rows[0].count} records`);
    
    const settingsResult = await pool.query('SELECT COUNT(*) FROM system_settings');
    console.log(`📊 System settings table has ${settingsResult.rows[0].count} records`);
    
    const logsResult = await pool.query('SELECT COUNT(*) FROM admin_logs');
    console.log(`📊 Admin logs table has ${logsResult.rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Admin migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAdminMigration();