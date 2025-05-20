import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorDisplay from './ErrorDisplay';

export default async function JobApplyRedirectPage({
  params
}: {
  params: Promise<{ employerId: string; jobId: string }>
}) {
  // Error could occur here when resolving params or in auth()
  // Instead of using try/catch which causes the component to render when there's an error
  // We'll handle specific errors and use the built-in Next.js error handling

  // Get authentication session server-side
  const session = await auth();
  
  // Await params as it's a Promise in Next.js 15
  const resolvedParams = await params;
  const { employerId, jobId } = resolvedParams;

  // Input validation: Check if employerId and jobId are valid
  if (!employerId || !jobId) {
    const errorUrl = `/error?message=${encodeURIComponent('ID lowongan atau perusahaan tidak valid')}&back=${encodeURIComponent('/')}`;
    redirect(errorUrl);
  }

  // If user is authenticated, redirect to the application process API
  if (session?.user) {
    const apiUrl = `/api/auth/apply?employerId=${encodeURIComponent(employerId)}&jobId=${encodeURIComponent(jobId)}`;
    redirect(apiUrl);
  } else {
    // User is not authenticated, redirect to sign-in page with callback URL
    const currentUrl = `/careers/${employerId}/${jobId}/apply`;
    const callbackUrl = encodeURIComponent(currentUrl);
    redirect(`/auth/signin?callbackUrl=${callbackUrl}`);
  }

  // This part will never render due to the redirects above
  // But we keep it for type correctness and as a fallback
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Pengalihan</CardTitle>
          <CardDescription>
            Terjadi kesalahan
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          <ErrorDisplay errorMessage="Terjadi kesalahan saat memproses permintaan. Silakan coba lagi." />
        </CardContent>
      </Card>
    </div>
  );
} 
