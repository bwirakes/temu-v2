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
    async jwt({ token, user, account }: { token: JWT; user?: User & { userType?: string }; account?: any }) {
      // Initial sign in
      if (account && user) {
        console.log('Setting JWT token with user type:', user.userType);
        return {
          ...token,
          userId: user.id,
          userType: user.userType
        };
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession; token: JWT & { userType?: string; userId?: string } }) {
      if (token.userId && session.user) {
        session.user.id = token.userId;
        session.user.userType = token.userType as 'job_seeker' | 'employer';
        console.log('Session updated with user type:', session.user.userType);
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
