import { minWorkExperienceEnum } from '@/lib/db';
import { MinWorkExperienceEnum } from '@/lib/constants';

/**
 * Maps database minWorkExperience enum values to frontend enum values
 * Since we've standardized the enums, this is now a direct mapping
 * Always returns a valid MinWorkExperienceEnum value, defaulting to 'LULUSAN_BARU' if value is null/undefined
 */
export function mapDbWorkExperienceToFrontend(value: typeof minWorkExperienceEnum.enumValues[number] | null | undefined): MinWorkExperienceEnum {
  if (!value) return 'LULUSAN_BARU';
  
  // Direct mapping is now possible since the enums match
  switch (value) {
    case 'LULUSAN_BARU': 
      return 'LULUSAN_BARU';
    case 'SATU_DUA_TAHUN': 
      return 'SATU_DUA_TAHUN';
    case 'TIGA_LIMA_TAHUN': 
      return 'TIGA_LIMA_TAHUN';
    case 'LIMA_SEPULUH_TAHUN': 
      return 'LIMA_SEPULUH_TAHUN';
    case 'LEBIH_SEPULUH_TAHUN': 
      return 'LEBIH_SEPULUH_TAHUN';
    default:
      // For any other cases, default to a reasonable value
      return 'LULUSAN_BARU';
  }
}

/**
 * Maps frontend minWorkExperience enum values to database enum values
 * Since we've standardized the enums, this is now a direct mapping
 * Always returns a valid database enum value, defaulting to 'LULUSAN_BARU' if value is null/undefined
 */
export function mapFrontendWorkExperienceToDb(value: MinWorkExperienceEnum | null | undefined): typeof minWorkExperienceEnum.enumValues[number] {
  if (!value) return 'LULUSAN_BARU';
  
  // Direct mapping is now possible since the enums match
  switch (value) {
    case 'LULUSAN_BARU': 
      return 'LULUSAN_BARU';
    case 'SATU_DUA_TAHUN': 
      return 'SATU_DUA_TAHUN';
    case 'TIGA_LIMA_TAHUN': 
      return 'TIGA_LIMA_TAHUN';
    case 'LIMA_SEPULUH_TAHUN': 
      return 'LIMA_SEPULUH_TAHUN';
    case 'LEBIH_SEPULUH_TAHUN': 
      return 'LEBIH_SEPULUH_TAHUN';
    default:
      // Type guard - should never happen with proper typing
      return 'LULUSAN_BARU';
  }
}

/**
 * Helper type definitions for database and frontend jobs
 */
export type DbWorkExperienceEnum = typeof minWorkExperienceEnum.enumValues[number];
export type FrontendWorkExperienceEnum = MinWorkExperienceEnum; 