# JWT Migration Deployment Plan

## Overview

This document outlines the deployment plan for implementing the JWT onboarding status migration. The migration adds `onboardingCompleted` and `onboardingRedirectTo` flags to user JWTs to eliminate redundant API calls and improve performance.

## Files Modified/Created

1. **Core Auth System:**
   - `lib/auth.ts` - Updated JWT and session callbacks to include onboarding status
   - `lib/types.ts` - Added new fields to the CustomUser interface
   - `lib/auth-helpers.ts` - Created shared function for fetching onboarding status

2. **Middleware:**
   - `middleware.ts` - Simplified to use onboarding status from session instead of API calls

3. **Session Refresh Utilities:**
   - `lib/auth-utils.ts` - Added refreshAuthSession function
   - `lib/hooks/useRefreshSession.ts` - Created React hook for client components

4. **Migration Tools:**
   - `app/api/admin/migrate-jwt/route.ts` - Admin endpoint to process all users
   - `app/api/admin/update-user-jwt/route.ts` - Admin endpoint for specific users
   - `app/api/admin/force-session-refresh/route.ts` - Guidance for JWT secret rotation
   - `scripts/refresh-user-jwt.js` - CLI script for targeted user refreshes

5. **Documentation:**
   - `JWT-MIGRATION.md` - Migration guide
   - `JWT-MIGRATION-DEPLOYMENT.md` - This deployment plan

## Deployment Steps

### 1. Pre-Deployment Testing

- [ ] Test in a staging environment with multiple user types
- [ ] Verify auto-backfill works for existing sessions
- [ ] Test token refresh mechanism for completed onboarding
- [ ] Ensure middleware correctly redirects based on onboarding status

### 2. Deployment Preparation

- [ ] Generate a new admin token for migration endpoints
  ```bash
  export ADMIN_API_TOKEN=$(openssl rand -base64 32)
  echo $ADMIN_API_TOKEN > .admin-token
  ```
- [ ] Update environment variables to include this token
- [ ] Schedule deployment during low-traffic period
- [ ] Communicate the planned changes to the team

### 3. Deployment Sequence

1. **Deploy Code Changes:**
   - [ ] Deploy all code changes together in a single update
   - [ ] Verify deployment with basic health checks

2. **Run Initial Migration:**
   ```bash
   curl -X POST https://your-app-url/api/admin/migrate-jwt \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $ADMIN_API_TOKEN"
   ```

3. **Monitor Logs:**
   - [ ] Watch for "Backfilling JWT token" logs in production
   - [ ] Monitor for any errors during token updates
   - [ ] Check for middleware behavior with new flags

4. **Test with Sample Users:**
   - [ ] Test with sample job seeker and employer accounts
   - [ ] Verify correct redirects based on onboarding status

### 4. Rollback Plan (If Needed)

If critical issues are discovered:

1. **Revert Code Changes:**
   - Return to previous version of auth.ts, middleware.ts, and types.ts
   - This will restore original behavior with API calls

2. **Communicate Status:**
   - Notify team of rollback and reasons
   - Prepare timeline for fixing issues and redeploying

### 5. Post-Deployment Steps

1. **Verify Production Behavior:**
   - [ ] Confirm users are receiving correct onboarding status
   - [ ] Verify middleware redirects based on onboarding flags
   - [ ] Check logs for any unexpected errors

2. **Monitor Performance:**
   - [ ] Check for reduced API calls to onboarding endpoints
   - [ ] Monitor response times for protected routes
   - [ ] Watch for any unexpected behavior in edge cases

3. **Document Any Issues:**
   - [ ] Create tickets for any bugs or edge cases discovered
   - [ ] Prioritize fixes based on user impact

## Contingency Plans

### Session Issues for Existing Users

If existing users experience issues with missing onboarding status:

1. **Option A: Targeted Refresh**
   - Use the update-user-jwt endpoint to refresh specific users
   ```bash
   node scripts/refresh-user-jwt.js --email=affected-user@example.com
   ```

2. **Option B: Force Global Refresh**
   - As a last resort, rotate the JWT secret to force all users to log in again:
   ```bash
   export NEW_JWT_SECRET=$(openssl rand -base64 32)
   # Update this in your environment variables
   ```

## Conclusion

This deployment adds significant performance improvements by eliminating redundant API calls for onboarding status checks. The auto-backfill mechanism should handle existing users gracefully, but monitor logs closely and be prepared to use the provided tools to address any issues that arise. 