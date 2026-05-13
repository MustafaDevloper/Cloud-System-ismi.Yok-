import Log from '../models/Log.js';

export const requestLogger = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    try {
      await Log.create({
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        endpoint: req.originalUrl,
        status: res.statusCode,
        responseTime: duration,
        userId: req.user ? req.user._id : null,
        userAgent: req.get('User-Agent'),
      });
    } catch (err) {
      console.error('Log creation failed:', err);
    }
  });

  next();
};
