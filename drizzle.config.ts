import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  schema: './lib/db-cli.ts',
  out: './drizzle',
  dialect: 'postgresql',
  verbose: true,
  strict: true
}); 