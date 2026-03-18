const mysql = require('mysql2/promise');
const { env } = require('./env');

const dbConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected to database:', dbConfig.database);
    connection.release();
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
