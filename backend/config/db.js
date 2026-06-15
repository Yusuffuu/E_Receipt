const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  max: 10,
  connectionTimeoutMillis: 0
};

if (process.env.DB_SOCKET) {
  poolConfig.host = process.env.DB_SOCKET;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
}

poolConfig.user = process.env.DB_USER;
poolConfig.password = process.env.DB_PASSWORD || '';
poolConfig.database = process.env.DB_NAME;

const pool = new Pool(poolConfig);

const db = {
  query: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
  execute: async (text, params) => {
    const result = await pool.query(text, params);
    const insertId = result.rows[0] && Object.prototype.hasOwnProperty.call(result.rows[0], 'id')
      ? Number(result.rows[0].id)
      : null;
    return { ...result, insertId };
  }
};

module.exports = db;