#!/usr/bin/env node

/**
 * This script helps set up Vercel Blob for your project.
 * It checks if the BLOB_READ_WRITE_TOKEN is set and provides guidance if not.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Check if .env.local exists and contains BLOB_READ_WRITE_TOKEN
function checkEnvFile() {
  console.log(`${colors.blue}Checking for .env.local file...${colors.reset}`);
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log(`${colors.yellow}No .env.local file found. Creating one...${colors.reset}`);
    fs.writeFileSync(envPath, '# Vercel Blob Storage\nBLOB_READ_WRITE_TOKEN=\n\n# Other environment variables\n');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('BLOB_READ_WRITE_TOKEN=')) {
    console.log(`${colors.yellow}BLOB_READ_WRITE_TOKEN not found in .env.local. Adding it...${colors.reset}`);
    fs.appendFileSync(envPath, '\n# Vercel Blob Storage\nBLOB_READ_WRITE_TOKEN=\n');
    return false;
  }
  
  const match = envContent.match(/BLOB_READ_WRITE_TOKEN=(.+)/);
  if (!match || !match[1] || match[1].trim() === '') {
    console.log(`${colors.yellow}BLOB_READ_WRITE_TOKEN is empty in .env.local.${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}BLOB_READ_WRITE_TOKEN found in .env.local.${colors.reset}`);
  return true;
}

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function main() {
  console.log(`${colors.cyan}=== Vercel Blob Setup Helper ===${colors.reset}\n`);
  
  const hasToken = checkEnvFile();
  
  if (!hasToken) {
    console.log(`\n${colors.yellow}You need to set up a BLOB_READ_WRITE_TOKEN to use Vercel Blob.${colors.reset}\n`);
    
    const hasVercelCLI = checkVercelCLI();
    
    if (!hasVercelCLI) {
      console.log(`${colors.red}Vercel CLI is not installed. Install it with:${colors.reset}`);
      console.log(`npm install -g vercel`);
      console.log(`\nAfter installing, run this script again.`);
    } else {
      console.log(`${colors.green}Vercel CLI is installed.${colors.reset}`);
      
      rl.question(`\nDo you want to set up Vercel Blob now? (y/n) `, (answer) => {
        if (answer.toLowerCase() === 'y') {
          console.log(`\n${colors.cyan}Follow these steps:${colors.reset}`);
          console.log(`1. Run 'vercel login' to log in to your Vercel account`);
          console.log(`2. Run 'vercel link' to link your project`);
          console.log(`3. Run 'vercel storage add' and select Blob`);
          console.log(`4. Run 'vercel env pull' to get your BLOB_READ_WRITE_TOKEN`);
          console.log(`\nAfter completing these steps, your .env.local file should be updated with the token.`);
        } else {
          console.log(`\n${colors.yellow}You can set up Vercel Blob later by following the instructions in README-BLOB-SETUP.md${colors.reset}`);
        }
        rl.close();
      });
    }
  } else {
    console.log(`\n${colors.green}Your project is set up for Vercel Blob! You can upload images now.${colors.reset}`);
    rl.close();
  }
}

main().catch(console.error); 