import { Session } from 'next-auth';

export interface CustomUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userType?: 'job_seeker' | 'employer';
}

export interface CustomSession extends Session {
  user?: CustomUser;
} 