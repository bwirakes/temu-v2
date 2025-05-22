import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq, count, gt, desc, ilike, or, and } from 'drizzle-orm';
import { employers, jobs } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit') || '', 10) 
      : 30;
    
    // Build the base query
    const baseQuery = db
      .select({
        id: employers.id,
        namaPerusahaan: employers.namaPerusahaan,
        merekUsaha: employers.merekUsaha,
        industri: employers.industri,
        logoUrl: employers.logoUrl,
        jobCount: count(jobs.id),
      })
      .from(employers)
      .leftJoin(jobs, eq(employers.id, jobs.employerId))
      .where(eq(jobs.isConfirmed, true))
      .groupBy(employers.id)
      .having(gt(count(jobs.id), 0))
      .orderBy(desc(count(jobs.id)));
    
    // Execute the query and get the results
    let results = await baseQuery;
    
    // If search query is provided, filter the results in memory
    if (searchQuery && searchQuery.trim() !== '') {
      const searchTermLower = searchQuery.toLowerCase();
      results = results.filter(employer => 
        employer.namaPerusahaan.toLowerCase().includes(searchTermLower) ||
        (employer.merekUsaha && employer.merekUsaha.toLowerCase().includes(searchTermLower)) ||
        employer.industri.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply limit if provided
    if (limitParam && typeof limitParam === 'number' && results.length > limitParam) {
      return NextResponse.json(results.slice(0, limitParam));
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching employers with job counts:", error);
    return NextResponse.json({ error: "Failed to fetch employers" }, { status: 500 });
  }
} 