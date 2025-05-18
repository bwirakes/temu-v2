"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";

import { 
  useEmployerOnboarding, 
  kehadiranOnlineSchema,
  logoPerusahaanSchema
} from "@/lib/context/EmployerOnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/employer-onboarding/ui/FormLabel";
import EmployerFormNav from "@/components/employer-onboarding/EmployerFormNav";

type KehadiranOnlineValues = z.infer<typeof kehadiranOnlineSchema>;

export default function KehadiranOnlineForm() {
  const { data, updateFormValues, setCurrentStep, saveCurrentStepData } = useEmployerOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);

  const defaultValues: KehadiranOnlineValues = {
    website: data.website || "",
    instagram: data.socialMedia?.instagram || "",
    linkedin: data.socialMedia?.linkedin || "",
    facebook: data.socialMedia?.facebook || "",
    twitter: data.socialMedia?.twitter || "",
    tiktok: data.socialMedia?.tiktok || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KehadiranOnlineValues>({
    resolver: zodResolver(kehadiranOnlineSchema),
    defaultValues,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogo(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: KehadiranOnlineValues) => {
    try {
      setIsSubmitting(true);
      
      // First, update form values in context
      updateFormValues({
        website: values.website,
        socialMedia: {
          instagram: values.instagram,
          linkedin: values.linkedin,
          facebook: values.facebook,
          twitter: values.twitter,
          tiktok: values.tiktok,
        },
        logo: selectedLogo || undefined,
        logoUrl: logoPreview || undefined,
      });
  
      // Set the next step before saving to ensure it's captured in the API call
      setCurrentStep(3);
      
      // Log the current state before saving
      console.log("About to save data with step:", 3);
      
      // Now save the data with the updated step
      const saveSuccessful = await saveCurrentStepData();
      
      if (saveSuccessful) {
        console.log("Save successful, navigating to next step");
        toast.success("Kehadiran online berhasil disimpan");
        
        // Use setTimeout to ensure the state update completes before navigation
        setTimeout(() => {
          // Force a hard navigation
          window.location.href = "/employer/onboarding/penanggung-jawab";
        }, 100);
      } else {
        console.error("Failed to save data");
        // Revert step increment if save failed
        setCurrentStep(2);
        toast.error("Gagal menyimpan data. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      // Revert step increment on error
      setCurrentStep(2);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Website */}
        <div className="space-y-2">
          <FormLabel htmlFor="website">
            Alamat Website Resmi Perusahaan
          </FormLabel>
          <Input
            id="website"
            placeholder="perusahaan-anda.com"
            {...register("website")}
            className={errors.website ? "border-red-500" : ""}
          />
          {errors.website && (
            <p className="text-red-500 text-sm">{errors.website.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Alamat website utama perusahaan atau merek usaha Anda
          </p>
        </div>

        {/* Media Sosial */}
        <div className="space-y-4 my-6">
          <h3 className="font-medium text-gray-700">Media Sosial Perusahaan</h3>
          
          <div className="space-y-2">
            <FormLabel htmlFor="instagram">Instagram</FormLabel>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                @
              </span>
              <Input
                id="instagram"
                placeholder="nama_perusahaan"
                {...register("instagram")}
                className="rounded-l-none"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <FormLabel htmlFor="linkedin">LinkedIn</FormLabel>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                linkedin.com/company/
              </span>
              <Input
                id="linkedin"
                placeholder="perusahaan-anda"
                {...register("linkedin")}
                className="rounded-l-none"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel htmlFor="facebook">Facebook</FormLabel>
              <Input
                id="facebook"
                placeholder="Nama Halaman Facebook"
                {...register("facebook")}
              />
            </div>
            
            <div className="space-y-2">
              <FormLabel htmlFor="twitter">Twitter/X</FormLabel>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                  @
                </span>
                <Input
                  id="twitter"
                  placeholder="nama_perusahaan"
                  {...register("twitter")}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <FormLabel htmlFor="tiktok">TikTok</FormLabel>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                @
              </span>
              <Input
                id="tiktok"
                placeholder="nama_perusahaan"
                {...register("tiktok")}
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>

        {/* Logo Perusahaan */}
        <div className="space-y-4 mt-6">
          <h3 className="font-medium text-gray-700">Logo Perusahaan atau Merek Usaha</h3>
          
          <div className="space-y-3">
            {logoPreview && (
              <div className="mb-4">
                <Image 
                  src={logoPreview} 
                  alt="Logo preview" 
                  width={160} 
                  height={160} 
                  className="max-h-40 border rounded-md object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                  priority={false}
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex items-center justify-center w-full">
              <label 
                htmlFor="logo" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Klik untuk unggah</span> atau seret dan lepas
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (MAX. 2MB)</p>
                </div>
                <input 
                  id="logo" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoChange} 
                />
              </label>
            </div>
            
            <p className="text-xs text-gray-500">
              Logo akan ditampilkan pada profil perusahaan Anda dan akan terlihat oleh pencari kerja.
            </p>
          </div>
        </div>
      </div>

      <EmployerFormNav isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} />
    </form>
  );
} 