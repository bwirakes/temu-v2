"use client";

import { useState } from "react";
import { X, Mail, Phone, FileText, Briefcase, ChevronDown, Save } from "lucide-react";
import Link from "next/link";
import { Applicant } from "./types";

interface ApplicantSidebarProps {
  applicant: Applicant;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicantSidebar({ applicant, isOpen, onClose }: ApplicantSidebarProps) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(applicant.status);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diterima":
        return "bg-teal-100 text-teal-800";
      case "Ditolak":
        return "bg-red-100 text-red-800";
      case "Dalam Review":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleStatusChange = (status: string) => {
    if (status !== currentStatus) {
      setCurrentStatus(status);
      setHasStatusChanged(true);
    }
    setIsStatusDropdownOpen(false);
  };

  const handleSaveStatus = () => {
    // Here you would typically update the status in your backend
    console.log(`Status saved: ${currentStatus}`);
    setHasStatusChanged(false);
    // Show a success message or perform additional actions
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h3 className="text-lg font-semibold">Detail Pelamar</h3>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-3">
            <span className="text-blue-600 font-bold text-xl">
              {applicant.name.charAt(0)}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{applicant.name}</h2>
          <p className="text-gray-600">{applicant.position}</p>
          <div className="mt-2">
            <span className={`py-1 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Informasi Kontak</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <a href={`mailto:${applicant.email}`} className="text-sm text-blue-600 hover:underline">
                {applicant.email}
              </a>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <a href={`https://wa.me/${applicant.whatsapp.replace(/\+/g, '')}`} className="text-sm text-blue-600 hover:underline">
                {applicant.whatsapp} (WhatsApp)
              </a>
            </div>
          </div>
        </div>

        {/* CV Link */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Curriculum Vitae</h3>
          
          <Link 
            href={applicant.cvUrl}
            className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Lihat CV</span>
          </Link>
        </div>

        {/* Applied Jobs */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Lowongan yang Dilamar</h3>
          
          <div className="space-y-2">
            {applicant.appliedJobs.map((job, index) => (
              <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{job}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <div className="relative">
            <button 
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full py-2 px-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <span>Ubah Status: <span className="font-semibold">{currentStatus}</span></span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {isStatusDropdownOpen && (
              <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                <div className="p-1">
                  <button 
                    onClick={() => handleStatusChange("Dalam Review")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${currentStatus === "Dalam Review" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                  >
                    Dalam Review
                  </button>
                  <button 
                    onClick={() => handleStatusChange("Diterima")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${currentStatus === "Diterima" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                  >
                    Diterima
                  </button>
                  <button 
                    onClick={() => handleStatusChange("Ditolak")}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md ${currentStatus === "Ditolak" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"}`}
                  >
                    Ditolak
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {hasStatusChanged && (
            <button
              onClick={handleSaveStatus}
              className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>Simpan Perubahan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
