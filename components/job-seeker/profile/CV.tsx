import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit } from "lucide-react";
import { SectionCard, EmptyState } from "./ProfileComponents";

interface CVProps {
  cvFileUrl?: string | null;
  cvUploadDate?: string | Date | null;
}

export function CV({ cvFileUrl, cvUploadDate }: CVProps) {
  return (
    <SectionCard 
      title="CV / Resume" 
      icon={<FileText className="h-4 w-4 text-blue-700" />}
      action={
        <Button variant="ghost" size="sm" className="transition-colors duration-200 h-7 text-xs">
          <Edit className="h-3 w-3 mr-1" />
          {cvFileUrl ? 'Ganti CV' : 'Upload CV'}
        </Button>
      }
    >
      {cvFileUrl ? (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3 border rounded-lg flex items-center justify-center p-6 bg-gray-50">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <div className="w-full md:w-2/3">
            <h3 className="font-medium text-gray-900">CV Anda</h3>
            <p className="text-sm text-gray-500 mt-1">
              Diunggah pada: {cvUploadDate ? 
                new Date(cvUploadDate).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }) : 'Tidak diketahui'
              }
            </p>
            <p className="text-sm text-gray-500">
              File ini akan dikirim ke pemberi kerja saat Anda melamar pekerjaan
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="h-8 text-sm" asChild>
                <a href={cvFileUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4 mr-1" />
                  Lihat CV
                </a>
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-sm" asChild>
                <a href={cvFileUrl} download>
                  <Download className="h-4 w-4 mr-1" />
                  Unduh
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Belum ada CV"
          description="Unggah CV Anda untuk meningkatkan peluang mendapatkan pekerjaan"
          action={
            <Button size="sm" className="mt-2" asChild>
              <a href="/job-seeker/onboarding/cv-upload">Unggah CV</a>
            </Button>
          }
        />
      )}
    </SectionCard>
  );
} 