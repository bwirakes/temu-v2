/**
 * This file contains database functions that MUST be used only on the server.
 * It serves as a clear marker for which database operations should never be
 * used in client components.
 */

import 'server-only';

// Re-export specific functions from db.ts that should only be used server-side
export {
  createUserProfile,
  getUserByEmail,
  getUserProfileByUserId,
  updateUserProfile,
  getUserPengalamanKerjaByProfileId,
  getUserPendidikanByProfileId,
  createEmployer,
  getEmployerByUserId,
  updateEmployer,
  createJob,
  getJobById,
  getJobByHumanId,
  getJobsByEmployerId,
  updateJob,
  createJobWorkLocation,
  getJobWorkLocationsByJobId,
  createJobApplication,
  getJobApplicationById,
  getJobApplicationsByJobId,
  getJobApplicationsByApplicantProfileId,
  updateJobApplicationStatus,
  createUser,
  getEmployerById,
  getAllEmployerIds,
  getConfirmedJobIdsByEmployerId,
  getEmployerOnboardingStatus,
  updateEmployerOnboardingProgress,
  getAllConfirmedJobIds,
  getJobSeekerByUserId,
  getJobSeekerOnboardingStatus,
  updateUserOnboardingStatus
} from './db';

// Re-export the database instance for server-only usage
export { db } from './db'; 