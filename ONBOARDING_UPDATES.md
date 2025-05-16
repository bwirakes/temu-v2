# Onboarding Architecture Updates

## Overview

This document outlines the changes made to support incremental data saving during the onboarding process. The updates enhance the user experience by ensuring data is persisted after each step, and allowing users to resume their onboarding progress from where they left off.

## Key Components Updated

### 1. `useOnboardingApi` Hook

The `useOnboardingApi` hook was updated with the following features:
- Added `saveStep` function that accepts a step number and optional step-specific data
- Implemented `extractStepData` function to extract only the relevant data for each step
- Added `autoSaveCurrentStep` function for easy saving of the current step
- Added `lastSavedStep` state to track the most recently saved step

### 2. API Route (`app/api/onboarding/route.ts`)

The API route was enhanced to:
- Process incremental data saving based on the step number
- Improve error handling with more descriptive messages
- Calculate and return a list of completed steps
- Format the response data to match the OnboardingContext structure
- Fix type issues with type-safe object creation for database operations

### 3. OnboardingContext

The context was updated to:
- Add loading state management
- Load saved data from the API when the context initializes
- Track completed steps
- Provide completedSteps data to components

### 4. Form Components

Form components were updated to:
- Use the `saveStep` function from `useOnboardingApi`
- Show loading state during API operations
- Display success/error toast messages
- Properly handle errors during saving

### 5. Navigation Components

The `FormNav` component was enhanced to:
- Save data when proceeding to the next step
- Disable navigation controls during saving
- Provide real-time feedback on saving operations

### 6. UI Improvements

Added new components and UI enhancements:
- `OnboardingLoader` component to display loading state during API operations
- Updated `ProgressBar` to reflect completed steps
- Added toast notifications for success/error feedback

## Benefits

These changes provide several benefits:

1. **Data Persistence**: User data is now saved after each step, preventing data loss.
2. **Progress Tracking**: Users can see their progress through completed steps.
3. **Resume Capability**: Users can leave and return to the onboarding process without losing progress.
4. **Better Error Handling**: Improved error handling and feedback for users.
5. **Optimized API Usage**: Only relevant data is sent for each step, reducing payload size.

## Implementation Details

1. **API Structure**:
   - POST `/api/onboarding` with `{ step, data }` to save step-specific data
   - GET `/api/onboarding` to retrieve all saved data and completed steps

2. **Data Flow**:
   - Form data → OnboardingContext → API → Database
   - Database → API → OnboardingContext → UI components

3. **Type Safety**:
   - Added proper type checking for all API operations
   - Implemented validation using Zod schemas
   - Used type assertions where needed for database operations
