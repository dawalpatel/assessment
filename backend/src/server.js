require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl/Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during local development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'StoreRate API'
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(`${sequelize.getDialect().toUpperCase()} database connected successfully.`);

    app.listen(PORT, () => {
      console.log(`StoreRate API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
