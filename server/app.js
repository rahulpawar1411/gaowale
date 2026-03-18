const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const itemRoutes = require('./routes/itemRoutes');
const masterRoutes = require('./routes/masterRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const authorizationRoutes = require('./routes/authorizationRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/authMiddleware');
const { requestLogger } = require('./middleware/requestLogger');
const { notFound } = require('./middleware/notFound');
const { env } = require('./config/env');

const app = express();

if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

app.use(requestLogger);
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = String(env.CORS_ORIGIN || '*')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (allowed.includes('*')) return cb(null, true);
      if (!origin) return cb(null, true); // same-origin / server-to-server
      if (allowed.includes(origin)) return cb(null, true);
      const err = new Error('CORS not allowed');
      err.status = 403;
      return cb(err);
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));

// In development we keep rate limiting very permissive to avoid blocking normal UI usage.
const effectiveRateLimitMax =
  env.NODE_ENV === 'development' ? Math.max(env.RATE_LIMIT_MAX, 5000) : env.RATE_LIMIT_MAX;

app.use('/api', (req, res, next) => {
  // Never rate-limit health checks (useful for monitoring/dev tools).
  if (req.path === '/health') return next();
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: effectiveRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
    handler: (req2, res2, next2, options) => {
      res2.status(options.statusCode || 429).json({
        success: false,
        message:
          (options && options.message && options.message.message) ||
          'Too many requests, please try again later.',
      });
    },
  })(req, res, next);
});

// Public access to uploaded files (lightweight static serving)
app.use(
  '/files',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', env: env.NODE_ENV });
});

app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/items', authenticate, itemRoutes);
app.use('/api/master', authenticate, masterRoutes);
app.use('/api/registrations', authenticate, registrationRoutes);
app.use('/api/authorization', authenticate, authorizationRoutes);
app.use('/api/files', authenticate, fileRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
