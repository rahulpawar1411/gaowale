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

app.use(
  '/api',
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

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
