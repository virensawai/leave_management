const app = require('./src/app');
const { testConnection } = require('./src/db/connection');

const PORT = process.env.PORT || 5000;

async function start() {
  // Test database connection before starting
  await testConnection();

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
