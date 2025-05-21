import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  // Get the path and secret from URL parameters
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const secret = searchParams.get('secret');

  // Check if the secret is valid
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  // Check if a path is provided
  if (!path) {
    return NextResponse.json({ message: 'Path parameter is required' }, { status: 400 });
  }

  try {
    // Revalidate the specified path
    revalidatePath(path);
    
    return NextResponse.json({ 
      revalidated: true, 
      message: `Path "${path}" revalidated successfully`, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error(`Error revalidating path "${path}":`, error);
    return NextResponse.json(
      { message: `Error revalidating: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 