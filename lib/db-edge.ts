// Edge-compatible database client for use in middleware and other Edge runtime environments
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { users } from './db';

// Cache onboarding statuses to reduce database calls
// Format: Map<userId_userType, {status: OnboardingStatus, timestamp: number}>
const onboardingStatusCache = new Map<string, { status: OnboardingStatus, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute TTL

// Use a lighter connection pool for Edge environments
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString, { 
  prepare: false, // Important: disable prepared statements for Edge compatibility
  ssl: true,      // Enable SSL for secure connections
  max: 1,         // Minimize connections for Edge
  idle_timeout: 10 // Short timeout
});

// Create drizzle database instance for Edge
export const edgeDb = drizzle(client);

// Define a lightweight onboarding status type
export type OnboardingStatus = {
  completed: boolean;
  redirectTo?: string;
};

/**
 * Edge-compatible function to get the onboarding status for a user
 * This is optimized for use in Edge runtime (middleware, JWT callbacks)
 * 
 * Implements caching to reduce database calls
 */
export async function getOnboardingStatusEdge(userId: string, userType: string): Promise<OnboardingStatus> {
  // Create a cache key based on userId and userType
  const cacheKey = `${userId}_${userType}`;
  
  // Check cache first
  const cached = onboardingStatusCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    // Return cached value if it's fresh
    return cached.status;
  }
  
  try {
    // First check if the user's onboardingCompleted is true in the database
    const [user] = await edgeDb
      .select({
        onboardingCompleted: users.onboardingCompleted
      })
      .from(users)
      .where(eq(users.id, userId));
    
    let status: OnboardingStatus;
    
    // If the user has onboardingCompleted set to true, return completed status
    if (user?.onboardingCompleted) {
      const dashboardPath = userType === 'job_seeker' ? '/job-seeker/dashboard' : '/employer/dashboard';
      status = { 
        completed: true, 
        redirectTo: dashboardPath
      };
    } 
    // Otherwise, determine the correct redirect path based on user type
    else {
      if (userType === 'job_seeker') {
        status = { 
          completed: false, 
          redirectTo: '/job-seeker/onboarding/informasi-dasar' 
        };
      } else if (userType === 'employer') {
        status = { 
          completed: false, 
          redirectTo: '/employer/onboarding/informasi-perusahaan'
        };
      } else {
        // Default fallback
        status = { completed: false, redirectTo: '/' };
      }
    }
    
    // Cache the result
    onboardingStatusCache.set(cacheKey, {
      status,
      timestamp: Date.now()
    });
    
    return status;
  } catch (error) {
    console.error(`Error in getOnboardingStatusEdge for ${userType} ${userId}:`, error);
    
    // Safe defaults based on user type
    let fallbackStatus: OnboardingStatus;
    if (userType === 'job_seeker') {
      fallbackStatus = { completed: false, redirectTo: '/job-seeker/onboarding/informasi-dasar' };
    } else {
      fallbackStatus = { completed: false, redirectTo: '/employer/onboarding/informasi-perusahaan' };
    }
    
    // Cache the fallback status but with shorter TTL
    onboardingStatusCache.set(cacheKey, {
      status: fallbackStatus,
      timestamp: Date.now() - (CACHE_TTL / 2) // Shorter cache time for error results
    });
    
    return fallbackStatus;
  }
} 