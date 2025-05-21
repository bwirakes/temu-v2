"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobEditForm from "@/components/employer-dashboard/jobs/JobEditForm";

export default function JobEditPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const handleSave = () => {
    router.push("/employer/jobs");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Kembali</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Lowongan Pekerjaan</h1>
          <p className="text-muted-foreground">
            Edit informasi lowongan pekerjaan dalam satu halaman
          </p>
        </div>
      </div>

      <JobEditForm 
        jobId={jobId} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </div>
  );
} 