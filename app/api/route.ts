import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Temu API Documentation',
    version: '2.0.0',
    apiStructure: {
      'job-seeker': {
        onboarding: '/api/job-seeker/onboarding',
        cv: '/api/job-seeker/cv',
      },
      employer: {
        onboarding: '/api/employer/onboarding',
        jobs: '/api/employer/jobs',
      },
      auth: '/api/auth',
      upload: '/api/upload',
    },
    note: 'The API structure has been reorganized to better reflect the application domains.',
  }, { status: 200 });
} 