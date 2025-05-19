# JWT Migration Guide for Onboarding Status

This guide explains how to implement and apply the migration to include onboarding status in JWT tokens.

## Background

We've enhanced our auth system to include `onboardingCompleted` and `onboardingRedirectTo` in the JWT token, which eliminates redundant API calls in the middleware. This migration helps existing users benefit from this improvement.

## Implementation

1. The following changes have been made:
   - Added `onboardingCompleted` and `onboardingRedirectTo` to the JWT token and session
   - Updated middleware to check these values instead of making API calls
   - Created utilities to refresh the JWT token when onboarding is completed
   - Added migration endpoints and scripts to support existing users

2. The JWT callback now has enhanced logic to:
   - Set onboarding status when users log in
   - Automatically update existing tokens that don't have onboarding status
   - Refresh tokens when explicitly triggered via the "update" trigger

## Migration Process

### For New Logins (Automatic)

New logins will automatically get the onboarding status in their JWT. When a user logs in:

1. The JWT callback fetches onboarding status from the database
2. The status is stored in the JWT token
3. The middleware uses this status for routing decisions

### For Existing Sessions (Multiple Options)

You have several options to migrate existing sessions:

#### Option 1: Automatic Migration on Next Token Refresh

The JWT callback automatically adds onboarding status to existing tokens that are missing it:

```js
// Check for existing tokens without onboardingCompleted - Backfill existing tokens
if (!token.onboardingCompleted && token.userId && token.userType) {
  console.log('Backfilling JWT token with onboarding status for user:', token.userId);
  const status = await getOnboardingStatus(token.userId as string, token.userType as string);
  return { 
    ...token, 
    onboardingCompleted: status.completed, 
    onboardingRedirectTo: status.redirectTo 
  };
}
```

#### Option 2: Force Token Refresh for Specific Users

For testing or troubleshooting specific users, use the script:

```bash
# Set the admin token
export ADMIN_API_TOKEN=your_secret_token

# Refresh by user ID
node scripts/refresh-user-jwt.js --userId=1234

# Or refresh by email
node scripts/refresh-user-jwt.js --email=user@example.com
```

#### Option 3: Force All Users to Get New Tokens

If you need immediate migration for all users, you can rotate the JWT secret:

1. Generate a new secret:
   ```bash
   openssl rand -base64 32
   ```

2. Update the JWT_SECRET environment variable with the new value

3. Restart the application

This will invalidate all existing sessions, forcing users to log in again and get new tokens with onboarding status.

## Migration Admin API Endpoints

### Process All Users

```bash
curl -X POST http://localhost:3000/api/admin/migrate-jwt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token"
```

This prepares all users in the database for proper onboarding status checks but doesn't modify existing tokens. Users will get the correct status on their next login or token refresh.

### Update a Specific User

```bash
curl -X POST http://localhost:3000/api/admin/update-user-jwt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token" \
  -d '{"userId": "1234"}'
```

or

```bash
curl -X POST http://localhost:3000/api/admin/update-user-jwt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token" \
  -d '{"email": "user@example.com"}'
```

### Force Session Refresh for All Users

```bash
curl -X POST http://localhost:3000/api/admin/force-session-refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_admin_token"
```

This provides instructions for rotating the JWT secret to force all users to log in again.

## Troubleshooting

If users are still experiencing issues with `onboardingCompleted` being undefined:

1. Check that they have logged in after the migration
2. Verify the JWT token contains the correct fields (use browser devtools to inspect the token)
3. Try forcing a session refresh with the script above
4. As a last resort, rotate the JWT secret to force all users to get new tokens

## Monitoring and Logging

The system logs the following events for debugging:

- When a JWT token is created or updated with onboarding status
- When an existing token is backfilled with onboarding status
- When session objects are updated with the new fields

Monitor these logs to track the migration progress and identify any issues. 