const path = require('path');
const dotenv = require('dotenv');
const { cleanEnv, str, port, num, bool } = require('envalid');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const env = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development', choices: ['development', 'test', 'production'] }),
  PORT: port({ default: 5001 }),

  DB_HOST: str({ default: 'localhost' }),
  DB_PORT: num({ default: 3306 }),
  DB_USER: str({ default: 'root' }),
  DB_PASSWORD: str({ default: '' }),
  DB_NAME: str({ default: 'gao0.2' }),
  AUTO_INIT_DB: bool({ default: true }),

  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),

  // Comma-separated list. Use "*" only for local development.
  CORS_ORIGIN: str({ default: '*' }),

  TRUST_PROXY: bool({ default: false }),
  BODY_LIMIT: str({ default: '2mb' }),

  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }),
  RATE_LIMIT_MAX: num({ default: 300 }),

  SUPER_ADMIN_PHONE: str({ default: '1234567890' }),
});

module.exports = { env };

