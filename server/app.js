const express = require('express');
const path = require('path');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const masterRoutes = require('./routes/masterRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const authorizationRoutes = require('./routes/authorizationRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public access to uploaded files (lightweight static serving)
app.use(
  '/files',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    immutable: true,
  })
);

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/items', authenticate, itemRoutes);
app.use('/api/master', authenticate, masterRoutes);
app.use('/api/registrations', authenticate, registrationRoutes);
app.use('/api/authorization', authenticate, authorizationRoutes);
app.use('/api/files', authenticate, fileRoutes);

app.use(errorHandler);

module.exports = app;
