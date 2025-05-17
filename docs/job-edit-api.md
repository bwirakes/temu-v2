# Job Posting Edit API Documentation

This document provides an overview of the API endpoints for editing job postings in the employer dashboard.

## Job Edit API

The job edit API allows employers to update existing job postings.

### Get Job Data for Editing

**Endpoint:** `GET /api/employer/jobs/[id]/edit`

**Description:** Retrieves job data specifically formatted for editing in the job posting form.

**Authentication:** Requires employer authentication.

**Parameters:**
- `id` (path parameter): The ID of the job to edit

**Response:**
```json
{
  "job": {
    "id": "job-uuid",
    "employerId": "employer-uuid",
    "jobTitle": "Software Engineer",
    "contractType": "FULL_TIME",
    "salaryRange": {
      "min": 5000000,
      "max": 10000000,
      "isNegotiable": true
    },
    "minWorkExperience": 2,
    "applicationDeadline": "2023-12-31T23:59:59Z",
    "requirements": ["Bachelor's degree in Computer Science", "2+ years of experience"],
    "responsibilities": ["Develop web applications", "Collaborate with team members"],
    "description": "We are looking for a talented Software Engineer...",
    "postedDate": "2023-06-01T09:00:00Z",
    "numberOfPositions": 2,
    "workingHours": "Monday-Friday, 9 AM - 5 PM",
    "isConfirmed": true
  }
}
```

### Update Job Posting

**Endpoint:** `PUT/PATCH /api/employer/jobs/[id]/edit`

**Description:** Updates an existing job posting with new data.

**Authentication:** Requires employer authentication.

**Parameters:**
- `id` (path parameter): The ID of the job to update

**Request Body:**
```json
{
  "jobTitle": "Senior Software Engineer",
  "contractType": "FULL_TIME",
  "minWorkExperience": 3,
  "salaryRange": {
    "min": 8000000,
    "max": 15000000,
    "isNegotiable": true
  },
  "applicationDeadline": "2023-12-31T23:59:59Z",
  "requirements": ["Bachelor's degree in Computer Science", "3+ years of experience"],
  "responsibilities": ["Lead development of web applications", "Mentor junior developers"],
  "description": "We are looking for a talented Senior Software Engineer...",
  "numberOfPositions": 1,
  "workingHours": "Monday-Friday, 9 AM - 5 PM",
  "expectations": {
    "ageRange": {
      "min": 23,
      "max": 35
    },
    "expectedCharacter": "Team player with good communication skills",
    "foreignLanguage": "English"
  },
  "additionalRequirements": {
    "gender": "ANY",
    "requiredDocuments": "Portfolio and certificates",
    "specialSkills": "Web development",
    "technologicalSkills": "React, Node.js, TypeScript",
    "suitableForDisability": true
  },
  "isConfirmed": true
}
```

**Response:**
```json
{
  "job": {
    "id": "job-uuid",
    "employerId": "employer-uuid",
    "jobTitle": "Senior Software Engineer",
    "contractType": "FULL_TIME",
    "salaryRange": {
      "min": 8000000,
      "max": 15000000,
      "isNegotiable": true
    },
    "minWorkExperience": 3,
    "applicationDeadline": "2023-12-31T23:59:59Z",
    "requirements": ["Bachelor's degree in Computer Science", "3+ years of experience"],
    "responsibilities": ["Lead development of web applications", "Mentor junior developers"],
    "description": "We are looking for a talented Senior Software Engineer...",
    "postedDate": "2023-06-01T09:00:00Z",
    "numberOfPositions": 1,
    "workingHours": "Monday-Friday, 9 AM - 5 PM",
    "isConfirmed": true
  },
  "revalidated": true
}
```

## Job Work Locations API

The job work locations API allows employers to manage the work locations associated with a job posting.

### Get Job Work Locations

**Endpoint:** `GET /api/employer/jobs/[id]/locations`

**Description:** Retrieves all work locations for a specific job.

**Authentication:** Requires employer authentication.

**Parameters:**
- `id` (path parameter): The ID of the job

**Response:**
```json
{
  "locations": [
    {
      "id": "location-uuid-1",
      "jobId": "job-uuid",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "isRemote": false,
      "address": "Jl. Sudirman No. 123"
    },
    {
      "id": "location-uuid-2",
      "jobId": "job-uuid",
      "city": "Bandung",
      "province": "Jawa Barat",
      "isRemote": false,
      "address": "Jl. Asia Afrika No. 456"
    }
  ]
}
```

### Add Job Work Location

**Endpoint:** `POST /api/employer/jobs/[id]/locations`

**Description:** Adds a new work location to a job posting.

**Authentication:** Requires employer authentication.

**Parameters:**
- `id` (path parameter): The ID of the job

**Request Body:**
```json
{
  "city": "Surabaya",
  "province": "Jawa Timur",
  "isRemote": false,
  "address": "Jl. Tunjungan No. 789"
}
```

**Response:**
```json
{
  "location": {
    "id": "location-uuid-3",
    "jobId": "job-uuid",
    "city": "Surabaya",
    "province": "Jawa Timur",
    "isRemote": false,
    "address": "Jl. Tunjungan No. 789"
  },
  "revalidated": true
}
```

### Delete All Job Work Locations

**Endpoint:** `DELETE /api/employer/jobs/[id]/locations`

**Description:** Deletes all work locations for a job posting. This is useful when updating locations to replace all existing ones with new ones.

**Authentication:** Requires employer authentication.

**Parameters:**
- `id` (path parameter): The ID of the job

**Response:**
```json
{
  "success": true,
  "message": "Semua lokasi kerja berhasil dihapus",
  "revalidated": true
}
```

## Typical Job Edit Flow

A typical flow for editing a job posting would be:

1. Fetch the job data using `GET /api/employer/jobs/[id]/edit`
2. Fetch the job work locations using `GET /api/employer/jobs/[id]/locations`
3. Update the job posting form with this data
4. When the user submits the form:
   a. Update the job posting with `PUT /api/employer/jobs/[id]/edit`
   b. Delete existing work locations with `DELETE /api/employer/jobs/[id]/locations`
   c. Add new work locations with `POST /api/employer/jobs/[id]/locations` (possibly multiple times)

This ensures that the job posting and its related work locations are updated correctly.

## Error Handling

All APIs return standard HTTP status codes:

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not authorized to access this job)
- `404` - Not Found (job or employer not found)
- `405` - Method Not Allowed
- `500` - Internal Server Error

Error responses include a JSON object with an `error` property containing a human-readable error message. For validation errors, a `details` property is also included with specific validation errors. 