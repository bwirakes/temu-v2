"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";
import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// Define the form state type to avoid type mismatches
interface BasicInfoFormState {
  jobTitle: string;
  numberOfPositions: number;
  responsibilities: string; // String for textarea input
  workLocations: {
    city: string;
    province: string;
    isRemote: boolean;
    address?: string;
  }[];
  workingHours: string;
  salaryRange: {
    min?: number;
    max?: number;
    isNegotiable: boolean;
  };
}

export default function BasicInfoForm() {
  const router = useRouter();
  const { data, updateFormValues, getStepValidationErrors, setCurrentStep } = useJobPosting();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BasicInfoFormState>({
    jobTitle: data.jobTitle || "",
    numberOfPositions: data.numberOfPositions || 1,
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : (data.responsibilities || ""),
    workLocations: data.workLocations?.length > 0 
      ? data.workLocations 
      : [{ city: '', province: '', isRemote: false, address: '' }],
    workingHours: data.workingHours || "",
    salaryRange: data.salaryRange || {
      min: undefined,
      max: undefined,
      isNegotiable: true
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "numberOfPositions") {
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      salaryRange: {
        ...formData.salaryRange,
        [name.replace("salaryRange.", "")]: type === "checkbox" ? checked : value ? parseInt(value) : undefined
      }
    });
  };

  const handleLocationChange = (index: number, field: string, value: string | boolean) => {
    const updatedLocations = [...formData.workLocations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      workLocations: updatedLocations
    });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      workLocations: [
        ...formData.workLocations,
        { address: "", city: "", province: "", isRemote: false }
      ]
    });
  };

  const removeLocation = (index: number) => {
    const updatedLocations = formData.workLocations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      workLocations: updatedLocations
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log current form data for debugging
    console.log("Form data being submitted:", formData);
    
    // Initialize empty errors object
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    if (formData.jobTitle.trim() === "") {
      newErrors.jobTitle = "Jenis pekerjaan wajib diisi";
    }
    
    if (formData.numberOfPositions < 1) {
      newErrors.numberOfPositions = "Jumlah tenaga kerja wajib diisi";
    }
    
    if (formData.responsibilities.trim() === "") {
      newErrors.responsibilities = "Tugas dan tanggung jawab wajib diisi";
    }
    
    if (formData.workLocations.length === 0) {
      newErrors.workLocations = "Minimal satu lokasi kerja wajib diisi";
    } else {
      // Check location fields
      formData.workLocations.forEach((location, index) => {
        if (!location.city || location.city.trim() === "") {
          newErrors[`workLocations[${index}].city`] = "Kota wajib diisi";
        }
        if (!location.province || location.province.trim() === "") {
          newErrors[`workLocations[${index}].province`] = "Provinsi wajib diisi";
        }
      });
    }
    
    console.log("Local validation errors:", newErrors);
    
    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update form values in context
    updateFormValues({
      jobTitle: formData.jobTitle,
      numberOfPositions: formData.numberOfPositions,
      responsibilities: formData.responsibilities as any,
      workLocations: formData.workLocations,
      workingHours: formData.workingHours,
      salaryRange: formData.salaryRange
    });
    
    // Clear any previous errors
    setErrors({});
    
    // Update the step before navigation
    setCurrentStep(2);
    router.push("/employer/job-posting/requirements");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Title */}
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
          Jenis Pekerjaan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="jobTitle"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.jobTitle ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        />
        {errors.jobTitle && (
          <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
        )}
      </div>

      {/* Number of Positions */}
      <div>
        <label htmlFor="numberOfPositions" className="block text-sm font-medium text-gray-700">
          Jumlah Tenaga Kerja yang Dicari <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="numberOfPositions"
          name="numberOfPositions"
          min="1"
          value={formData.numberOfPositions}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.numberOfPositions ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        />
        {errors.numberOfPositions && (
          <p className="mt-1 text-sm text-red-600">{errors.numberOfPositions}</p>
        )}
      </div>

      {/* Responsibilities */}
      <div>
        <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">
          Tugas dan Tanggung Jawab <span className="text-red-500">*</span>
        </label>
        <textarea
          id="responsibilities"
          name="responsibilities"
          rows={4}
          value={formData.responsibilities}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.responsibilities ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
          placeholder="Jelaskan tugas dan tanggung jawab pekerjaan ini..."
        />
        {errors.responsibilities && (
          <p className="mt-1 text-sm text-red-600">{errors.responsibilities}</p>
        )}
      </div>

      {/* Work Locations */}
      <div>
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Lokasi Kerja <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addLocation}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Tambah Lokasi
          </button>
        </div>
        
        {errors.workLocations && (
          <p className="mt-1 text-sm text-red-600">{errors.workLocations}</p>
        )}

        {formData.workLocations.map((location, index) => (
          <div key={index} className="mt-3 p-4 border border-gray-200 rounded-md">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-700">Lokasi {index + 1}</h4>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`isRemote-${index}`}
                  checked={location.isRemote}
                  onChange={(e) => handleLocationChange(index, "isRemote", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`isRemote-${index}`} className="ml-2 block text-sm text-gray-700">
                  Pekerjaan ini dapat dilakukan secara remote
                </label>
              </div>

              <div className="grid grid-cols-1 gap-y-3">
                <div>
                  <label htmlFor={`address-${index}`} className="block text-sm font-medium text-gray-700">
                    Alamat
                  </label>
                  <input
                    type="text"
                    id={`address-${index}`}
                    value={location.address}
                    onChange={(e) => handleLocationChange(index, "address", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-x-3">
                  <div>
                    <label htmlFor={`city-${index}`} className="block text-sm font-medium text-gray-700">
                      Kota <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`city-${index}`}
                      value={location.city}
                      onChange={(e) => handleLocationChange(index, "city", e.target.value)}
                      className={`mt-1 block w-full rounded-md border ${
                        errors[`workLocations[${index}].city`] ? "border-red-300" : "border-gray-300"
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                    />
                    {errors[`workLocations[${index}].city`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`workLocations[${index}].city`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor={`province-${index}`} className="block text-sm font-medium text-gray-700">
                      Provinsi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`province-${index}`}
                      value={location.province}
                      onChange={(e) => handleLocationChange(index, "province", e.target.value)}
                      className={`mt-1 block w-full rounded-md border ${
                        errors[`workLocations[${index}].province`] ? "border-red-300" : "border-gray-300"
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                    />
                    {errors[`workLocations[${index}].province`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`workLocations[${index}].province`]}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Working Hours */}
      <div>
        <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
          Jam Kerja <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <input
          type="text"
          id="workingHours"
          name="workingHours"
          value={formData.workingHours}
          onChange={handleChange}
          placeholder="Contoh: Senin-Jumat, 09:00-17:00"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
        <p className="mt-1 text-xs text-gray-500">Masukkan jika pekerjaan ini umumnya memerlukan lembur</p>
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Rentang Gaji <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="salaryRange.min" className="block text-sm text-gray-500">
              Minimal (Rp)
            </label>
            <input
              type="number"
              id="salaryRange.min"
              name="salaryRange.min"
              value={formData.salaryRange?.min || ""}
              onChange={handleSalaryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="salaryRange.max" className="block text-sm text-gray-500">
              Maksimal (Rp)
            </label>
            <input
              type="number"
              id="salaryRange.max"
              name="salaryRange.max"
              value={formData.salaryRange?.max || ""}
              onChange={handleSalaryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
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