import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDBStatus() {
  try {
    console.log('🔍 Checking database status...');
    
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as status, now() as time`;
    
    console.log('✅ Database is awake and responsive');
    console.log('📊 Status:', result[0]);
    
    // Check if any tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`📋 Found ${tables.length} tables`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ Database is sleeping or unavailable');
    console.log('📝 Error:', error.message);
    
    if (error.code === '10001') { // Neon sleep code
      console.log('💤 Database is in sleep mode');
      console.log('💡 Run: npm run wake-db or POST /api/wake-db');
    }
  }
}

checkDBStatus();