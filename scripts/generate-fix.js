// This script runs drizzle-kit generate with proper ES2020 support
// It works on both Unix and Windows systems

const { execSync } = require('child_process');
const path = require('path');

// Set environment variables for TS Node with ES2020 support
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  target: 'es2020'
});

console.log('Running drizzle-kit generate with ES2020 support...');

try {
  // Run drizzle-kit generate
  execSync('npx drizzle-kit generate', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('Migration files generated successfully!');
} catch (error) {
  console.error('Error generating migration files:', error);
  process.exit(1);
} 