const pino = require('pino');
const { env } = require('../config/env');

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'req.body.password', 'req.body.password_hash', '*.password'],
    remove: true,
  },
});

module.exports = { logger };

