import { NextRequest, NextResponse } from 'next/server';
import { getCVByUserId } from '@/lib/services/cv-service';
import { getSampleCV } from '@/lib/sample-data/cv-sample';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    // Check for the special "sample" userId to return the sample CV
    if (userId === 'sample') {
      const sampleCV = getSampleCV();
      return NextResponse.json({ data: sampleCV });
    }
    
    // Get real user CV data
    const cvData = await getCVByUserId(userId);
    return NextResponse.json({ data: cvData });
  } catch (error: any) {
    console.error('Error fetching CV data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch CV data' },
      { status: 500 }
    );
  }
} 