import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, users, createUser } from '@/lib/db'; // Use actual database
import { eq } from 'drizzle-orm';

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  email: z.string().email('Masukkan alamat email yang valid'),
  password: z.string().min(8, 'Minimal 8 karakter diperlukan'),
  userType: z.enum(['job_seeker', 'employer'], {
    required_error: 'Pilih jenis pengguna',
  })
});

export async function POST(request: Request) {
  try {
    console.log('Registration API called');
    
    // Parse and validate the request body
    const body = await request.json();
    console.log('Registration request body:', { ...body, password: '[REDACTED]' });
    
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      console.log('Registration validation failed:', result.error.issues);
      return NextResponse.json(
        { error: 'Data input tidak valid', issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, userType } = result.data;
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existingUser.length > 0) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'Pengguna dengan email ini sudah terdaftar' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = await createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType
    });
    
    console.log('User created successfully:', { id: newUser.id, email: newUser.email, userType: newUser.userType });
    
    return NextResponse.json(
      { 
        message: 'Pendaftaran berhasil', 
        userId: newUser.id,
        userType: newUser.userType 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
} 