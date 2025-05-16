# Temu Application Routing Structure

This document outlines the routing structure of the Temu application, which is organized around two main user types: job seekers and employers.

## Main Routes

### Job Seeker Routes
- `/job-seeker` - Main job seeker dashboard
  - `/job-seeker/onboarding` - Job seeker onboarding process
    - `/job-seeker/onboarding/informasi-pribadi` - Personal information
    - `/job-seeker/onboarding/alamat` - Address information
    - `/job-seeker/onboarding/pendidikan` - Education information
    - `/job-seeker/onboarding/pengalaman-kerja` - Work experience
    - `/job-seeker/onboarding/keahlian` - Skills
    - `/job-seeker/onboarding/bahasa` - Languages
    - `/job-seeker/onboarding/sertifikasi` - Certifications
    - `/job-seeker/onboarding/ekspektasi-kerja` - Job expectations
    - `/job-seeker/onboarding/upload-foto` - Photo upload
    - `/job-seeker/onboarding/informasi-tambahan` - Additional information
    - `/job-seeker/onboarding/informasi-lanjutan` - Advanced information
    - `/job-seeker/onboarding/ringkasan` - Summary
    - `/job-seeker/onboarding/success` - Success page
  - `/job-seeker/cv-builder` - CV builder tool
  - `/job-seeker/jobs` - Job listings
  - `/job-seeker/applications` - Job applications
  - `/job-seeker/dashboard` - User dashboard

### Employer Routes
- `/employer` - Main employer dashboard
  - `/employer/onboarding` - Employer onboarding process
    - `/employer/onboarding/informasi-perusahaan` - Company information
    - `/employer/onboarding/penanggung-jawab` - Person in charge
    - `/employer/onboarding/kehadiran-online` - Online presence
    - `/employer/onboarding/konfirmasi` - Confirmation
    - `/employer/onboarding/success` - Success page
  - `/employer/jobs` - Manage job postings
  - `/employer/job-posting` - Create job postings
  - `/employer/applicants` - View applicants
  - `/employer/settings` - Account settings
  - `/employer/dashboard` - Employer dashboard

## API Routes

### Job Seeker API Routes
- `/api/job-seeker/onboarding` - Job seeker onboarding API
- `/api/job-seeker/cv` - CV management API

### Employer API Routes
- `/api/employer/onboarding` - Employer onboarding API
- `/api/employer/jobs` - Job management API

### Shared API Routes
- `/api/auth` - Authentication API
- `/api/upload` - File upload API

## Legacy Routes (Redirected)

For backward compatibility, the following legacy routes are automatically redirected to their new locations:

- `/onboarding/*` → `/job-seeker/onboarding/*`
- `/cv-builder/*` → `/job-seeker/cv-builder/*`
- `/employer-onboarding/*` → `/employer/onboarding/*`
- `/api/onboarding/*` → `/api/job-seeker/onboarding/*`
- `/api/cv/*` → `/api/job-seeker/cv/*`
- `/api/employer/onboard/*` → `/api/employer/onboarding/*` 