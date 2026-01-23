import { prisma } from '../config/database.init.js';

let isDBReady = false;
let wakeUpAttempts = 0;
const MAX_WAKE_ATTEMPTS = 3;

/**
 * Middleware to ensure database is awake before handling requests
 */
export async function ensureDBAwake(req, res, next) {
  // Skip for health check and wake-db endpoints
  if (req.path === '/health' || req.path === '/api/wake-db') {
    return next();
  }

  if (isDBReady) {
    return next();
  }

  try {
    // Quick test connection
    await prisma.$queryRaw`SELECT 1`;
    isDBReady = true;
    wakeUpAttempts = 0;
    next();
  } catch (error) {
    console.log(`💤 Database sleeping (attempt ${wakeUpAttempts + 1}/${MAX_WAKE_ATTEMPTS})...`);
    
    if (wakeUpAttempts >= MAX_WAKE_ATTEMPTS) {
      console.error('❌ Max wake-up attempts reached');
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Database is taking longer than expected to wake up. Please try again in a minute.',
        code: 'DB_SLEEPING'
      });
    }

    wakeUpAttempts++;
    
    // Return immediate response and wake DB in background
    res.status(202).json({
      message: 'Database is waking up. Please retry your request in 10 seconds.',
      retryAfter: 10,
      timestamp: new Date().toISOString()
    });

    // Wake DB in background
    setTimeout(async () => {
      try {
        // This will trigger the wake-up
        await prisma.$connect();
        isDBReady = true;
        console.log('✅ Database is now awake and ready');
        wakeUpAttempts = 0;
      } catch (wakeError) {
        console.log('⚠️ Background wake-up attempt:', wakeError.message);
      }
    }, 100);
  }
}