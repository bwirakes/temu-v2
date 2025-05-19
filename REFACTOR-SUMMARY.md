# NextAuth Onboarding Status Refactor

## Overview

This refactor centralizes onboarding status information in the user's JWT and session, eliminating redundant API calls and streamlining middleware logic. Instead of making API calls to check onboarding status on every page load, we now store this information directly in the JWT token.

## Changes Made

1. **Updated Auth System:**
   - Modified `lib/auth.ts` to fetch onboarding status during JWT token creation
   - Added `onboardingCompleted` and `onboardingRedirectTo` to JWT and session
   - Updated `lib/types.ts` to include these new fields in the `CustomUser` interface

2. **Simplified Middleware:**
   - Removed all fetch calls to `/api/job-seeker/check-onboarding` from middleware
   - Replaced complex logic with a simple boolean check using `onboardingCompleted` from session
   - Maintained path redirections using `onboardingRedirectTo` from session

3. **Added Auth Session Refresh Helpers:**
   - Added `refreshAuthSession()` in `lib/auth-utils.ts` to refresh JWT after onboarding completion
   - Created a React hook `useRefreshSession()` in `lib/hooks/useRefreshSession.ts` for client components
   - Created an example `OnboardingSubmitButton` component showing usage pattern

## Benefits

- **Reduced API Calls:** No more redundant API calls on every page load
- **Improved Performance:** Faster page transitions without onboarding check API calls
- **Centralized Logic:** Onboarding status logic centralized in one place
- **Better Error Handling:** More robust error handling with fallbacks for auth and session

## Testing Instructions

1. **Test User Login Flow:**
   - New job-seeker logs in → middleware reads `onboardingCompleted=false` → immediately redirects to the path from JWT
   - No API calls should be made to check onboarding status during redirects

2. **Test Onboarding Completion:**
   - Complete all onboarding steps and click the final submit button 
   - The `OnboardingSubmitButton` will:
     - Submit data to `/api/job-seeker/onboarding/submit` 
     - Call `refreshAuthSession()` to update JWT with `onboardingCompleted=true`
     - Redirect to dashboard

3. **Test Protected Routes After Completion:**
   - After completing onboarding, reload any protected route
   - Middleware should see `onboardingCompleted=true` and allow access
   - No API calls to check onboarding status should be made

## Next Steps

1. **Update Other Onboarding-Related Components:**
   - Implement the `useRefreshSession` hook in other places that modify onboarding status
   - Consider adding a session refresh when users navigate directly to a different onboarding step

2. **Monitoring & Logging:**
   - Add additional logging to track JWT/session updates
   - Monitor for any unexpected behavior in edge cases

3. **Legacy API Endpoints:**
   - The onboarding check API endpoints (`/api/job-seeker/check-onboarding`) can remain for backward compatibility
   - Consider deprecating them in the future after confirming they're no longer needed

## Potential Issues

1. **Session Staleness:**
   - If database onboarding status changes but session isn't refreshed, there could be a mismatch
   - The `refreshAuthSession()` utility should be called after any status-changing operations

2. **JWT Token Size:**
   - Adding these fields increases the JWT token size slightly
   - Monitor token size to ensure it doesn't grow too large (should not be an issue with just these fields)

3. **Browser Compatibility:**
   - Ensure the session refresh mechanism works across all supported browsers

## Rollback Plan

If issues arise, you can roll back by:

1. Removing the new fields from JWT and session in `auth.ts`
2. Reverting middleware changes to use API calls again
3. Removing the new utility functions 