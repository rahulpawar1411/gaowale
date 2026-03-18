const pinoHttp = require('pino-http');
const { logger } = require('../utils/logger');

const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || undefined,
  customLogLevel: (res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

module.exports = { requestLogger };

