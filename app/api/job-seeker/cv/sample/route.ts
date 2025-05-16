import { NextRequest, NextResponse } from 'next/server';
import { getSampleCV } from '@/lib/sample-data/cv-sample';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sampleCV = getSampleCV();
    return NextResponse.json({ data: sampleCV });
  } catch (error: any) {
    console.error('Error fetching sample CV data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sample CV data' },
      { status: 500 }
    );
  }
} 