import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, users } from './db'; // Use actual database
import { eq } from 'drizzle-orm';
import type { User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import { CustomSession } from './types';
import { getOnboardingStatus } from './auth-helpers';

// Define credentials type
interface Credentials {
  email: string;
  password: string;
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
            userType: user.userType
          };
        } catch (error) {
          console.error("Database error during authentication:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }: { token: JWT; user?: User & { userType?: string }; account?: any; trigger?: "signIn" | "signUp" | "update" }) {
      // Initial sign in
      if (account && user) {
        console.log('Setting JWT token with user type on initial sign in:', user.userType);
        const base = { ...token, userId: user.id, userType: user.userType };
        
        if (user.id && user.userType) {
          const status = await getOnboardingStatus(user.id, user.userType);
          return { 
            ...base, 
            onboardingCompleted: status.completed, 
            onboardingRedirectTo: status.redirectTo 
          };
        }
        
        // Fallback (should not happen)
        return { ...base, onboardingCompleted: true, onboardingRedirectTo: '/' };
      }
      
      // Handle token updates (e.g., from refreshAuthSession)
      if (trigger === 'update' && token.userId && token.userType) {
        console.log('Updating JWT token onboarding status for user:', token.userId);
        const status = await getOnboardingStatus(token.userId as string, token.userType as string);
        return { 
          ...token, 
          onboardingCompleted: status.completed, 
          onboardingRedirectTo: status.redirectTo 
        };
      }
      
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
      
      return token;
    },
    async session({ session, token }: { session: CustomSession; token: JWT & { userType?: string; userId?: string; onboardingCompleted?: boolean; onboardingRedirectTo?: string } }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.userType = token.userType as 'job_seeker' | 'employer';
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.onboardingRedirectTo = token.onboardingRedirectTo as string;
        console.log('Session updated with user type:', session.user.userType, 'onboardingCompleted:', session.user.onboardingCompleted);
      }
      return session;
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
