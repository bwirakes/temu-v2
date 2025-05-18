"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import ApplicantSidebar from "@/components/employer-dashboard/applicants/ApplicantSidebar";
import ApplicantMobileDrawer from "@/components/employer-dashboard/applicants/ApplicantMobileDrawer";
import { Applicant } from "@/components/employer-dashboard/applicants/types";
import { useRouter } from "next/navigation";

// Mock data for applicants
const applicants: Applicant[] = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    position: "Front-end Developer",
    status: "Dalam Review",
    statusColor: "yellow",
    createdAt: "20 Mei 2023",
    whatsapp: "+62812345678",
    cvUrl: "/cv-builder/budi-santoso",
    appliedJobs: ["Front-end Developer", "UI Designer"]
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.com",
    position: "UI/UX Designer",
    status: "Diterima",
    statusColor: "green",
    createdAt: "15 Mei 2023",
    whatsapp: "+62823456789",
    cvUrl: "/cv-builder/siti-nurhaliza",
    appliedJobs: ["UI/UX Designer"]
  },
  {
    id: 3,
    name: "Agus Purnomo",
    email: "agus.purnomo@example.com",
    position: "Back-end Developer",
    status: "Ditolak",
    statusColor: "red",
    createdAt: "10 Mei 2023",
    whatsapp: "+62834567890",
    cvUrl: "/cv-builder/agus-purnomo",
    appliedJobs: ["Back-end Developer", "Full-stack Developer"]
  },
  {
    id: 4,
    name: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    position: "Product Manager",
    status: "Dalam Review",
    statusColor: "yellow",
    createdAt: "5 Mei 2023",
    whatsapp: "+62845678901",
    cvUrl: "/cv-builder/dewi-lestari",
    appliedJobs: ["Product Manager"]
  },
  {
    id: 5,
    name: "Hadi Wijaya",
    email: "hadi.wijaya@example.com",
    position: "DevOps Engineer",
    status: "Diterima",
    statusColor: "green",
    createdAt: "1 Mei 2023",
    whatsapp: "+62856789012",
    cvUrl: "/cv-builder/hadi-wijaya",
    appliedJobs: ["DevOps Engineer", "System Administrator"]
  },
  {
    id: 6,
    name: "Rina Marlina",
    email: "rina.marlina@example.com",
    position: "Data Scientist",
    status: "Dalam Review",
    statusColor: "yellow",
    createdAt: "25 April 2023",
    whatsapp: "+62867890123",
    cvUrl: "/cv-builder/rina-marlina",
    appliedJobs: ["Data Scientist", "Data Analyst"]
  }
];

export default function ApplicantsPage() {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleApplicantClick = (applicant: Applicant) => {
    router.push(`/employer/applicants/${applicant.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diterima":
        return "bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500";
      case "Ditolak":
        return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500";
      case "Dalam Review":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Diterima":
        return (
          <svg className="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        );
      case "Ditolak":
        return (
          <svg className="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        );
      case "Dalam Review":
      default:
        return (
          <svg className="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        );
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Daftar Pelamar</h1>
        <p className="text-muted-foreground">
          Kelola dan tinjau pelamar untuk lowongan pekerjaan Anda
        </p>
      </div>

      <div className="max-w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="bg-white border border-blue-100 rounded-xl shadow-md overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10"></div>
                
                {/* Header */}
                <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                      Pelamar
                    </h2>
                    <p className="text-sm text-gray-600">
                      Lihat dan kelola pelamar untuk semua lowongan
                    </p>
                  </div>

                  <div>
                    <div className="inline-flex gap-x-2">
                      <a className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none" href="#">
                        Lihat Semua
                      </a>

                      <a className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800" href="#">
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        Tambah Filter
                      </a>
                    </div>
                  </div>
                </div>
                {/* End Header */}

                {/* Mobile Table View */}
                <div className="block md:hidden">
                  {applicants.map((applicant) => (
                    <div key={applicant.id} className="border-b border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {applicant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                            <div className="text-xs text-gray-500">{applicant.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleApplicantClick(applicant)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Posisi:</span>
                          <div className="font-medium text-gray-900">{applicant.position}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div>
                            <span className={`py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                              {getStatusIcon(applicant.status)}
                              {applicant.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tanggal Dibuat:</span>
                          <div className="font-medium text-gray-900">{applicant.createdAt}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Nama Lengkap
                          </span>
                        </th>

                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Posisi
                          </span>
                        </th>

                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Status
                          </span>
                        </th>

                        <th scope="col" className="px-6 py-3 text-start">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Tanggal Dibuat
                          </span>
                        </th>

                        <th scope="col" className="px-6 py-3 text-end"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {applicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {applicant.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                                <div className="text-sm text-gray-500">{applicant.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{applicant.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                              {getStatusIcon(applicant.status)}
                              {applicant.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {applicant.createdAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleApplicantClick(applicant)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* End Table */}

                {/* Footer */}
                <div className="px-4 md:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">{applicants.length}</span> hasil
                    </p>
                  </div>

                  <div>
                    <div className="inline-flex gap-x-2">
                      <button type="button" className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Sebelumnya
                      </button>

                      <button type="button" className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                        Selanjutnya
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                {/* End Footer */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      {selectedApplicant && (
        <ApplicantSidebar
          applicant={selectedApplicant}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {selectedApplicant && (
        <ApplicantMobileDrawer
          applicant={selectedApplicant}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
} 