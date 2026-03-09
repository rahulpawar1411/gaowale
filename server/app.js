const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const masterRoutes = require('./routes/masterRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/items', authenticate, itemRoutes);
app.use('/api/master', authenticate, masterRoutes);
app.use('/api/registrations', authenticate, registrationRoutes);

app.use(errorHandler);

module.exports = app;
