import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEmployerByUserId, db } from '@/lib/db';
import { employerOnboardingProgress } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { CustomSession } from '@/lib/types';

// Interface for the onboarding status response
interface EmployerOnboardingStatusResponse {
  completed: boolean;
  currentStep: number;
  redirectTo: string;
  data?: Record<string, any>;
  allowedSteps?: number[];
}

// Required fields for each step
const REQUIRED_FIELDS = {
  1: ['namaPerusahaan', 'email'],
  2: [], // Step 2 is optional
  3: ['pic.nama', 'pic.nomorTelepon'],
  4: []  // Step 4 is just review
};

// Check if a step is completed based on required fields
function isStepCompleted(data: Record<string, any> | null, step: number): boolean {
  if (!data) return false;
  
  const requiredFields = REQUIRED_FIELDS[step as keyof typeof REQUIRED_FIELDS] || [];
  
  // If no required fields, step is automatically completed
  if (requiredFields.length === 0) return true;
  
  return requiredFields.every(field => {
    if (field.includes('.')) {
      // Handle nested fields like pic.nama
      const [parent, child] = field.split('.');
      return data[parent] && 
             typeof data[parent][child] === 'string' && 
             data[parent][child].trim() !== '';
    }
    
    // Handle regular fields
    return typeof data[field] === 'string' && data[field].trim() !== '';
  });
}

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await auth() as CustomSession;
    
    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if the user has the correct role
    if (session.user.userType !== 'employer') {
      return NextResponse.json(
        { error: "Forbidden: Only employers can access this endpoint" },
        { status: 403 }
      );
    }
    
    const userId = session.user.id;
    
    // First check if the user already has an employer record
    const employer = await getEmployerByUserId(userId);
    
    if (employer) {
      // If employer record exists, onboarding is completed
      return NextResponse.json({
        completed: true,
        currentStep: 4,
        redirectTo: '/employer',
        allowedSteps: [1, 2, 3, 4]
      });
    }
    
    // Check if there's an onboarding progress record
    const [progress] = await db
      .select()
      .from(employerOnboardingProgress)
      .where(eq(employerOnboardingProgress.userId, userId));
    
    // Define step routes
    const stepRoutes = [
      '/employer/onboarding/informasi-perusahaan',
      '/employer/onboarding/kehadiran-online',
      '/employer/onboarding/penanggung-jawab',
      '/employer/onboarding/konfirmasi'
    ];
    
    // If no progress record, start at step 1
    if (!progress) {
      // Create initial record
      try {
        await db
          .insert(employerOnboardingProgress)
          .values({
            userId,
            currentStep: 1,
            status: 'NOT_STARTED',
            data: {},
            lastUpdated: new Date(),
            createdAt: new Date()
          });
      } catch (error) {
        console.error('Error creating initial onboarding record:', error);
      }
      
      return NextResponse.json({
        completed: false,
        currentStep: 1,
        redirectTo: stepRoutes[0],
        allowedSteps: [1]
      });
    }
    
    // Ensure currentStep is valid
    let currentStep = progress.currentStep;
    if (isNaN(currentStep) || currentStep < 1) {
      currentStep = 1;
    } else if (currentStep > stepRoutes.length) {
      currentStep = stepRoutes.length;
    }
    
    // Calculate completed steps
    const completedSteps: number[] = [];
    for (let i = 1; i <= 4; i++) {
      if (isStepCompleted(progress.data, i)) {
        completedSteps.push(i);
      }
    }
    
    // Calculate allowed steps (current + previous completed steps)
    // User can navigate to current step and any previous steps that are completed
    const allowedSteps = Array.from(
      new Set([...completedSteps, currentStep])
    ).sort();
    
    // Determine completion status
    const step1Completed = isStepCompleted(progress.data, 1);
    const step3Completed = isStepCompleted(progress.data, 3);
    const isCompleted = step1Completed && step3Completed && currentStep === 4;
    
    // Build response
    const response: EmployerOnboardingStatusResponse = {
      completed: isCompleted || progress.status === 'COMPLETED',
      currentStep,
      redirectTo: stepRoutes[currentStep - 1],
      allowedSteps
    };
    
    // Only include data in the response if it exists
    if (progress.data) {
      response.data = progress.data;
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error checking employer onboarding status:", error);
    
    return NextResponse.json(
      { 
        error: "An error occurred while checking onboarding status", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 