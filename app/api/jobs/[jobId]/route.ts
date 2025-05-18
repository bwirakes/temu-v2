import { NextRequest, NextResponse } from 'next/server';
import { getJobById, getEmployerById, getJobWorkLocationsByJobId } from '@/lib/db';

export async function GET(request: NextRequest, props: { params: Promise<{ jobId: string }> }) {
  const params = await props.params;
  try {
    const jobId = params.jobId;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Get job details from database
    const job = await getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    // Get employer details
    const employer = await getEmployerById(job.employerId);
    
    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found" },
        { status: 404 }
      );
    }
    
    // Get job locations
    const locations = await getJobWorkLocationsByJobId(jobId);
    
    // Format the job data for the frontend
    // Include new fields but filter out sensitive information
    const formattedJob = {
      id: job.id,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      employerId: job.employerId,
      workLocations: locations.map(location => ({
        city: location.city,
        province: location.province,
        isRemote: location.isRemote,
        address: location.address
      })),
      // Add these fields with optional fallbacks to prevent undefined errors
      contractType: 'FULL_TIME', // Default fallback since contractType was removed
      salaryRange: null,
      minWorkExperience: job.minWorkExperience,
      applicationDeadline: null, // Set to null by default
      requirements: [],
      responsibilities: [],
      description: null,
      postedDate: job.postedDate,
      numberOfPositions: job.numberOfPositions,
      workingHours: null,
      // New fields
      lastEducation: job.lastEducation,
      requiredCompetencies: job.requiredCompetencies,
      acceptedDisabilityTypes: null,
      numberOfDisabilityPositions: null,
      // Filtered expectations to exclude age range
      expectations: job.expectations ? {
        expectedCharacter: null,
        foreignLanguage: null,
        // ageRange is explicitly excluded
      } : null,
      // Filtered additionalRequirements to exclude gender
      additionalRequirements: job.additionalRequirements ? {
        requiredDocuments: null,
        specialSkills: null,
        technologicalSkills: null,
        suitableForDisability: false,
        // gender is explicitly excluded
      } : null,
      companyInfo: {
        name: employer.namaPerusahaan,
        logoUrl: employer.logoUrl,
        industry: employer.industri,
        address: employer.alamatKantor,
        website: employer.website,
        socialMedia: employer.socialMedia,
        description: `${employer.namaPerusahaan} adalah perusahaan yang bergerak di bidang ${employer.industri}.` // Default description
      }
    };
    
    return NextResponse.json(formattedJob);
    
  } catch (error) {
    console.error('Error fetching job details:', error);
    
    return NextResponse.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
} 