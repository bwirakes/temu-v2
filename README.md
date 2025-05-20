# Next.js Authentication Example

A complete authentication solution built with:

- Next.js 15 (App Router)
- NextAuth.js 5.0
- PostgreSQL with Drizzle ORM
- Tailwind CSS
- TypeScript
- React Hook Form + Zod Validation

## Features

- Email/Password Authentication
- OAuth Authentication (GitHub)
- Form Validation with Zod
- Responsive UI with Tailwind CSS
- Protected Routes
- TypeScript Type Safety
- Domain-driven routing structure for job seekers and employers

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- PostgreSQL database (or Neon.tech serverless Postgres)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your database and OAuth credentials:

```bash
cp .env.example .env
```

3. Update the `.env` file with your database URL and a secure AUTH_SECRET:

```
# Database connection
POSTGRES_URL=postgres://user:password@localhost:5432/mydb

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-secret-key-at-least-32-chars

# OAuth Providers (optional)
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

### Installation

Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Database Setup

1. Generate the SQL migrations:

```bash
npm run generate
```

2. Apply the migrations to your database:

```bash
npm run migrate
```

3. (Optional) Explore your database with Drizzle Studio:

```bash
npm run studio
```

### Database Migrations - Removing Unused Tables

The project has been updated to remove unused tables and streamline the database schema. Follow these steps to apply these changes to your database:

### Step 1: Run the Table Removal Migration

First, run the script to drop the unused tables from your database:

```bash
npm run drop-tables
```

This will remove the following tables that are no longer used:
- `user_social_media`
- `user_keahlian`
- `user_sertifikasi`
- `user_bahasa`

### Step 2: Generate Proper Migrations

To generate proper migration files after removing the tables, run:

```bash
npm run generate:fix
```

This uses a special configuration to avoid ES5 compatibility issues that can occur with the standard generate command.

### Troubleshooting

If you encounter errors when running the standard `npm run generate` command with messages about ES5 compatibility, always use `npm run generate:fix` instead, which properly targets ES2020.

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   │   ├── auth/         # Auth API Routes
│   │   ├── job-seeker/   # Job Seeker API Routes
│   │   │   ├── onboarding/ # Onboarding API
│   │   │   └── cv/       # CV Management API
│   │   ├── employer/     # Employer API Routes
│   │   │   ├── onboarding/ # Onboarding API
│   │   │   └── jobs/     # Job Management API
│   │   └── ...
│   ├── auth/             # Auth Pages
│   │   ├── signin/       # Sign In Page
│   │   ├── signup/       # Sign Up Page
│   │   └── error/        # Auth Error Page
│   ├── job-seeker/       # Job Seeker Pages
│   │   ├── onboarding/   # Onboarding Flow
│   │   ├── cv-builder/   # CV Builder Tool
│   │   └── ...
│   ├── employer/         # Employer Pages
│   │   ├── onboarding/   # Onboarding Flow
│   │   └── ...
│   └── ...
├── components/           # React Components
├── lib/                  # Utility Functions
│   ├── auth.ts           # NextAuth Configuration
│   ├── db.ts             # Database Schema & Queries
│   └── ...
├── public/               # Static Assets
├── scripts/              # Utility Scripts
│   └── migrate.ts        # Database Migration Script
└── ...
```

## Application Routing

The application follows a domain-driven routing structure organized around two main user types:

1. **Job Seekers** - Routes under `/job-seeker/*`
2. **Employers** - Routes under `/employer/*`

For detailed information about the routing structure, please see [ROUTING.md](./ROUTING.md).

## Deployment

This application can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting platform.

For Vercel deployment:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set up the environment variables
4. Deploy!

## License

MIT

# Profile Photo Upload Feature

## Overview

The profile photo upload feature allows job seekers to upload and manage their profile photos. This feature uses Vercel Blob for storage and integrates seamlessly with the job seeker profile page.

## Implementation Details

### Server-Side Implementation

- **API Route**: `/api/job-seeker/profile/photo`
- **Storage**: Vercel Blob
- **File Types**: Supports JPG, PNG, and WebP image formats
- **Size Limit**: 2MB maximum size for profile photos
- **Security**: Authentication and authorization checks ensure only the profile owner can upload photos

### Client-Side Implementation

- **Component**: `ProfilePhotoUploader` provides a user-friendly interface for uploading photos
- **Preview**: Users can preview photos before uploading
- **Validation**: Client-side validation for file type and size
- **Integration**: Seamlessly integrated with the job seeker profile page

## Environment Variables

This feature requires the following environment variables:

```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

For development, you can enable mock mode:

```
NEXT_PUBLIC_MOCK_BLOB=true
```

## Usage

To use the profile photo upload feature:

1. Navigate to the profile page
2. Click the camera icon on the profile photo
3. Select an image file (JPG, PNG, or WebP)
4. Preview and confirm the upload
5. The new profile photo will be displayed immediately after successful upload
