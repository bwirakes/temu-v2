"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface JobEditSidebarProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobEditSidebar({ jobId, isOpen, onClose }: JobEditSidebarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Add event listener to close sidebar on escape key
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Lock body scroll when sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  if (!isOpen) return null;

  const sections = [
    {
      title: "Informasi Dasar",
      description: "Judul pekerjaan, jumlah posisi, tanggung jawab, dll.",
      path: `/employer/job-posting/basic-info?id=${jobId}`
    },
    {
      title: "Persyaratan",
      description: "Jenis kelamin, pengalaman kerja, dokumen yang diperlukan, dll.",
      path: `/employer/job-posting/requirements?id=${jobId}`
    },
    {
      title: "Harapan Perusahaan",
      description: "Rentang usia, karakter yang diharapkan, bahasa asing, dll.",
      path: `/employer/job-posting/expectations?id=${jobId}`
    },
    {
      title: "Informasi Tambahan",
      description: "Jenis kontrak, batas waktu pendaftaran, dll.",
      path: `/employer/job-posting/additional-info?id=${jobId}`
    },
    {
      title: "Konfirmasi",
      description: "Tinjau dan konfirmasi informasi lowongan.",
      path: `/employer/job-posting/confirmation?id=${jobId}`
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Edit Lowongan</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <p className="text-sm text-gray-600 mb-6">
              Pilih bagian yang ingin Anda edit:
            </p>

            <div className="space-y-3">
              {sections.map((section, index) => (
                <Link 
                  key={index}
                  href={section.path}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    onClose();
                    // We need to manually navigate since we're closing the sidebar
                    router.push(section.path);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <Button onClick={onClose} className="w-full">
              Kembali ke Daftar Lowongan
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 