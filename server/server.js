const { env } = require('./config/env');
const app = require('./app');
const { testConnection } = require('./config/database');
const { initDatabase } = require('./config/initDatabase');
const { logger } = require('./utils/logger');

const PORT = env.PORT;

const start = async () => {
  await initDatabase();
  await testConnection();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      logger.error(
        `Port ${PORT} is already in use. Stop the other process or change PORT in server/.env`
      );
      process.exit(1);
    }
    logger.error({ err }, 'Server listen error');
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
