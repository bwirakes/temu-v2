"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JobApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Mock data for job applications
  const applications = [
    { id: "JOB-1234", title: "Senior Frontend Developer", company: "TechCorp", status: "Sedang Ditinjau", date: "2023-11-15" },
    { id: "JOB-5678", title: "UX Designer", company: "DesignStudio", status: "Wawancara", date: "2023-11-10" },
    { id: "JOB-9012", title: "Product Manager", company: "InnovateCo", status: "Ditolak", date: "2023-11-05" },
    { id: "JOB-3456", title: "Backend Developer", company: "ServerTech", status: "Melamar", date: "2023-11-18" },
    { id: "JOB-7890", title: "Data Scientist", company: "DataCorp", status: "Ditawari", date: "2023-11-01" },
    { id: "JOB-2345", title: "DevOps Engineer", company: "CloudOps", status: "Sedang Ditinjau", date: "2023-11-12" },
  ];

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      // Filter by search term
      const matchesSearch = 
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "date") {
        return sortOrder === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "company") {
        return sortOrder === "asc"
          ? a.company.localeCompare(b.company)
          : b.company.localeCompare(a.company);
      }
      return 0;
    });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "melamar":
        return "bg-gray-100 text-gray-800";
      case "sedang ditinjau":
        return "bg-yellow-100 text-yellow-800";
      case "wawancara":
        return "bg-blue-100 text-blue-800";
      case "ditawari":
        return "bg-teal-100 text-teal-800";
      case "ditolak":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge icon
  const getStatusBadgeIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "ditawari":
      case "melamar":
        return (
          <svg className="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
        );
      case "sedang ditinjau":
      case "wawancara":
      case "ditolak":
        return (
          <svg className="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[85rem] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lamaran Saya</h1>
        <p className="text-gray-500">Pantau dan kelola lamaran kerja Anda</p>
      </div>

      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Semua Lamaran
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total: {filteredApplications.length} lamaran
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Cari lamaran..."
                      className="pl-8 w-full md:w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="melamar">Melamar</SelectItem>
                      <SelectItem value="sedang ditinjau">Sedang Ditinjau</SelectItem>
                      <SelectItem value="wawancara">Wawancara</SelectItem>
                      <SelectItem value="ditawari">Ditawari</SelectItem>
                      <SelectItem value="ditolak">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="inline-flex gap-x-2">
                    <Link 
                      href="/job-seeker/browse-jobs"
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Cari Lowongan
                    </Link>
                  </div>
                </div>
              </div>
              {/* End Header */}

              {/* Table */}
              {filteredApplications.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="ps-6 py-3 text-start">
                        <label htmlFor="select-all" className="flex">
                          <input 
                            type="checkbox" 
                            className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500" 
                            id="select-all"
                          />
                          <span className="sr-only">Select all</span>
                        </label>
                      </th>
                      <th scope="col" className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            ID Lowongan
                          </span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-start">
                        <div 
                          className="flex items-center gap-x-2 cursor-pointer"
                          onClick={() => {
                            setSortBy("title");
                            toggleSortOrder();
                          }}
                        >
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Posisi
                          </span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-start">
                        <div 
                          className="flex items-center gap-x-2 cursor-pointer"
                          onClick={() => {
                            setSortBy("company");
                            toggleSortOrder();
                          }}
                        >
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Perusahaan
                          </span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Status
                          </span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-start">
                        <div 
                          className="flex items-center gap-x-2 cursor-pointer"
                          onClick={() => {
                            setSortBy("date");
                            toggleSortOrder();
                          }}
                        >
                          <span className="text-xs font-semibold uppercase text-gray-800">
                            Tanggal
                          </span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-end"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((application, index) => (
                      <tr key={application.id}>
                        <td className="size-px whitespace-nowrap">
                          <div className="ps-6 py-3">
                            <label htmlFor={`checkbox-${index}`} className="flex">
                              <input 
                                type="checkbox" 
                                className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500" 
                                id={`checkbox-${index}`}
                              />
                              <span className="sr-only">Checkbox</span>
                            </label>
                          </div>
                        </td>
                        <td className="size-px whitespace-nowrap">
                          <div className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3">
                            <span className="block text-sm font-semibold text-gray-800">{application.id}</span>
                          </div>
                        </td>
                        <td className="h-px w-72 whitespace-nowrap">
                          <div className="px-6 py-3">
                            <span className="block text-sm font-semibold text-gray-800">{application.title}</span>
                          </div>
                        </td>
                        <td className="size-px whitespace-nowrap">
                          <div className="px-6 py-3">
                            <span className="block text-sm text-gray-500">{application.company}</span>
                          </div>
                        </td>
                        <td className="size-px whitespace-nowrap">
                          <div className="px-6 py-3">
                            <span className={`py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium ${getStatusBadgeClass(application.status)} rounded-full`}>
                              {getStatusBadgeIcon(application.status)}
                              {application.status}
                            </span>
                          </div>
                        </td>
                        <td className="size-px whitespace-nowrap">
                          <div className="px-6 py-3">
                            <span className="text-sm text-gray-500">{new Date(application.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="size-px whitespace-nowrap">
                          <div className="px-6 py-1.5">
                            <Link 
                              href={`/job-seeker/applications/${application.id}`}
                              className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline font-medium"
                            >
                              Detail
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Tidak ada lamaran yang sesuai dengan filter Anda</p>
                  {statusFilter !== "all" || searchTerm ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      Hapus Filter
                    </Button>
                  ) : (
                    <Link 
                      href="/job-seeker/browse-jobs"
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Cari Lowongan
                    </Link>
                  )}
                </div>
              )}

              {/* Footer */}
              {filteredApplications.length > 0 && (
                <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">{filteredApplications.length}</span> hasil
                    </p>
                  </div>

                  <div>
                    <div className="inline-flex gap-x-2">
                      <button type="button" className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Sebelumnya
                      </button>

                      <button type="button" className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                        Berikutnya
                        <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* End Footer */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 