const { env } = require('./config/env');
const app = require('./app');
const { testConnection } = require('./config/database');
const { initDatabase } = require('./config/initDatabase');
const { logger } = require('./utils/logger');

const PORT = env.PORT;

const start = async () => {
  await initDatabase();
  await testConnection();

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
