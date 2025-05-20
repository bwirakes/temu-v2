import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

import EmployerSettingsClientPage from "@/components/employer-settings/employer-settings-client-page";
import { getEmployerProfileData } from "@/lib/actions/employer/profile";
import { auth } from "@/lib/auth";
import { CustomUser } from "@/lib/types";

export default async function EmployerSettingsPage() {
  const session = await auth();
  const user = session?.user as CustomUser | undefined;

  if (!user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent('/employer/settings')}`);
    // Next.js redirect is an exception, so return null to satisfy TypeScript if needed,
    // though redirect() will terminate rendering.
    return null; 
  }

  if (user.userType !== 'employer') {
    redirect('/');
    return null;
  }

  const profileData = await getEmployerProfileData();

  // If profileData is null (critical error in action), it will be handled by getEmployerProfileData's error handling (e.g. redirect)
  // or the client page can show a generic error.
  // We assume getEmployerProfileData returns a valid structure (even with empty id) or handles critical errors.
  if (!profileData) {
    // This case implies a more significant issue with getEmployerProfileData if it's not redirecting on auth/critical errors.
    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Kesalahan</AlertTitle>
                <AlertDescription>
                    Tidak dapat memuat data profil. Silakan coba lagi nanti.
                    Jika masalah berlanjut, hubungi dukungan.
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  const userName = user.name || 'Pengguna';
  const userEmail = user.email || 'Email tidak tersedia';

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /> <span className="ml-2">Memuat Pengaturan...</span></div>}>
      <EmployerSettingsClientPage
        initialProfileData={profileData}
        userName={userName}
        userEmail={userEmail}
      />
    </Suspense>
  );
} 
