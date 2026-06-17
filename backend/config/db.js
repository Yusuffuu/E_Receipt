const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

let poolConfig;

if (process.env.DATABASE_URL) {
  // Production: use Neon connection string
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  };
} else {
  // Local development: use individual env vars
  poolConfig = {
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '511_homes',
    max: 10,
  };

  if (process.env.DB_SOCKET) {
    poolConfig.host = process.env.DB_SOCKET;
  } else {
    poolConfig.host = process.env.DB_HOST || 'localhost';
    poolConfig.port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
  }
}

const pool = new Pool(poolConfig);

// Test connection on startup (optional)
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to database');
    release();
  }
});

const db = {
  query: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
  execute: async (text, params) => {
    const result = await pool.query(text, params);
    // For INSERT with RETURNING id, the id is in rows[0].id
    const insertId = result.rows[0]?.id ? Number(result.rows[0].id) : null;
    return { ...result, insertId };
  }
};

module.exports = db;