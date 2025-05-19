"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";

// Define education options
const EDUCATION_OPTIONS = [
  { value: "SMP", label: "SMP", showJurusan: false },
  { value: "SMK", label: "SMK", showJurusan: true },
  { value: "SMA", label: "SMA", showJurusan: true },
  { value: "SMA/SMK", label: "SMA/SMK/Sederajat", showJurusan: true },
  { value: "D1", label: "D1", showJurusan: true },
  { value: "D2", label: "D2", showJurusan: true },
  { value: "D3", label: "D3", showJurusan: true },
  { value: "D4", label: "D4", showJurusan: true },
  { value: "S1", label: "S1", showJurusan: true },
  { value: "S2", label: "S2", showJurusan: true },
  { value: "S3", label: "S3", showJurusan: true }
];

// Define the form state type to avoid type mismatches
interface BasicInfoFormState {
  jobTitle: string;
  numberOfPositions: number;
  minWorkExperience: number;
  lastEducation: string;
  jurusan: string; // New field for major/specialization
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
    jurusan: data.jurusan || "",
    requiredCompetencies: data.requiredCompetencies || "" // Now requiredCompetencies is a string in context
  });

  // Helper to check if jurusan should be shown for the selected education level
  const shouldShowJurusan = () => {
    const educationOption = EDUCATION_OPTIONS.find(option => option.value === formData.lastEducation);
    return educationOption?.showJurusan || false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "numberOfPositions" || name === "minWorkExperience") {
      // For number inputs, convert to number to remove any leading zeros
      const numericValue = value === '' ? 0 : Number(value);
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else if (name === "lastEducation") {
      // If changing education level, clear jurusan if not applicable
      const educationOption = EDUCATION_OPTIONS.find(option => option.value === value);
      setFormData({
        ...formData,
        lastEducation: value,
        // Clear jurusan if the new education level doesn't support it
        jurusan: educationOption?.showJurusan ? formData.jurusan : ""
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
    
    // Update form values in context - directly use requiredCompetencies string
    updateFormValues({
      jobTitle: formData.jobTitle,
      numberOfPositions: formData.numberOfPositions,
      minWorkExperience: formData.minWorkExperience,
      lastEducation: formData.lastEducation,
      jurusan: shouldShowJurusan() ? formData.jurusan : "", // Only save jurusan if applicable for selected education
      requiredCompetencies: formData.requiredCompetencies.trim() // Use the string directly, just trim whitespace
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
            value={Number(formData.minWorkExperience)}
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
          {EDUCATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.lastEducation && (
          <p className="mt-1 text-sm text-red-600">{errors.lastEducation}</p>
        )}
      </div>

      {/* Jurusan (Major/Specialization) - Conditional */}
      {shouldShowJurusan() && (
        <div>
          <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700">
            Jurusan <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
          </label>
          <input
            type="text"
            id="jurusan"
            name="jurusan"
            value={formData.jurusan}
            onChange={handleChange}
            placeholder="Contoh: Teknik Informatika, Manajemen Bisnis"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
          />
        </div>
      )}

      {/* Required Competencies */}
      <div>
        <label htmlFor="requiredCompetencies" className="block text-sm font-medium text-gray-700">
          Kompetensi yang Dibutuhkan <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <textarea
          id="requiredCompetencies"
          name="requiredCompetencies"
          rows={4}
          value={formData.requiredCompetencies}
          onChange={handleChange}
          placeholder="Contoh:
Komunikasi efektif
Pemecahan masalah
Kerjasama tim"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Tuliskan setiap kompetensi pada baris terpisah untuk tampilan yang lebih baik
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