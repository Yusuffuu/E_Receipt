const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = {
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SOCKET) {
  poolConfig.socketPath = process.env.DB_SOCKET;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
}

poolConfig.user = process.env.DB_USER;
poolConfig.password = process.env.DB_PASSWORD || '';
poolConfig.database = process.env.DB_NAME;

const pool = mariadb.createPool(poolConfig);

module.exports = pool;