#!/usr/bin/env node

/**
 * This script helps refresh a user's JWT by making an API call to the update-user-jwt endpoint.
 * It's useful for testing and debugging JWT issues.
 * 
 * Usage:
 *   node scripts/refresh-user-jwt.js --userId=1234
 *   node scripts/refresh-user-jwt.js --email=user@example.com
 */

const { execSync } = require('child_process');
const { parse } = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    params[key] = value;
  }
});

// Validate input
if (!params.userId && !params.email) {
  console.error('Error: Either --userId or --email must be provided');
  console.log('Usage examples:');
  console.log('  node scripts/refresh-user-jwt.js --userId=1234');
  console.log('  node scripts/refresh-user-jwt.js --email=user@example.com');
  process.exit(1);
}

// Environment setup
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const adminToken = process.env.ADMIN_API_TOKEN;

if (!adminToken) {
  console.error('Error: ADMIN_API_TOKEN environment variable must be set');
  console.log('Set it with: export ADMIN_API_TOKEN=your_secret_token');
  process.exit(1);
}

// Build request body
const requestBody = {};
if (params.userId) requestBody.userId = params.userId;
if (params.email) requestBody.email = params.email;

// Make the API request
try {
  console.log(`Refreshing JWT for ${params.userId ? 'userId: ' + params.userId : 'email: ' + params.email}...`);
  
  const curlCommand = `curl -X POST ${apiUrl}/api/admin/update-user-jwt \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${adminToken}" \\
    -d '${JSON.stringify(requestBody)}'`;
  
  const result = execSync(curlCommand, { encoding: 'utf-8' });
  
  // Parse and pretty-print the JSON response
  const response = JSON.parse(result);
  console.log('\nAPI Response:');
  console.log(JSON.stringify(response, null, 2));
  
  if (response.success) {
    console.log('\n✅ Success! The user\'s JWT will be updated on their next session refresh.');
    console.log('To force them to get a new token, they need to log out and log back in.');
  } else {
    console.log('\n❌ Failed to refresh JWT. See error details above.');
  }
} catch (error) {
  console.error('Error making API request:', error.message);
  process.exit(1);
} 