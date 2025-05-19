# Onboarding Status in JWT Implementation

## Overview

This document describes how onboarding status is managed in JWT tokens in our Next.js application. We use this approach to eliminate redundant API calls and improve performance by storing onboarding status directly in the JWT token.

## Architecture

### Core Components

1. **JWT Token Fields:**
   - `onboardingCompleted`: Boolean flag indicating if the user has completed onboarding
   - `onboardingRedirectTo`: String path to redirect users who haven't completed onboarding

2. **Session Object:**
   - The same fields are mapped from the JWT token to the session object
   - Available via `session.user.onboardingCompleted` and `session.user.onboardingRedirectTo`

3. **Auth System:**
   - JWT callback automatically includes onboarding status when creating tokens
   - Session callback maps these fields to the user object

4. **Middleware:**
   - Reads onboarding status directly from the session
   - Redirects users based on this status without making API calls

## Implementation Details

### Auth Callbacks

The JWT and session callbacks in `lib/auth.ts` handle the onboarding status:

```typescript
// JWT callback
async jwt({ token, user, account, trigger }) {
  if (account && user) {
    // Initial sign in
    const status = await getOnboardingStatus(user.id, user.userType);
    return { 
      ...token, 
      userId: user.id, 
      userType: user.userType,
      onboardingCompleted: status.completed, 
      onboardingRedirectTo: status.redirectTo 
    };
  }
  
  // Handle token updates (e.g., from refreshAuthSession)
  if (trigger === 'update') {
    const status = await getOnboardingStatus(token.userId, token.userType);
    return { 
      ...token, 
      onboardingCompleted: status.completed, 
      onboardingRedirectTo: status.redirectTo 
    };
  }
  
  return token;
}

// Session callback
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.userId;
    session.user.userType = token.userType;
    session.user.onboardingCompleted = token.onboardingCompleted;
    session.user.onboardingRedirectTo = token.onboardingRedirectTo;
  }
  return session;
}
```

### Middleware

The middleware checks onboarding status directly from the session:

```typescript
// Check if the user is a job seeker
if (userType === 'job_seeker') {
  const { onboardingCompleted } = user;
  
  // Allow access to onboarding routes
  if (pathname.startsWith('/job-seeker/onboarding')) {
    return NextResponse.next();
  }
  
  // Redirect non-completed users
  if (!onboardingCompleted) {
    return NextResponse.redirect(new URL('/job-seeker/onboarding', request.url));
  }
}
```

### Refresh Helpers

When a user completes onboarding, we refresh their JWT token:

```typescript
// In auth-utils.ts
export async function refreshAuthSession() {
  await fetch('/api/auth/session?update', { 
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache, no-store, max-age=0' }
  });
}

// React hook for client components
export function useRefreshSession() {
  const refresh = async (redirectTo) => {
    await refreshAuthSession();
    // Optionally redirect user
  };
  return { refresh };
}
```

## Usage Examples

### Checking Onboarding Status

```typescript
// Server component
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  const isOnboardingCompleted = session?.user?.onboardingCompleted;
  
  // Use this flag to conditionally render content
}
```

### Refreshing JWT After Onboarding Completion

```typescript
// Client component
'use client';
import { useRefreshSession } from '@/lib/hooks/useRefreshSession';

export function OnboardingSubmitButton() {
  const { refresh } = useRefreshSession();
  
  const handleSubmit = async () => {
    // Submit onboarding data
    await fetch('/api/onboarding/submit', { method: 'POST' });
    
    // Refresh token and redirect to dashboard
    await refresh('/dashboard');
  };
  
  return <button onClick={handleSubmit}>Complete</button>;
}
```

## Benefits

1. **Improved Performance:**
   - Eliminates redundant API calls on every page load
   - Faster page transitions and reduced server load

2. **Simplified Logic:**
   - Centralized onboarding status management
   - More predictable user experience

3. **Reduced Network Traffic:**
   - No separate API calls for checking onboarding status
   - Better user experience on slower connections

## Maintenance Notes

- When modifying the onboarding process, ensure the JWT is refreshed after completion
- If adding new onboarding fields, update both the JWT callback and the session callback
- Always use `refreshAuthSession()` after changing a user's onboarding status 