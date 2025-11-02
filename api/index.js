// api/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../config/db.js';
import { productionConfig } from '../config/production.js';
import authRoutes from '../routes/auth.routes.js';
import customerRoutes from '../routes/customer.routes.js';
import categoryRoutes from '../routes/category.routes.js';
import productRoutes from '../routes/product.routes.js';
import orderRoutes from '../routes/order.routes.js';
import retailerOrderRoutes from '../routes/retailer.order.routes.js';
import paymentRoutes from '../routes/payment.routes.js';
import adminRoutes from '../routes/admin.routes.js';
import locationRoutes from '../routes/location.routes.js';

dotenv.config();
const app = express();

// CORS configuration
app.use(cors(productionConfig?.cors || {}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB connection middleware — connects ONCE per serverless instance
async function ensureDB(req, res, next) {
  try {
    if (!global._mongoConnected) {
      // this awaits first connect, subsequent warm requests will skip
      await connectDB();
      global._mongoConnected = true;
      console.log('✅ MongoDB connection established (serverless warm instance)');
    }
    return next();
  } catch (err) {
    console.error('DB connect failed in ensureDB middleware:', err);
    return res.status(500).json({ success: false, message: 'Database connection error' });
  }
}

// Attach DB middleware BEFORE routes
app.use(ensureDB);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/catalog', categoryRoutes);
app.use('/api/catalog', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/orders/retailer', retailerOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/location', locationRoutes);

app.get('/', (req, res) => res.json({
  message: 'Dairy9 Backend Running on Vercel',
  timestamp: new Date().toISOString()
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// EXPORT app for Vercel (do NOT call app.listen)
export default app;
