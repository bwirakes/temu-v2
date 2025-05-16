// Test script for API redirects
// Run with Node.js: node test-api-redirects.js

const BASE_URL = 'http://localhost:3000';

// Define the API routes to test
const apiRoutes = [
  { from: '/api/onboarding', expectedRedirect: '/api/job-seeker/onboarding' },
  { from: '/api/cv', expectedRedirect: '/api/job-seeker/cv' },
  { from: '/api/employer/onboard', expectedRedirect: '/api/employer/onboarding' },
  { from: '/api/onboarding/submit', expectedRedirect: '/api/job-seeker/onboarding/submit' },
  { from: '/api/cv/sample', expectedRedirect: '/api/job-seeker/cv/sample' },
];

async function testApiRedirect(route) {
  try {
    const response = await fetch(`${BASE_URL}${route.from}`, { 
      method: 'GET',
      redirect: 'manual',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const location = response.headers.get('location');
    
    if (response.status === 307 || response.status === 308) {
      // Check if the redirect URL ends with the expected path
      if (location.endsWith(route.expectedRedirect)) {
        console.log(`✅ ${route.from} redirects to ${location}`);
        return true;
      } else {
        console.log(`❌ ${route.from} redirects to ${location}, expected ${route.expectedRedirect}`);
        return false;
      }
    } else {
      console.log(`❌ ${route.from} returned status ${response.status}, expected redirect`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing ${route.from}: ${error.message}`);
    return false;
  }
}

async function testPostRedirect(route) {
  try {
    const response = await fetch(`${BASE_URL}${route.from}`, { 
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    const location = response.headers.get('location');
    
    if (response.status === 307 || response.status === 308) {
      // Check if the redirect URL ends with the expected path
      if (location.endsWith(route.expectedRedirect)) {
        console.log(`✅ POST ${route.from} redirects to ${location}`);
        return true;
      } else {
        console.log(`❌ POST ${route.from} redirects to ${location}, expected ${route.expectedRedirect}`);
        return false;
      }
    } else {
      console.log(`❌ POST ${route.from} returned status ${response.status}, expected redirect`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing POST ${route.from}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing API redirects (GET)...');
  
  let passed = 0;
  let failed = 0;
  
  for (const route of apiRoutes) {
    const success = await testApiRedirect(route);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\nTesting API redirects (POST)...');
  
  for (const route of apiRoutes) {
    const success = await testPostRedirect(route);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\nTest Results:');
  console.log(`✅ ${passed} API redirects working correctly`);
  console.log(`❌ ${failed} API redirects not working correctly`);
  
  if (failed > 0) {
    console.log('\nSuggestions:');
    console.log('1. Make sure your development server is running');
    console.log('2. Check that the middleware.ts file is properly configured');
    console.log('3. Verify that the matcher patterns in the middleware config are correct');
    console.log('4. Ensure that both GET and POST requests are handled by the middleware');
  }
}

runTests(); 