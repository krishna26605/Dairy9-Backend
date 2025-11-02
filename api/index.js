// C:\Users\Krishna\OneDrive\Desktop\backend-dairy9\Dairy9-BACKEND-NEW\Dairy9-Backend\api\index.js
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
connectDB();

const app = express();
let isConnected = false;

// Middleware
app.use(cors(productionConfig.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Dairy9 Backend Running on Vercel 🚀',
    time: new Date().toISOString(),
  });
});

// Convert Express app to Vercel serverless function
export default async function handler(req, res) {
  try {
    // Connect to DB if not already connected
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    // Simple health check for root route
    if (req.url === '/') {
      return res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    }

    // Handle main application routes
    return app(req, res);
  } catch (error) {
    console.error('[Handler Error]:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
