import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_productivity_platform',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function checkDbConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 AS connected, DATABASE() AS current_db');
    connection.release();
    return {
      connected: true,
      database: rows[0]?.current_db || process.env.DB_NAME,
      message: 'MySQL Database connected successfully'
    };
  } catch (error) {
    return {
      connected: false,
      database: process.env.DB_NAME,
      message: error.message || 'Failed to connect to MySQL database',
      code: error.code
    };
  }
}

export default pool;
