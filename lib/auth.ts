import NextAuth from 'next-auth';
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
interface CredentialsType {
  email: string;
  password: string;
}

// Define custom JWT type to include our custom properties
interface CustomJWT extends JWT {
  userId?: string;
  userType?: 'job_seeker' | 'employer';
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        const { email, password } = credentials as CredentialsType;
        
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
    async jwt({ token, user, trigger, session }): Promise<CustomJWT> {
      // Initial sign in - happens once when user first authenticates
      if (user) {
        // Type assertion to CustomUser since we know our user has these properties
        const customUser = user as CustomUser;
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('Setting JWT token with user data:', { 
            userType: customUser.userType
          });
        }
        
        // Set only essential identifiers in the token
        token.userId = customUser.id;
        token.userType = customUser.userType;
        
        // No longer storing onboardingCompleted or onboardingRedirectTo in the token
      }
      
      // Session update from client - explicitly requested by calling update()
      if (trigger === 'update') {
        if (process.env.NODE_ENV !== 'production') {
          console.log('JWT callback: Session update trigger - no onboarding state changes needed');
        }
        
        // No longer processing onboardingCompleted updates in JWT
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
          userType: token.userType as 'job_seeker' | 'employer'
          // Removed onboardingCompleted and onboardingRedirectTo from session
        }
      } as CustomSession;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Session callback: userId=${customSession.user?.id}, userType=${customSession.user?.userType}`);
      }
      
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
