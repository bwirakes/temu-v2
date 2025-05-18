"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Define ContractType enum
export type ContractType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";

// Define disability types
const DISABILITY_TYPES = [
  "Tuna Netra",
  "Tuna Rungu",
  "Tuna Wicara",
  "Tuna Daksa",
  "Tuna Grahita",
  "Tuna Laras",
  "Autisme",
  "Lainnya"
];

export default function AdditionalInfoForm() {
  const router = useRouter();
  const { data, updateFormValues } = useJobPosting();
  
  // Local form state
  const [formData, setFormData] = useState({
    // This is just for UI, not stored in the JobPostingData
    suitableForDisability: false, 
    acceptedDisabilityTypes: data.additionalRequirements?.acceptedDisabilityTypes || [],
    numberOfDisabilityPositions: data.additionalRequirements?.numberOfDisabilityPositions || 0,
    contractType: "FULL_TIME" as ContractType, // Default to FULL_TIME since it's no longer in the schema
    applicationDeadline: "" // Default to empty string since it's no longer in the schema
  });
  
  const [customDisabilityType, setCustomDisabilityType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      
      // If disabling the suitableForDisability checkbox, reset related fields
      if (name === "suitableForDisability" && !checked) {
        setFormData(prev => ({
          ...prev,
          acceptedDisabilityTypes: [],
          numberOfDisabilityPositions: 0,
          suitableForDisability: false
        }));
      }
    } else if (name === "contractType") {
      setFormData({
        ...formData,
        contractType: value ? value as ContractType : "FULL_TIME"
      });
    } else if (name === "numberOfDisabilityPositions") {
      setFormData({
        ...formData,
        numberOfDisabilityPositions: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleDisabilityTypeChange = (type: string) => {
    const isSelected = formData.acceptedDisabilityTypes.includes(type);
    let updatedTypes = [...formData.acceptedDisabilityTypes];
    
    if (isSelected) {
      updatedTypes = updatedTypes.filter(t => t !== type);
    } else {
      updatedTypes.push(type);
    }
    
    setFormData({
      ...formData,
      acceptedDisabilityTypes: updatedTypes
    });
  };
  
  const addCustomDisabilityType = () => {
    if (customDisabilityType.trim() !== "" && !formData.acceptedDisabilityTypes.includes(customDisabilityType)) {
      setFormData({
        ...formData,
        acceptedDisabilityTypes: [...formData.acceptedDisabilityTypes, customDisabilityType]
      });
      setCustomDisabilityType("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate if suitableForDisability is checked
    const newErrors: Record<string, string> = {};
    
    if (formData.suitableForDisability) {
      if (formData.acceptedDisabilityTypes.length === 0) {
        newErrors.acceptedDisabilityTypes = "Pilih minimal satu jenis disabilitas";
      }
      
      if (formData.numberOfDisabilityPositions <= 0) {
        newErrors.numberOfDisabilityPositions = "Jumlah posisi harus lebih dari 0";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Only update the properties that exist in the JobPostingData interface
    updateFormValues({
      additionalRequirements: {
        ...data.additionalRequirements,
        acceptedDisabilityTypes: formData.suitableForDisability ? formData.acceptedDisabilityTypes : [],
        numberOfDisabilityPositions: formData.suitableForDisability ? formData.numberOfDisabilityPositions : 0,
        // Maintain gender if it exists
        gender: data.additionalRequirements?.gender
      }
    });
    
    router.push("/employer/job-posting/confirmation");
  };

  const handleBack = () => {
    // Only update the properties that exist in the JobPostingData interface
    updateFormValues({
      additionalRequirements: {
        ...data.additionalRequirements,
        acceptedDisabilityTypes: formData.suitableForDisability ? formData.acceptedDisabilityTypes : [],
        numberOfDisabilityPositions: formData.suitableForDisability ? formData.numberOfDisabilityPositions : 0,
        // Maintain gender if it exists
        gender: data.additionalRequirements?.gender
      }
    });
    
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

      {/* Disability-specific fields (only shown when suitableForDisability is checked) */}
      {formData.suitableForDisability && (
        <div className="border border-blue-200 bg-blue-50 p-4 rounded-md space-y-4">
          <h3 className="font-medium text-blue-800">Informasi Disabilitas</h3>
          
          {/* Accepted Disability Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jenis Disabilitas yang Cocok <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Pilih satu atau lebih jenis disabilitas yang cocok untuk posisi ini
            </p>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DISABILITY_TYPES.map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`disability-${type}`}
                    checked={formData.acceptedDisabilityTypes.includes(type)}
                    onChange={() => handleDisabilityTypeChange(type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`disability-${type}`} className="ml-2 text-sm text-gray-700">
                    {type}
                  </label>
                </div>
              ))}
            </div>
            
            {/* Custom disability type input */}
            <div className="mt-3 flex items-center">
              <input
                type="text"
                value={customDisabilityType}
                onChange={(e) => setCustomDisabilityType(e.target.value)}
                placeholder="Jenis disabilitas lainnya"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
              />
              <button
                type="button"
                onClick={addCustomDisabilityType}
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Tambah
              </button>
            </div>
            
            {/* Display selected custom disability types */}
            {formData.acceptedDisabilityTypes.filter(type => !DISABILITY_TYPES.includes(type)).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Jenis disabilitas tambahan:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.acceptedDisabilityTypes
                    .filter(type => !DISABILITY_TYPES.includes(type))
                    .map(type => (
                      <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {type}
                        <button
                          type="button"
                          onClick={() => handleDisabilityTypeChange(type)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
            
            {errors.acceptedDisabilityTypes && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptedDisabilityTypes}</p>
            )}
          </div>
          
          {/* Number of Disability Positions */}
          <div>
            <label htmlFor="numberOfDisabilityPositions" className="block text-sm font-medium text-gray-700">
              Jumlah Posisi untuk Rekan Disabilitas <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="numberOfDisabilityPositions"
              name="numberOfDisabilityPositions"
              min="1"
              value={formData.numberOfDisabilityPositions}
              onChange={handleChange}
              className={`mt-1 block w-24 rounded-md border ${
                errors.numberOfDisabilityPositions ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Berapa banyak posisi yang tersedia untuk kandidat dengan disabilitas?
            </p>
            {errors.numberOfDisabilityPositions && (
              <p className="mt-1 text-sm text-red-600">{errors.numberOfDisabilityPositions}</p>
            )}
          </div>
        </div>
      )}

      {/* Contract Type */}
      <div>
        <label htmlFor="contractType" className="block text-sm font-medium text-gray-700">
          Jenis Kontrak Kerja <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <select
          id="contractType"
          name="contractType"
          value={formData.contractType}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        >
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