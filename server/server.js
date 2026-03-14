require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { initDatabase } = require('./config/initDatabase');

const PORT = process.env.PORT || 5001;

const start = async () => {
  await initDatabase();
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
