import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// User type enum
export type UserType = 'job_seeker' | 'employer';

// Mock user type
export type MockUser = {
  id: string;
  name: string | null;
  email: string;
  password: string;
  userType: UserType;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// In-memory database
let users: MockUser[] = [];

// Initialize with a test user
export async function initMockDb() {
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    users.push({
      id: uuidv4(),
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      userType: 'job_seeker', // Default user type
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Mock database initialized with test user');
    console.log('Current users in database:', users.length);
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<MockUser | undefined> {
  const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
  console.log(`getUserByEmail: ${email} - ${user ? 'Found' : 'Not found'}`);
  return user;
}

// Create user
export async function createUser(userData: {
  name: string | null;
  email: string;
  password: string;
  userType: UserType;
}): Promise<MockUser> {
  console.log('Creating new user:', { ...userData, password: '[REDACTED]' });
  
  const newUser: MockUser = {
    id: uuidv4(),
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: userData.password,
    userType: userData.userType,
    emailVerified: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  users.push(newUser);
  console.log(`User created. Total users: ${users.length}`);
  
  // Log all users for debugging (without passwords)
  console.log('Current users:', users.map(u => ({ 
    id: u.id, 
    email: u.email, 
    userType: u.userType 
  })));
  
  return newUser;
}

// Initialize the mock database
initMockDb(); 