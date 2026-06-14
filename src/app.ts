import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter';
import cookieParser from 'cookie-parser';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes'
import orderRoutes from './routes/order.routes'
import shippingRoutes from './routes/shipping.routes';
import uploadRoutes from './routes/upload.routes';
import bannerRoutes from './routes/banner.routes';

const app: Application = express();

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet({
  contentSecurityPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://urbanaana.com',
  'https://www.urbanaana.com',
  'https://admin.urbanaana.com',
  'https://urban-aana-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/banners', bannerRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: '🚀 Urbanaana Secure API is running!' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Error]: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;