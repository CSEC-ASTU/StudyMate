import { PrismaClient } from '@prisma/client';
import { wakeNeonDB } from '../utils/dbWakeUp.js';

const prisma = new PrismaClient();

export async function initializeDatabase() {
  console.log('🔧 Initializing database connection...');
  
  try {
    // First attempt to wake up the database
    await wakeNeonDB();
    
    // Wait for database to wake up (Neon typically takes 5-10 seconds)
    console.log('⏳ Waiting for database to wake up...');
    await new Promise(resolve => setTimeout(resolve, 7000));
    
    // Test connection with a simple query
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('✅ Database connected successfully');
    console.log('📊 Database is ready for queries');
    
  } catch (error) {
    console.warn('⚠️ Could not establish initial database connection:', error.message);
    console.log('📝 Database will auto-wake on first API request');
    
    // Still connect Prisma, it will handle reconnection
    try {
      await prisma.$connect();
    } catch (connectError) {
      console.log('ℹ️ Prisma will connect when database is awake');
    }
  }
}

export { prisma };