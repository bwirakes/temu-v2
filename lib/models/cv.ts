import { z } from 'zod';
import { tingkatKeahlianEnum, levelPengalamanEnum, lokasiKerjaEnum, jenisKelaminEnum } from '../db';

// This file previously contained CV-related schemas and helper functions
// that have been removed as they were not being used elsewhere in the codebase.
// 
// The CV functionality in the application is now handled through the user profile
// fields cvFileUrl and cvUploadDate, rather than a full CV model.
//
// If CV functionality needs to be expanded in the future, this file can be
// repopulated with appropriate schemas and types. 