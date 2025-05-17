"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";

// Define the form state type to avoid type mismatches
interface BasicInfoFormState {
  jobTitle: string;
  numberOfPositions: number;
  minWorkExperience: number;
  lastEducation: string;
  requiredCompetencies: string; // String for textarea input that will be split into array
}

export default function BasicInfoForm() {
  const router = useRouter();
  const { data, updateFormValues, getStepValidationErrors, setCurrentStep } = useJobPosting();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<BasicInfoFormState>({
    jobTitle: data.jobTitle || "",
    numberOfPositions: data.numberOfPositions || 1,
    minWorkExperience: data.minWorkExperience || 0,
    lastEducation: data.lastEducation || "",
    requiredCompetencies: Array.isArray(data.requiredCompetencies) 
      ? data.requiredCompetencies.join(', ') 
      : (data.requiredCompetencies || "")
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "numberOfPositions" || name === "minWorkExperience") {
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

    if (!formData.lastEducation || formData.lastEducation === "") {
      newErrors.lastEducation = "Pendidikan terakhir wajib diisi";
    }
    
    console.log("Local validation errors:", newErrors);
    
    // If there are validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Process requiredCompetencies into an array before saving
    const competenciesArray = formData.requiredCompetencies
      ? formData.requiredCompetencies.split(',').map(item => item.trim()).filter(Boolean)
      : [];
    
    // Update form values in context
    updateFormValues({
      jobTitle: formData.jobTitle,
      numberOfPositions: formData.numberOfPositions,
      minWorkExperience: formData.minWorkExperience,
      lastEducation: formData.lastEducation,
      requiredCompetencies: competenciesArray
    });
    
    // Clear any previous errors
    setErrors({});
    
    // Update the step before navigation
    setCurrentStep(2);
    router.push("/employer/job-posting/additional-details");
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

      {/* Minimum Work Experience */}
      <div>
        <label htmlFor="minWorkExperience" className="block text-sm font-medium text-gray-700">
          Minimum Pengalaman Kerja <span className="text-gray-400 text-xs ml-1">(Tahun)</span>
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="number"
            id="minWorkExperience"
            name="minWorkExperience"
            min="0"
            value={formData.minWorkExperience}
            onChange={handleChange}
            className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
          <span className="ml-2 text-sm text-gray-700">tahun</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Masukkan 0 jika tidak ada persyaratan pengalaman kerja
        </p>
      </div>

      {/* Last Education */}
      <div>
        <label htmlFor="lastEducation" className="block text-sm font-medium text-gray-700">
          Pendidikan Terakhir <span className="text-red-500">*</span>
        </label>
        <select
          id="lastEducation"
          name="lastEducation"
          value={formData.lastEducation}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.lastEducation ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        >
          <option value="">Pilih Pendidikan Terakhir</option>
          <option value="SD">SD</option>
          <option value="SMP">SMP</option>
          <option value="SMA/SMK">SMA/SMK</option>
          <option value="Diploma">Diploma</option>
          <option value="S1">S1</option>
          <option value="S2">S2</option>
          <option value="S3">S3</option>
          <option value="Tidak Ada">Tidak Ada</option>
        </select>
        {errors.lastEducation && (
          <p className="mt-1 text-sm text-red-600">{errors.lastEducation}</p>
        )}
      </div>

      {/* Required Competencies */}
      <div>
        <label htmlFor="requiredCompetencies" className="block text-sm font-medium text-gray-700">
          Kompetensi yang Dibutuhkan <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <textarea
          id="requiredCompetencies"
          name="requiredCompetencies"
          rows={3}
          value={formData.requiredCompetencies}
          onChange={handleChange}
          placeholder="Contoh: Kemampuan analitis, Komunikasi yang baik, Kepemimpinan, dll."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Pisahkan dengan koma (,) untuk beberapa kompetensi
        </p>
      </div>

      {/* Navigation Buttons */}
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