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

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    const migrationPath = path.join(__dirname, '../migrations/001_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Database migration completed successfully!');
    
    // Test the connection by querying users table
    const result = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Users table has ${result.rows[0].count} records`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();