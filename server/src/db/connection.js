const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

let sslConfig = undefined;
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
  sslConfig = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
  if (process.env.DB_CA_PATH) {
    const rootDir = path.join(__dirname, '..', '..', '..');
    const caFullPath = path.isAbsolute(process.env.DB_CA_PATH)
      ? process.env.DB_CA_PATH
      : path.join(rootDir, process.env.DB_CA_PATH);
    if (fs.existsSync(caFullPath)) {
      sslConfig.ca = fs.readFileSync(caFullPath);
    }
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'leave_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ...(sslConfig ? { ssl: sslConfig } : {}),
});

// Test the connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    connection.release();
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, testConnection };
