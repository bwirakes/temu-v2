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
- OAuth Authentication (Google, GitHub)
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
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
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
# temu-jobfair
