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

// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
//   'http://localhost:5173',
//   'http://127.0.0.1:5173',
//   'https://urbanaana.com'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     console.log("Incoming Origin:", origin);

//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   exposedHeaders: ['x-total-count']
// }));


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


// export default app;

// import express, { Application, Request, Response } from 'express';
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

// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://127.0.0.1:3000',
//   'http://localhost:5173',  
//   'http://127.0.0.1:5173',
//   'https://urbanaana.com'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
// }));


// // Rate limiters
// // app.use('/api', apiLimiter);
// // app.use('/api/auth', authLimiter);

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

// 1. Proxy Trust (Render/DigitalOcean/AWS പോലുള്ള ക്ലൗഡിൽ ലൈവ് ആക്കുമ്പോൾ ഇത് നിർബന്ധമാണ്)
app.set('trust proxy', 1);

// 2. Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 3. Security Middlewares
app.use(helmet()); // സെക്യൂരിറ്റി ഹെഡറുകൾ ചേർക്കുന്നു

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://urbanaana.com',
  'https://www.urbanaana.com',
  'https://admin.urbanaana.com'
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

// 4. Rate Limiters (ബാക്കെൻഡിനെ അറ്റാക്കുകളിൽ നിന്ന് സംരക്ഷിക്കുന്നു)
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: '🚀 Urbanaana Secure API is running!' });
});

// 6. 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 7. Global Error Handler (ഏതെങ്കിലും എപിഐയിൽ എറർ വന്നാൽ സിസ്റ്റം ഡൗൺ ആകാതെ ഇത് തടയും)
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