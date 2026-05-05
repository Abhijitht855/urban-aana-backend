// import express, { Application, Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import authRoutes from './routes/auth.routes';
// import { apiLimiter, authLimiter } from './middlewares/rateLimiter';

// const app: Application = express();

// // Security middlewares
// app.use(helmet());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? process.env.CLIENT_URL
//     : 'http://localhost:3000',
//   credentials: true,
// }));

// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Rate limiters
// app.use('/api', apiLimiter);           
// app.use('/api/auth', authLimiter); 

// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// // Routes
// app.use('/api/auth', authRoutes);

// app.get('/', (req: Request, res: Response) => {
//   res.json({ message: '🚀 Ecommerce API is running!' });
// });

// app.use((req: Request, res: Response) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({
//     message: err.message,
//     stack: process.env.NODE_ENV === 'production' ? null : err.stack,
//   });
// });

// export default app;

// import express, { Application, Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import authRoutes from './routes/auth.routes';
// import { apiLimiter, authLimiter } from './middlewares/rateLimiter';
// import cookieParser from 'cookie-parser';
// import categoryRoutes from './routes/category.routes';
// import productRoutes from './routes/product.routes';
// import cartRoutes from './routes/cart.routes'
// import orderRoutes from './routes/order.routes'
// import shippingRoutes from './routes/shipping.routes';
// import uploadRoutes from './routes/upload.routes';

// const app: Application = express();

// // Security middlewares
// app.use(helmet());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? process.env.CLIENT_URL
//     : 'http://localhost:3000',
//   credentials: true,
// }));

// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// // Rate limiters
// app.use('/api', apiLimiter);           
// app.use('/api/auth', authLimiter); 

// app.use(cookieParser());
// app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// // Routes
// app.use('/api/upload', uploadRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/shipping', shippingRoutes);

// app.get('/', (req: Request, res: Response) => {
//   res.json({ message: '🚀 Ecommerce API is running!' });
// });

// app.use((req: Request, res: Response) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({
//     message: err.message,
//     stack: process.env.NODE_ENV === 'production' ? null : err.stack,
//   });
// });

// export default app;


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

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiters
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: '🚀 Ecommerce API is running!' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://urbanaana.com'
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Incoming Origin:", origin);

    // allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

export default app;