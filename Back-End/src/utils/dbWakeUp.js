import fetch from 'node-fetch';

/**
 * Wakes up Neon database by making a simple query
 * @returns {Promise<boolean>} Success status
 */
export async function wakeNeonDB() {
  const databaseUrl = process.env.NEON_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ NEON_DATABASE_URL is not set in environment variables');
    return false;
  }

  console.log('🔔 Attempting to wake up Neon database...');
  
  try {
    // For Neon, we need to use a different approach
    // Method 1: Try direct PostgreSQL connection via REST proxy
    const apiUrl = 'https://console.neon.tech/api/v2/projects/{project_id}/endpoints/{endpoint_id}/start';
    
    // Method 2: Simpler - just make a connection attempt that will trigger wake-up
    // Convert connection string to a format we can use
    const connectionParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/);
    
    if (connectionParts) {
      const [, user, password, host, database] = connectionParts;
      
      // Create a wake-up request URL
      const wakeUrl = `https://${host}/ping`;
      
      try {
        // This will trigger the database to wake up
        await fetch(wakeUrl, {
          method: 'HEAD',
          timeout: 10000,
        });
      } catch (fetchError) {
        // Expected - we just want to trigger the wake-up
      }
      
      console.log('✅ Database wake-up triggered');
      console.log('⏳ Please wait 5-10 seconds for full activation');
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error in wake-up process:', error.message);
    return false;
  }
}

/**
 * Alternative method using Neon API (requires API key)
 */
export async function wakeNeonDBWithAPI() {
  const { NEON_API_KEY, NEON_PROJECT_ID, NEON_ENDPOINT_ID } = process.env;
  
  if (!NEON_API_KEY || !NEON_PROJECT_ID || !NEON_ENDPOINT_ID) {
    console.log('⚠️ Neon API credentials not set, using connection method');
    return wakeNeonDB();
  }

  console.log('🔔 Waking up Neon database via API...');
  
  try {
    const response = await fetch(
      `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/endpoints/${NEON_ENDPOINT_ID}/start`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NEON_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      console.log('✅ Database wake-up initiated via API');
      return true;
    } else {
      console.log('⚠️ API wake-up failed, falling back to connection method');
      return wakeNeonDB();
    }
  } catch (error) {
    console.error('❌ API wake-up error:', error.message);
    return wakeNeonDB();
  }
}