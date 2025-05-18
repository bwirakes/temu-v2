import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateEmployerOnboardingProgress, db, employerOnboardingProgress } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { CustomSession } from '@/lib/types';

// Required fields for each step
const REQUIRED_FIELDS = {
  1: ['namaPerusahaan', 'email'],
  2: [], // Step 2 is optional
  3: ['pic.nama', 'pic.nomorTelepon'],
  4: []  // Step 4 is just review
};

// Check if the data has all required fields for a specific step
function hasRequiredFields(data: Record<string, any>, step: number): boolean {
  const requiredFields = REQUIRED_FIELDS[step as keyof typeof REQUIRED_FIELDS];
  
  // If no required fields for this step, return true
  if (!requiredFields || requiredFields.length === 0) {
    return true;
  }
  
  return requiredFields.every(field => {
    if (field.includes('.')) {
      // Handle nested fields like pic.nama
      const [parent, child] = field.split('.');
      return data[parent] && typeof data[parent][child] === 'string' && data[parent][child].trim() !== '';
    }
    
    // Handle regular fields
    return typeof data[field] === 'string' && data[field].trim() !== '';
  });
}

// Determine the next step based on completion of required fields
function determineNextStep(data: Record<string, any>, currentStep: number): number {
  // If current step has required fields and they're not completed, stay on current step
  if (!hasRequiredFields(data, currentStep)) {
    return currentStep;
  }
  
  // If we're at the final step, stay there
  if (currentStep >= 4) {
    return 4;
  }
  
  // Otherwise advance to the next step
  return currentStep + 1;
}

export async function POST(request: Request) {
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
    
    // Parse request body
    const requestData = await request.json();
    
    // Get current step from request
    let currentStep = Number(requestData.currentStep || 1);
    if (isNaN(currentStep) || currentStep < 1 || currentStep > 4) {
      currentStep = 1;
    }
    
    // Fetch existing data to merge with new data
    let existingData = {};
    try {
      const [existingRecord] = await db
        .select()
        .from(employerOnboardingProgress)
        .where(eq(employerOnboardingProgress.userId, userId));
      
      if (existingRecord) {
        existingData = existingRecord.data || {};
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
    
    // Prepare data for saving
    const dataToSave = { ...requestData };
    delete dataToSave.currentStep; // Remove step from data object
    
    // Merge with existing data
    const mergedData = {
      ...existingData,
      ...dataToSave
    };
    
    // Determine the next step based on field completion
    const nextStep = determineNextStep(mergedData, currentStep);
    
    // Determine status based on completion of all required fields
    // Consider onboarding complete if all step 1 and 3 (mandatory) required fields are completed
    const requiredFieldsCompleted = 
      hasRequiredFields(mergedData, 1) && 
      hasRequiredFields(mergedData, 3);
    
    const status = requiredFieldsCompleted && nextStep >= 4 ? 'COMPLETED' : 'IN_PROGRESS';
    
    try {
      // Save progress to database
      const updatedProgress = await updateEmployerOnboardingProgress(userId, {
        currentStep: nextStep, // Use the next step instead of current
        status,
        data: mergedData
      });
      
      return NextResponse.json({
        success: true,
        message: "Progress saved successfully",
        data: {
          currentStep: nextStep,
          status,
          shouldAdvance: nextStep > currentStep
        }
      });
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // Attempt direct database operation as fallback
      try {
        const existingRecords = await db
          .select()
          .from(employerOnboardingProgress)
          .where(eq(employerOnboardingProgress.userId, userId));
        
        let result;
        if (existingRecords.length > 0) {
          // Update existing record
          [result] = await db
            .update(employerOnboardingProgress)
            .set({
              currentStep: nextStep,
              status,
              data: mergedData,
              lastUpdated: new Date()
            })
            .where(eq(employerOnboardingProgress.userId, userId))
            .returning();
        } else {
          // Insert new record
          [result] = await db
            .insert(employerOnboardingProgress)
            .values({
              userId,
              currentStep: nextStep,
              status,
              data: mergedData,
              lastUpdated: new Date(),
              createdAt: new Date()
            })
            .returning();
        }
        
        return NextResponse.json({
          success: true,
          message: "Progress saved successfully (fallback method)",
          data: {
            currentStep: nextStep,
            status,
            shouldAdvance: nextStep > currentStep
          }
        });
        
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError);
        return NextResponse.json(
          { error: "Database error", details: "Could not save progress" },
          { status: 500 }
        );
      }
    }
    
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "An error occurred while saving progress" },
      { status: 500 }
    );
  }
} 