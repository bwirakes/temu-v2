"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";

// Define ContractType enum
export type ContractType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";

export default function AdditionalInfoForm() {
  const router = useRouter();
  const { data, updateFormValues } = useJobPosting();
  const [formData, setFormData] = useState({
    suitableForDisability: data.additionalRequirements?.suitableForDisability || false,
    contractType: data.contractType || undefined as ContractType | undefined,
    applicationDeadline: data.applicationDeadline 
      ? formatDateForInput(new Date(data.applicationDeadline))
      : ""
  });

  // Format date to dd/mm/yyyy for display
  function formatDateForDisplay(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Format date to yyyy-mm-dd for input element
  function formatDateForInput(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  // Parse date from dd/mm/yyyy format
  function parseDateFromDisplay(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === "contractType") {
      setFormData({
        ...formData,
        contractType: value ? value as ContractType : undefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string date to Date object if provided
    const updatedData = {
      ...formData,
      applicationDeadline: formData.applicationDeadline 
        ? new Date(formData.applicationDeadline) 
        : undefined
    };
    
    updateFormValues(updatedData);
    router.push("/employer/job-posting/confirmation");
  };

  const handleBack = () => {
    // Convert string date to Date object if provided
    const updatedData = {
      ...formData,
      applicationDeadline: formData.applicationDeadline 
        ? new Date(formData.applicationDeadline) 
        : undefined
    };
    
    updateFormValues(updatedData);
    router.push("/employer/job-posting/expectations");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Suitable for Disability */}
      <div>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="suitableForDisability"
              name="suitableForDisability"
              type="checkbox"
              checked={formData.suitableForDisability}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="suitableForDisability" className="font-medium text-gray-700">
              Pekerjaan dapat dilakukan oleh rekan dengan Disabilitas
            </label>
            <p className="text-gray-500">
              Centang jika posisi ini cocok untuk kandidat dengan disabilitas
            </p>
          </div>
        </div>
      </div>

      {/* Contract Type */}
      <div>
        <label htmlFor="contractType" className="block text-sm font-medium text-gray-700">
          Jenis Kontrak Kerja <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <select
          id="contractType"
          name="contractType"
          value={formData.contractType || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        >
          <option value="">Pilih Jenis Kontrak</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="CONTRACT">Kontrak</option>
          <option value="INTERNSHIP">Magang</option>
          <option value="FREELANCE">Freelance</option>
        </select>
      </div>

      {/* Application Deadline */}
      <div>
        <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700">
          Batas Waktu Pendaftaran <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <input
          type="date"
          id="applicationDeadline"
          name="applicationDeadline"
          value={formData.applicationDeadline}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Format tanggal: DD/MM/YYYY (contoh: 31/12/2023)
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Kosongkan jika lowongan ini dibuka secara umum tanpa batas waktu
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Kembali
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Lanjutkan
        </button>
      </div>
    </form>
  );
} 