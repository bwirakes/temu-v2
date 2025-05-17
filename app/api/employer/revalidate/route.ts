import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

interface RevalidateRequest {
  path: string;
  token?: string;
}

// This API route allows for on-demand revalidation of specific paths
// It can be triggered when job data changes to ensure the cached pages are updated
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await auth();
    
    // Verify authentication - only allow authenticated users or valid tokens
    const REVALIDATE_TOKEN = process.env.REVALIDATE_SECRET_TOKEN;
    const body = await req.json() as RevalidateRequest;
    const { path, token } = body;
    
    // Require either authentication or a valid token
    if (!session?.user && token !== REVALIDATE_TOKEN) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Ensure path is provided
    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }
    
    // Revalidate the path
    revalidatePath(path);
    
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path
    });
  } catch (error) {
    console.error("Error during revalidation:", error);
    return NextResponse.json(
      { error: "Failed to revalidate path" },
      { status: 500 }
    );
  }
} 