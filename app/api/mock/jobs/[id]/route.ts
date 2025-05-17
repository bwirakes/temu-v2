import { NextRequest, NextResponse } from "next/server";

// Mock job data
const mockJob = {
  id: "job-001",
  employerId: "emp-001",
  jobTitle: "Senior Software Engineer",
  contractType: "FULL_TIME",
  salaryRange: {
    min: 15000000,
    max: 25000000,
    isNegotiable: true,
  },
  minWorkExperience: 3,
  applicationDeadline: "2023-12-31T23:59:59Z",
  requirements: [
    "Minimal 3 tahun pengalaman dengan React dan Next.js",
    "Pemahaman yang kuat tentang TypeScript",
    "Pengalaman dengan RESTful API dan GraphQL",
    "Kemampuan untuk menulis kode yang bersih dan dapat diuji"
  ],
  responsibilities: [
    "Mengembangkan dan memelihara aplikasi web menggunakan React dan Next.js",
    "Berkolaborasi dengan tim desain untuk mengimplementasikan UI/UX",
    "Mengoptimalkan aplikasi untuk kecepatan dan skalabilitas",
    "Mengintegrasikan layanan backend melalui API"
  ],
  description: "Kami mencari Senior Software Engineer yang berpengalaman untuk bergabung dengan tim pengembangan kami. Posisi ini akan bertanggung jawab untuk mengembangkan dan memelihara aplikasi web kami menggunakan teknologi modern seperti React, Next.js, dan TypeScript.",
  postedDate: "2023-10-15T08:00:00Z",
  numberOfPositions: 2,
  workingHours: "Senin-Jumat, 09:00-17:00",
  isConfirmed: true,
  applicationCount: 5
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Access params asynchronously
    const jobId = await params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'ID lowongan tidak diberikan' },
        { status: 400 }
      );
    }
    
    console.log(`Mock API: Fetching job details for ID: ${jobId}`);
    
    // Return mock job data with the requested ID
    const job = {
      ...mockJob,
      id: jobId
    };

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error in mock job API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan di API mock' },
      { status: 500 }
    );
  }
} 