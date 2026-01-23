
const BASE_URL = 'http://localhost:3000/api';

async function testAuthFlow() {
  console.log('--- Starting Auth Flow Verification ---');

  // 1. Signup
  const signupData = {
    email: `testuser_${Date.now()}@example.com`,
    fullName: 'Test User',
    password: 'password123',
  };

  console.log(`\n1. Testing Signup with ${signupData.email}...`);
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupData),
  });
  
  const signupJson = await signupRes.json();
  console.log('Status:', signupRes.status);
  console.log('Body:', JSON.stringify(signupJson, null, 2));
  
  if (!signupRes.ok) {
    console.error('Signup failed!');
    return;
  }

  // 2. Login
  console.log('\n2. Testing Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: signupData.email,
      password: signupData.password,
    }),
  });

  const loginJson = await loginRes.json();
  console.log('Status:', loginRes.status);
  // console.log('Body:', loginJson);

  if (!loginRes.ok) {
    console.error('Login failed!');
    return;
  }

  const token = loginJson.token;
  console.log('Token received:', token ? 'YES' : 'NO');

  // 3. Onboarding Step 1
  console.log('\n3. Testing Onboarding Step 1...');
  const step1Res = await fetch(`${BASE_URL}/profile/onboarding/step1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      educationLevel: 'Undergraduate',
      institutionName: 'Test University',
    }),
  });

  const step1Json = await step1Res.json();
  console.log('Status:', step1Res.status);
  console.log('Body:', JSON.stringify(step1Json, null, 2));

 // 4. Onboarding Step 2
 console.log('\n4. Testing Onboarding Step 2...');
 const step2Res = await fetch(`${BASE_URL}/profile/onboarding/step2`, {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`,
   },
   body: JSON.stringify({
     university: 'Test University',
     department: 'Computer Science',
     program: 'BSc',
     yearOrSemester: 'Year 3',
   }),
 });

 const step2Json = await step2Res.json();
 console.log('Status:', step2Res.status);
 console.log('Body:', JSON.stringify(step2Json, null, 2));

 console.log('\n--- Verification Complete ---');
}

testAuthFlow().catch(console.error);
