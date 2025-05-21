"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Define the gender type
type Gender = "MALE" | "FEMALE" | "ANY" | "ALL" | undefined;

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

interface AdditionalDetailsFormState {
  gender: Gender;
  ageRange: {
    min: number | undefined;
    max: number | undefined;
  };
  suitableForDisability: boolean;
  acceptedDisabilityTypes: string[];
  numberOfDisabilityPositions: number | null;
}

export default function AdditionalDetailsForm() {
  const router = useRouter();
  const { data, updateFormValues, getStepValidationErrors, setCurrentStep } = useJobPosting();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize with default values from context
  const [formData, setFormData] = useState<AdditionalDetailsFormState>({
    gender: (data.additionalRequirements?.gender as Gender) || "ANY",
    ageRange: {
      min: data.expectations?.ageRange?.min || 18,
      max: data.expectations?.ageRange?.max || 45
    },
    suitableForDisability: 
      (data.additionalRequirements?.acceptedDisabilityTypes?.length || 0) > 0 || 
      (data.additionalRequirements?.numberOfDisabilityPositions || 0) > 0,
    acceptedDisabilityTypes: data.additionalRequirements?.acceptedDisabilityTypes || [],
    numberOfDisabilityPositions: data.additionalRequirements?.numberOfDisabilityPositions || null
  });
  
  const [customDisabilityType, setCustomDisabilityType] = useState("");

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
          numberOfDisabilityPositions: null,
          suitableForDisability: false
        }));
      }
    } else if (name === "gender") {
      setFormData({
        ...formData,
        gender: value as Gender
      });
    } else if (name === "numberOfDisabilityPositions") {
      setFormData({
        ...formData,
        numberOfDisabilityPositions: parseInt(value) || null
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAgeRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.replace("ageRange.", "");
    
    setFormData({
      ...formData,
      ageRange: {
        ...formData.ageRange,
        [field]: parseInt(value) || undefined
      }
    });
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
      // Show visual feedback that the type was added
      const customTypeInput = document.getElementById('custom-disability-type');
      if (customTypeInput) {
        customTypeInput.classList.add('bg-green-50', 'border-green-500');
        setTimeout(() => {
          customTypeInput.classList.remove('bg-green-50', 'border-green-500');
        }, 1000);
      }
      setCustomDisabilityType("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate age range
    if (!formData.ageRange || !formData.ageRange.min || !formData.ageRange.max) {
      newErrors.ageRange = 'Harapan umur wajib diisi';
    } else if (formData.ageRange.min < 15) {
      newErrors.ageRange = 'Umur minimal tidak valid (minimal 15 tahun)';
    } else if (formData.ageRange.max < formData.ageRange.min) {
      newErrors.ageRange = 'Umur maksimal harus lebih besar dari umur minimal';
    }
    
    // Validate disability fields if enabled
    if (formData.suitableForDisability) {
      if (formData.acceptedDisabilityTypes.length === 0) {
        newErrors.acceptedDisabilityTypes = "Pilih minimal satu jenis disabilitas";
      }
      
      if (!formData.numberOfDisabilityPositions || formData.numberOfDisabilityPositions <= 0) {
        newErrors.numberOfDisabilityPositions = "Jumlah posisi harus lebih dari 0";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update form values in context
    updateFormValues({
      additionalRequirements: {
        gender: formData.gender,
        acceptedDisabilityTypes: formData.suitableForDisability ? formData.acceptedDisabilityTypes : [],
        numberOfDisabilityPositions: formData.suitableForDisability ? formData.numberOfDisabilityPositions : null
      },
      expectations: {
        ageRange: formData.ageRange
      }
    });
    
    // Clear any previous errors
    setErrors({});
    
    // Update the step before navigation
    setCurrentStep(3);
    router.push("/employer/job-posting/confirmation");
  };

  const handleBack = () => {
    // Save current form state before navigating back
    updateFormValues({
      additionalRequirements: {
        gender: formData.gender,
        acceptedDisabilityTypes: formData.suitableForDisability ? formData.acceptedDisabilityTypes : [],
        numberOfDisabilityPositions: formData.suitableForDisability ? formData.numberOfDisabilityPositions : null
      },
      expectations: {
        ageRange: formData.ageRange
      }
    });
    
    router.push("/employer/job-posting/basic-info");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Jenis Kelamin <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender || "ANY"}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.gender ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        >
          <option value="ANY">Semua Jenis Kelamin</option>
          <option value="MALE">Laki-laki</option>
          <option value="FEMALE">Perempuan</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Harapan Umur <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ageRange.min" className="block text-sm text-gray-500">
              Minimal
            </label>
            <input
              type="number"
              id="ageRange.min"
              name="ageRange.min"
              min="15"
              value={formData.ageRange.min || ""}
              onChange={handleAgeRangeChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.ageRange ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
            />
          </div>
          <div>
            <label htmlFor="ageRange.max" className="block text-sm text-gray-500">
              Maksimal
            </label>
            <input
              type="number"
              id="ageRange.max"
              name="ageRange.max"
              min="15"
              value={formData.ageRange.max || ""}
              onChange={handleAgeRangeChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.ageRange ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
            />
          </div>
        </div>
        {errors.ageRange && (
          <p className="mt-1 text-sm text-red-600">{errors.ageRange}</p>
        )}
      </div>

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
                id="custom-disability-type"
                value={customDisabilityType}
                onChange={(e) => setCustomDisabilityType(e.target.value)}
                placeholder="Jenis disabilitas lainnya"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 transition-colors duration-200"
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
            
            {/* Feedback message for adding custom disability type */}
            {formData.acceptedDisabilityTypes.length > 0 && formData.acceptedDisabilityTypes[formData.acceptedDisabilityTypes.length - 1] !== "" && (
              <div className="mt-1">
                <p className="text-xs text-green-600 min-h-[1rem] transition-opacity duration-500 ease-in-out">
                  {formData.acceptedDisabilityTypes.includes(customDisabilityType.trim()) ? 
                    `"${customDisabilityType}" telah ditambahkan` : ""}
                </p>
              </div>
            )}
            
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
              value={formData.numberOfDisabilityPositions || ""}
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
