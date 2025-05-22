/**
 * Mock data-fetching functions for admin dashboard statistics
 * In a real application, these would query the actual database
 */

// Utility to add random variation to numbers for simulation
const randomVariation = (base: number, variance = 0.1): number => {
  const variation = Math.random() * variance * 2 - variance;
  return Math.floor(base * (1 + variation));
};

/**
 * Gets the total number of employer accounts
 */
export async function getEmployerAccountCount(): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
  
  // Mock base count with small random variation
  return randomVariation(124);
}

/**
 * Gets the total number of job seeker accounts
 */
export async function getJobSeekerAccountCount(): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
  
  // Mock base count with small random variation
  return randomVariation(683);
}

/**
 * Gets the total number of jobs posted
 */
export async function getTotalJobsPosted(): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
  
  // Mock base count with small random variation
  return randomVariation(210);
}

/**
 * Gets the total number of job applications
 */
export async function getTotalApplications(): Promise<number> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
  
  // Mock base count with small random variation
  return randomVariation(1452);
}

// Utility function to fetch all metrics at once
export async function getAllAdminMetrics() {
  const [
    employerCount,
    jobSeekerCount,
    jobsPosted,
    applications
  ] = await Promise.all([
    getEmployerAccountCount(),
    getJobSeekerAccountCount(),
    getTotalJobsPosted(),
    getTotalApplications()
  ]);

  return {
    employerCount,
    jobSeekerCount,
    jobsPosted,
    applications
  };
} 