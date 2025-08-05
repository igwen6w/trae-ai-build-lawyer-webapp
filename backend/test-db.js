require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lawyer',
  user: 'lawyer',
  password: process.env.DB_PASSWORD,
});

async function testDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to database');
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log('- ' + row.table_name);
    });
    
    // Check lawyers table specifically
    try {
      const lawyersResult = await client.query('SELECT COUNT(*) FROM lawyers');
      console.log(`Lawyers table has ${lawyersResult.rows[0].count} records`);
      
      // Check table structure
      const structureResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'lawyers'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nLawyers table structure:');
      structureResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Check users table structure first
      const usersStructureResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nUsers table structure:');
      usersStructureResult.rows.forEach(row => {
        console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Test a simpler query first
      const testQuery = `
        SELECT 
          l.id,
          l.user_id,
          l.specialties,
          l.experience,
          l.education,
          l.license_number,
          l.hourly_rate,
          l.languages,
          l.location,
          l.bio,
          l.rating,
          l.review_count,
          l.availability,
          l.is_online
        FROM lawyers l
        ORDER BY l.rating DESC
        LIMIT 10 OFFSET 0
      `;
      
      const queryResult = await client.query(testQuery);
      console.log(`\nQuery executed successfully, returned ${queryResult.rows.length} rows`);
      if (queryResult.rows.length > 0) {
        console.log('Sample record:', JSON.stringify(queryResult.rows[0], null, 2));
      }
    } catch (error) {
      console.log('Lawyers table test failed:', error.message);
      console.log('Full error:', error);
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();