const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// Load env
dotenv.config();

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const positionRoutes = require('./routes/positionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const documentRoutes = require('./routes/documentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const legalRoutes = require('./routes/legalRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Allowed origins for CORS with credentials
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'Seemanchal Express API Server',
    organization: {
      name: process.env.ORGANIZATION_NAME || 'Seemanchal Express',
      email: process.env.ORGANIZATION_EMAIL || 'mail@seemanchalexpress.in',
      phone: process.env.ORGANIZATION_PHONE || '9871023184',
      address: process.env.ORGANIZATION_ADDRESS || 'F 65, Shaheen Bagh, Okhla, New Delhi-110025',
    },
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Seemanchal Express Backend API is running.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5005;

// Connect DB & start server
const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Unable to start because MySQL connection/schema setup failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  Seemanchal Express Server Running on port ${PORT}`);
    console.log(`  API URL: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
};

startServer();
