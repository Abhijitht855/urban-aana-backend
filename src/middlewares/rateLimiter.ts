// import rateLimit from 'express-rate-limit';

// // General API limiter
// export const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,                  // 100 requests per 15 min
//   message: { message: 'Too many requests, please try again later' },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Auth routes limiter — stricter
// export const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10,                   // 10 attempts per 15 min
//   message: { message: 'Too many login attempts, please try again later' },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 attempts
  message: { message: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, 
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});