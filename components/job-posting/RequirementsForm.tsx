"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";

export default function RequirementsForm() {
  const router = useRouter();
  const { data, updateFormValues, getStepValidationErrors } = useJobPosting();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    gender: data.gender,
    minWorkExperience: data.minWorkExperience || 0,
    requiredDocuments: data.requiredDocuments,
    specialSkills: data.specialSkills || "",
    technologicalSkills: data.technologicalSkills || "",
    lastEducation: data.lastEducation || "",
    requiredCompetencies: data.requiredCompetencies || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "minWorkExperience") {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom validation for the new fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.lastEducation || formData.lastEducation.trim() === "") {
      newErrors.lastEducation = "Pendidikan terakhir wajib diisi";
    }
    
    // Combine with existing validation
    const validationErrors = {
      ...getStepValidationErrors(2),
      ...newErrors
    };
    
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      updateFormValues(formData);
      router.push("/employer/job-posting/expectations");
    }
  };

  const handleBack = () => {
    updateFormValues(formData);
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
          value={formData.gender}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.gender ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        >
          <option value="ANY">Semua Jenis Kelamin</option>
          <option value="MALE">Laki-laki</option>
          <option value="FEMALE">Perempuan</option>
          <option value="ALL">Semua</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
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

      {/* Minimum Work Experience */}
      <div>
        <label htmlFor="minWorkExperience" className="block text-sm font-medium text-gray-700">
          Minimum Pengalaman Kerja <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
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
      </div>

      {/* Required Documents */}
      <div>
        <label htmlFor="requiredDocuments" className="block text-sm font-medium text-gray-700">
          Dokumen atau Sertifikasi yang Wajib Dimiliki <span className="text-red-500">*</span>
        </label>
        <textarea
          id="requiredDocuments"
          name="requiredDocuments"
          rows={3}
          value={formData.requiredDocuments}
          onChange={handleChange}
          placeholder="Contoh: KTP, Ijazah, SIM, Sertifikat Keahlian, dll."
          className={`mt-1 block w-full rounded-md border ${
            errors.requiredDocuments ? "border-red-300" : "border-gray-300"
          } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
        />
        {errors.requiredDocuments && (
          <p className="mt-1 text-sm text-red-600">{errors.requiredDocuments}</p>
        )}
      </div>

      {/* Special Skills */}
      <div>
        <label htmlFor="specialSkills" className="block text-sm font-medium text-gray-700">
          Ketrampilan Khusus <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <textarea
          id="specialSkills"
          name="specialSkills"
          rows={3}
          value={formData.specialSkills}
          onChange={handleChange}
          placeholder="Contoh: Mampu memahami komponen listrik, Mampu mengoperasikan mesin jahit, dll."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
      </div>

      {/* Technological Skills */}
      <div>
        <label htmlFor="technologicalSkills" className="block text-sm font-medium text-gray-700">
          Ketrampilan Teknologi <span className="text-gray-400 text-xs ml-1">(Opsional)</span>
        </label>
        <textarea
          id="technologicalSkills"
          name="technologicalSkills"
          rows={3}
          value={formData.technologicalSkills}
          onChange={handleChange}
          placeholder="Contoh: Microsoft Office, Adobe Photoshop, AutoCAD, dll."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          Jika ada, sebutkan teknologi yang akan digunakan dan tingkat keahlian yang diharapkan
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