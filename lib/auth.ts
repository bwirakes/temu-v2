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
import { CustomSession, CustomUser } from './types';
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
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        // Type assertion to CustomUser since we know our user has these properties
        const customUser = user as CustomUser;
        
        console.log('Setting JWT token with user data:', { 
          userType: customUser.userType, 
          onboardingCompleted: customUser.onboardingCompleted 
        });
        
        token.userId = customUser.id;
        token.userType = customUser.userType;
        token.onboardingCompleted = customUser.onboardingCompleted;
      }
      
      // Always fetch the latest user data from database if we have a userId
      // This ensures we always have the most current onboardingCompleted status
      if (token.userId) {
        try {
          console.log(`JWT callback: Fetching latest data for user ${token.userId}`);
          
          // Get the latest user data from database
          const [latestUserData] = await db
            .select()
            .from(users)
            .where(eq(users.id, token.userId as string));
          
          if (latestUserData) {
            // Only log if there's a change to avoid noise
            if (token.onboardingCompleted !== latestUserData.onboardingCompleted) {
              console.log(`JWT: Updating token onboardingCompleted from ${token.onboardingCompleted} to ${latestUserData.onboardingCompleted}`);
            }
            
            // Always update the token with latest values
            token.onboardingCompleted = latestUserData.onboardingCompleted;
            token.userType = latestUserData.userType;
          }
        } catch (error) {
          console.error("Error fetching latest user data in JWT callback:", error);
          // Continue with current token data
        }
      }
      
      // Session update from client
      if (trigger === 'update' && session?.user) {
        // Only update fields that were explicitly provided
        if (typeof session.user.onboardingCompleted !== 'undefined') {
          token.onboardingCompleted = session.user.onboardingCompleted;
          console.log('Updated onboardingCompleted in token from session update:', token.onboardingCompleted);
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add custom properties to session
      if (session.user) {
        // Transfer token data to session
        session.user.id = token.userId as string;
        session.user.userType = token.userType as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        
        console.log(`Session callback: onboardingCompleted=${session.user.onboardingCompleted} for user ${session.user.id}`);
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
