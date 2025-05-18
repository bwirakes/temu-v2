"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";

// Define types for the form data
interface ExpectationsFormData {
  ageRange: {
    min: number;
    max: number;
  };
  expectedCharacter: string;
  foreignLanguage: string;
}

export default function ExpectationsForm() {
  const router = useRouter();
  const { data, updateFormValues, getStepValidationErrors } = useJobPosting();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize with default values if properties don't exist in data
  const [formData, setFormData] = useState<ExpectationsFormData>({
    ageRange: {
      min: data.expectations?.ageRange?.min || 18,
      max: data.expectations?.ageRange?.max || 45
    },
    expectedCharacter: "",
    foreignLanguage: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Log the name and value to debug
    console.log(`Field changed: ${name} with value: ${value}`);
    
    // Update form data
    setFormData(prevData => {
      const newData = { ...prevData };
      
      // Handle direct properties (expectedCharacter, foreignLanguage)
      if (name === "expectedCharacter" || name === "foreignLanguage") {
        newData[name] = value;
      }
      
      console.log("Updated form data:", newData);
      return newData;
    });
  };

  const handleAgeRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.replace("ageRange.", "");
    
    setFormData({
      ...formData,
      ageRange: {
        ...formData.ageRange,
        [field]: parseInt(value) || 0
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting form data:", formData);
    
    // Initialize empty errors object
    const newErrors: Record<string, string> = {};
    
    // Validate age range
    if (!formData.ageRange || !formData.ageRange.min || !formData.ageRange.max) {
      newErrors.ageRange = 'Harapan umur wajib diisi';
    } else if (formData.ageRange.min < 15) {
      newErrors.ageRange = 'Umur minimal tidak valid (minimal 15 tahun)';
    } else if (formData.ageRange.max < formData.ageRange.min) {
      newErrors.ageRange = 'Umur maksimal harus lebih besar dari umur minimal';
    }
    
    // Validate expected character
    if (!formData.expectedCharacter || formData.expectedCharacter.trim() === '') {
      newErrors.expectedCharacter = 'Karakter yang diharapkan wajib diisi';
    }
    
    console.log("Local validation errors:", newErrors);
    
    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // First update the job posting data with expectations data
    updateFormValues({
      expectations: {
        ageRange: formData.ageRange
      }
    });
    
    // Clear any previous errors
    setErrors({});
    
    // Navigate to next page
    router.push("/employer/job-posting/additional-info");
  };

  const handleBack = () => {
    // Update the job posting data with expectations data
    updateFormValues({
      expectations: {
        ageRange: formData.ageRange
      }
    });
    router.push("/employer/job-posting/requirements");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              value={formData.ageRange.min}
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
              value={formData.ageRange.max}
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

      {/* Expected Character */}
      <div>
        <label htmlFor="expectedCharacter" className="block text-sm font-medium text-gray-700">
          Karakter yang Diharapkan <span className="text-red-500">*</span>
        </label>
        <textarea
          id="expectedCharacter"
          name="expectedCharacter"
          rows={3}
          value={formData.expectedCharacter}
          onChange={handleChange}
          placeholder="Contoh: Mampu bekerja dalam tim, Disiplin, Teliti, dll."
          className={`mt-1 block w-full rounded-md border ${
            errors.expectedCharacter ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        />
        <button 
          type="button" 
          className="mt-1 text-xs text-blue-600"
          onClick={() => {
            console.log("Current expectedCharacter value:", formData.expectedCharacter);
            // Set a test value
            setFormData(prev => ({
              ...prev,
              expectedCharacter: prev.expectedCharacter || "Disiplin, Teliti, Jujur"
            }));
          }}
        >
          Debug: Check Value
        </button>
        {errors.expectedCharacter && (
          <p className="mt-1 text-sm text-red-600">{errors.expectedCharacter}</p>
        )}
      </div>

      {/* Foreign Language */}
      <div>
        <label htmlFor="foreignLanguage" className="block text-sm font-medium text-gray-700">
          Kemampuan Bahasa Asing <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <textarea
          id="foreignLanguage"
          name="foreignLanguage"
          rows={2}
          value={formData.foreignLanguage}
          onChange={handleChange}
          placeholder="Contoh: Bahasa Inggris (pasif), Bahasa Mandarin (aktif), dll."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Sebutkan jika pekerjaan memerlukan kemampuan bahasa asing
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