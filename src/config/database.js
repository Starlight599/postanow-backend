const { Pool } = require('pg');

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Force initial test connection
pool.query('SELECT 1')
  .then(() => console.log('✅ Database connection test successful'))
  .catch(err => console.error('❌ Database test failed:', err));

module.exports = pool;
