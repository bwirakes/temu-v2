/**
 * Standardized experience level categories used across the application
 */
export const EXPERIENCE_LEVEL_CATEGORIES = [
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
  "Executive",
  "Internship",
  "Fresh Graduate"
];

/**
 * Min work experience options for job posting
 */
export const MIN_WORK_EXPERIENCE_OPTIONS = [
  { value: 'LULUSAN_BARU', label: 'Lulusan Baru' },
  { value: 'SATU_DUA_TAHUN', label: '1-2 tahun' },
  { value: 'TIGA_LIMA_TAHUN', label: '3-5 tahun' },
  { value: 'LIMA_SEPULUH_TAHUN', label: '5-10 tahun' },
  { value: 'LEBIH_SEPULUH_TAHUN', label: '>10+ tahun' },
] as const;

export type MinWorkExperienceEnum = typeof MIN_WORK_EXPERIENCE_OPTIONS[number]['value'];

export const getMinWorkExperienceLabel = (value: MinWorkExperienceEnum | null | undefined): string => {
  if (!value) return 'N/A';
  const option = MIN_WORK_EXPERIENCE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

/**
 * Work location options for job posting
 * Note: These are reference options only. The lokasiKerja field is now a free-text string 
 * rather than being restricted to these enum values.
 */
export const LOKASI_KERJA_OPTIONS = [
  { value: 'REMOTE', label: 'Remote (WFH)' },
  { value: 'ONSITE_JAKARTA', label: 'Onsite - Jakarta' },
  { value: 'ONSITE_BANDUNG', label: 'Onsite - Bandung' },
  { value: 'ONSITE_SURABAYA', label: 'Onsite - Surabaya' },
  { value: 'HYBRID_JAKARTA', label: 'Hybrid - Jakarta' },
  { value: 'HYBRID_BANDUNG', label: 'Hybrid - Bandung' },
  { value: 'HYBRID_SURABAYA', label: 'Hybrid - Surabaya' },
  { value: 'LAINNYA', label: 'Lokasi Lainnya' }
] as const;

/**
 * @deprecated The lokasiKerja field is now a free-text string.
 * This type is kept for backwards compatibility with existing data.
 */
export type LokasiKerjaEnum = typeof LOKASI_KERJA_OPTIONS[number]['value'];

/**
 * Get a user-friendly label for a location value.
 * This function now handles free-text location values that don't match the enum.
 */
export const getLokasiKerjaLabel = (value: LokasiKerjaEnum | string | null | undefined): string => {
  if (!value) return 'N/A';
  
  // Check if the value is one of our predefined options
  const option = LOKASI_KERJA_OPTIONS.find(opt => opt.value === value);
  if (option) return option.label;
  
  // If it's not in our predefined options, return the value as is (it's a free-text value)
  return value;
};

/**
 * Education options for forms with additional metadata
 */
export const EDUCATION_OPTIONS_FOR_FORMS = [
  { value: "SD", label: "SD", showJurusan: false },
  { value: "SMP", label: "SMP", showJurusan: false },
  { value: "SMA/SMK", label: "SMA/SMK/Sederajat", showJurusan: true },
  { value: "D1", label: "D1", showJurusan: true },
  { value: "D2", label: "D2", showJurusan: true },
  { value: "D3", label: "D3", showJurusan: true },
  { value: "D4", label: "D4", showJurusan: true },
  { value: "S1", label: "S1", showJurusan: true },
  { value: "S2", label: "S2", showJurusan: true },
  { value: "S3", label: "S3", showJurusan: true },
];

/**
 * Education levels used in the database
 */
export const EDUCATION_LEVELS = [
  "SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"
] as const;

export type EducationLevelEnum = typeof EDUCATION_LEVELS[number]; 