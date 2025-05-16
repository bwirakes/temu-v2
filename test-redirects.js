// Test script for redirects
// Run with Node.js: node test-redirects.js

const BASE_URL = 'http://localhost:3000';

// Define the routes to test
const routes = [
  // Old routes that should redirect
  { from: '/onboarding', expectedRedirect: '/job-seeker/onboarding' },
  { from: '/onboarding/informasi-pribadi', expectedRedirect: '/job-seeker/onboarding/informasi-pribadi' },
  { from: '/cv-builder', expectedRedirect: '/job-seeker/cv-builder' },
  { from: '/employer-onboarding', expectedRedirect: '/employer/onboarding' },
  { from: '/employer-onboarding/informasi-perusahaan', expectedRedirect: '/employer/onboarding/informasi-perusahaan' },
  
  // API routes that should redirect
  { from: '/api/onboarding', expectedRedirect: '/api/job-seeker/onboarding' },
  { from: '/api/cv', expectedRedirect: '/api/job-seeker/cv' },
  { from: '/api/employer/onboard', expectedRedirect: '/api/employer/onboarding' },
];

async function testRedirect(route) {
  try {
    const response = await fetch(`${BASE_URL}${route.from}`, { redirect: 'manual' });
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

async function runTests() {
  console.log('Testing redirects...');
  
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    const success = await testRedirect(route);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\nTest Results:');
  console.log(`✅ ${passed} redirects working correctly`);
  console.log(`❌ ${failed} redirects not working correctly`);
  
  if (failed > 0) {
    console.log('\nSuggestions:');
    console.log('1. Make sure your development server is running');
    console.log('2. Check that the middleware.ts file is properly configured');
    console.log('3. Verify that the matcher patterns in the middleware config are correct');
  }
}

runTests(); 