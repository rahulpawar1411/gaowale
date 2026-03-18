const { env } = require('../config/env');
const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const status = Number(err.status || err.statusCode || 500);
  const message = err.publicMessage || err.message || 'Internal Server Error';

  if (status >= 500) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ err }, 'Request error');
  }

  const payload = { success: false, message };
  if (env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

module.exports = errorHandler;
