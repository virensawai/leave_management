/**
 * Database setup script — runs schema.sql and seed.sql against MySQL.
 * Usage: node setup-db.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  let sslConfig = undefined;
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    sslConfig = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    };
    if (process.env.DB_CA_PATH) {
      const rootDir = path.join(__dirname, '..');
      const caFullPath = path.isAbsolute(process.env.DB_CA_PATH)
        ? process.env.DB_CA_PATH
        : path.join(rootDir, process.env.DB_CA_PATH);
      if (fs.existsSync(caFullPath)) {
        sslConfig.ca = fs.readFileSync(caFullPath);
      }
    }
  }

  // Connect without database first (to create it)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    ...(sslConfig ? { ssl: sslConfig } : {}),
  });

  console.log('✓ Connected to MySQL');

  // Read and execute schema
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('Running schema.sql...');
  await connection.query(schema);
  console.log('✓ Schema created');

  // Read and execute seed data
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  const seed = fs.readFileSync(seedPath, 'utf8');
  console.log('Running seed.sql...');
  await connection.query(seed);
  console.log('✓ Seed data inserted');

  await connection.end();
  console.log('\n✓ Database setup complete!');
}

run().catch((err) => {
  console.error('✗ Database setup failed:', err.message);
  process.exit(1);
});
