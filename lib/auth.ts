import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, users } from './db'; // Use actual database
import { eq } from 'drizzle-orm';
import type { User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session, DefaultSession } from 'next-auth';
import { CustomSession, CustomUser } from './types';
import { getOnboardingStatusEdge } from './auth-helpers';

// Define credentials type
interface Credentials {
  email: string;
  password: string;
}

// Define custom JWT type to include our custom properties
interface CustomJWT extends JWT {
  userId?: string;
  userType?: 'job_seeker' | 'employer';
  onboardingCompleted?: boolean;
  onboardingRedirectTo?: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        const { email, password } = credentials as Credentials;
        
        if (!email || !password) {
          return null;
        }
        
        try {
          // Find user in database
          const lowercaseEmail = email.toLowerCase();
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, lowercaseEmail));

          if (!user || !user.password) {
            console.log('User not found or no password:', lowercaseEmail);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );
          
          if (!isPasswordValid) {
            console.log('Invalid password for user:', lowercaseEmail);
            return null;
          }

          console.log('User authenticated successfully:', user.email, 'User type:', user.userType);
          
          // Return user data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            userType: user.userType,
            onboardingCompleted: user.onboardingCompleted
          };
        } catch (error) {
          console.error("Database error during authentication:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }): Promise<CustomJWT> {
      // Initial sign in - happens once when user first authenticates
      if (user) {
        // Type assertion to CustomUser since we know our user has these properties
        const customUser = user as CustomUser;
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('Setting JWT token with user data:', { 
            userType: customUser.userType, 
            onboardingCompleted: customUser.onboardingCompleted 
          });
        }
        
        // Set the token data from user object
        token.userId = customUser.id;
        token.userType = customUser.userType;
        token.onboardingCompleted = customUser.onboardingCompleted;
        
        // Only fetch onboarding status if onboarding is not completed
        // This avoids unnecessary DB calls for users who have completed onboarding
        if (!customUser.onboardingCompleted) {
          try {
            const status = await getOnboardingStatusEdge(customUser.id, customUser.userType);
            // Only update token.onboardingCompleted if database says it's true
            if (status.completed) {
              token.onboardingCompleted = true;
            }
            // Store redirectTo path for potential onboarding
            token.onboardingRedirectTo = status.redirectTo;
            
            if (process.env.NODE_ENV !== 'production') {
              console.log(`JWT: Initial sign-in, set onboardingRedirectTo=${token.onboardingRedirectTo}`);
            }
          } catch (error) {
            console.error("Error getting onboarding status in JWT callback:", error);
            // Continue with basic token data
          }
        } else {
          // For users with completed onboarding, set default dashboard redirect
          const dashboardPath = customUser.userType === 'job_seeker' 
            ? '/job-seeker/dashboard' 
            : '/employer/dashboard';
          token.onboardingRedirectTo = dashboardPath;
        }
      }
      
      // Session update from client - explicitly requested by calling update()
      if (trigger === 'update') {
        if (process.env.NODE_ENV !== 'production') {
          console.log('JWT callback: Session update trigger');
        }
        
        // Update the onboarding status if explicitly provided in the session update
        if (session?.user) {
          // Only update fields that were explicitly provided
          if (typeof session.user.onboardingCompleted !== 'undefined') {
            // Explicitly log the change for debugging purposes
            console.log(`JWT callback: Updating onboardingCompleted from ${token.onboardingCompleted} to ${session.user.onboardingCompleted}`);
            
            token.onboardingCompleted = session.user.onboardingCompleted;
            
            // If onboarding is now completed, update the redirectTo to point to dashboard
            if (session.user.onboardingCompleted === true && token.userType) {
              const dashboardPath = token.userType === 'job_seeker' 
                ? '/job-seeker/dashboard' 
                : '/employer/dashboard';
              token.onboardingRedirectTo = dashboardPath;
              
              console.log(`JWT callback: Onboarding completed, set redirectTo to ${dashboardPath}`);
              
              // Skip the DB call since we just set the values explicitly and 
              // onboardingCompleted=true is definitive
              return token;
            }
            
            if (process.env.NODE_ENV !== 'production') {
              console.log('Updated onboardingCompleted in token from session update:', token.onboardingCompleted);
            }
          }
          
          // Only refresh onboarding data from DB if onboarding is not yet completed
          // This avoids unnecessary DB calls for users who have completed onboarding
          if (token.userId && token.userType && token.onboardingCompleted !== true) {
            try {
              // Use caching: true to leverage fast responses, but revalidation will happen
              // in the background for subsequent requests
              const status = await getOnboardingStatusEdge(token.userId as string, token.userType as string);
              
              // Log the status for debugging
              console.log(`JWT callback: Fetched onboarding status from DB: completed=${status.completed}, redirectTo=${status.redirectTo}`);
              
              // If DB says onboarding is completed, this is the source of truth
              if (status.completed === true) {
                token.onboardingCompleted = true;
                // Update redirectTo to dashboard when onboarding is completed
                const dashboardPath = token.userType === 'job_seeker' 
                  ? '/job-seeker/dashboard' 
                  : '/employer/dashboard';
                token.onboardingRedirectTo = dashboardPath;
              } else if (!token.onboardingRedirectTo || token.onboardingRedirectTo !== status.redirectTo) {
                // Only update redirectTo if it's different from what we already have
                token.onboardingRedirectTo = status.redirectTo;
              }
              
              if (process.env.NODE_ENV !== 'production') {
                console.log(`JWT: Session update, refreshed onboardingRedirectTo=${token.onboardingRedirectTo}`);
              }
            } catch (error) {
              console.error("Error refreshing onboarding status in JWT callback:", error);
              // Continue with existing token data
            }
          }
        }
      }
      
      return token;
    },
    
    async session({ session, token }): Promise<CustomSession> {
      // Add custom properties to session
      const customSession = {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
          userType: token.userType as 'job_seeker' | 'employer',
          onboardingCompleted: token.onboardingCompleted as boolean,
          onboardingRedirectTo: token.onboardingRedirectTo as string | undefined
        }
      } as CustomSession;
      
      console.log(`Session callback: onboardingCompleted=${customSession.user?.onboardingCompleted}, onboardingRedirectTo=${customSession.user?.onboardingRedirectTo}`);
      
      return customSession;
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request'
  },
  session: {
    strategy: 'jwt'
  }
});
