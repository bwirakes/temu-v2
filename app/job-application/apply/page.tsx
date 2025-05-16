'use client';

import { useRef, useState } from 'react';
import JobApplicationForm from '@/components/job-application/JobApplicationForm';
import { Briefcase } from 'lucide-react';
import JobPostingProviderWithSampleData from '@/components/job-application/JobPostingProviderWithSampleData';
import { useJobPosting } from '@/lib/context/JobPostingContext';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lamar Pekerjaan</h1>
          <p className="mt-2 text-sm text-gray-500">
            Isi formulir di bawah ini untuk melamar posisi pekerjaan ini.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <JobPostingProviderWithSampleData>
            {/* Job Summary */}
            <JobSummary />

            {/* Application Form */}
            <div className="lg:col-span-2">
              <JobApplicationForm />
            </div>
          </JobPostingProviderWithSampleData>
        </div>
      </div>
    </div>
  );
}

// Separate component for job summary to use the context inside
function JobSummary() {
  const { data } = useJobPosting();
  
  return (
    <div className="lg:col-span-1">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg sticky top-8">
        <div className="px-4 py-5 sm:px-6 flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ringkasan Pekerjaan
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h4 className="text-lg font-medium text-gray-900">{data.jobTitle}</h4>
          <p className="mt-1 text-sm text-gray-500">PT. Example Company</p>
          
          <div className="mt-4 space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-500">Lokasi</h5>
              <ul className="mt-1 text-sm text-gray-900 list-disc pl-5">
                {data.workLocations?.map((location, index) => (
                  <li key={index}>
                    {location.city}, {location.province}
                    {location.isRemote && " (Remote)"}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-500">Jenis Kontrak</h5>
              <p className="mt-1 text-sm text-gray-900">
                {data.contractType === "FULL_TIME" ? "Full Time" :
                 data.contractType === "PART_TIME" ? "Part Time" :
                 data.contractType === "CONTRACT" ? "Kontrak" :
                 data.contractType === "INTERNSHIP" ? "Magang" :
                 "Freelance"}
              </p>
            </div>
            
            {data.salaryRange && (
              <div>
                <h5 className="text-sm font-medium text-gray-500">Kisaran Gaji</h5>
                <p className="mt-1 text-sm text-gray-900">
                  {data.salaryRange.min && `Rp ${data.salaryRange.min.toLocaleString()}`}
                  {data.salaryRange.min && data.salaryRange.max && " - "}
                  {data.salaryRange.max && `Rp ${data.salaryRange.max.toLocaleString()}`}
                  {data.salaryRange.isNegotiable && " (Dapat dinegosiasikan)"}
                </p>
              </div>
            )}
            
            <div>
              <h5 className="text-sm font-medium text-gray-500">Pengalaman yang Dibutuhkan</h5>
              <p className="mt-1 text-sm text-gray-900">
                {data.minWorkExperience} tahun minimum
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-500">Batas Waktu Pendaftaran</h5>
              <p className="mt-1 text-sm text-gray-900">
                {data.applicationDeadline?.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
