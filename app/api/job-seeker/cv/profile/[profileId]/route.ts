import { NextRequest, NextResponse } from 'next/server';
import { getCVByProfileId } from '@/lib/services/cv-service';
import { getSampleCV } from '@/lib/sample-data/cv-sample';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { profileId: string } }
) {
  try {
    const profileId = params.profileId;
    
    // Check for the special "sample" profileId to return the sample CV
    if (profileId === 'sample') {
      const sampleCV = getSampleCV();
      return NextResponse.json({ data: sampleCV });
    }
    
    // Get real user CV data
    const cvData = await getCVByProfileId(profileId);
    return NextResponse.json({ data: cvData });
  } catch (error: any) {
    console.error('Error fetching CV data by profile ID:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch CV data' },
      { status: 500 }
    );
  }
} 