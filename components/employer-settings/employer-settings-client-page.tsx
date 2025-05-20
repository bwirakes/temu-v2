"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

// Shadcn UI imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Icons
import { AlertCircle, Save, Upload, User, Loader2 } from "lucide-react";

// Toast
import { toast } from "sonner";

// Type imports and actions
import {
  EmployerProfileData,
  companyInfoSettingsSchema,
  onlinePresenceSettingsSchema,
  picSettingsSchema,
  ActionResult
} from '@/lib/schemas/employer-profile';
import {
  updateEmployerLogo,
  updateCompanyInfoAction,
  updateOnlinePresenceAction,
  updatePicInfoAction,
} from '@/lib/actions/employer/profile';

// Fallback data for development
const fallbackProfileData: EmployerProfileData = {
  id: '',
  userId: 'dev-user-id',
  namaPerusahaan: '',
  industri: '',
  alamatKantor: '',
  email: 'dev@example.com',
  pic: {
    nama: '',
    nomorTelepon: ''
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Props interface
interface EmployerSettingsClientPageProps {
  initialProfileData?: Partial<EmployerProfileData>;
  userName?: string;
  userEmail?: string;
}

export default function EmployerSettingsClientPage({
  initialProfileData = fallbackProfileData,
  userName = "Developer User",
  userEmail = "dev@example.com",
}: EmployerSettingsClientPageProps) {
  const safeProfileData: EmployerProfileData = {
    ...fallbackProfileData,
    ...initialProfileData,
    pic: {
      ...fallbackProfileData.pic,
      ...(initialProfileData?.pic || {})
    },
    socialMedia: {
      ...(fallbackProfileData.socialMedia || {}),
      ...(initialProfileData?.socialMedia || {})
    }
  };

  const [currentProfileId, setCurrentProfileId] = useState<string>(safeProfileData.id || '');
  
  // State for logo
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    // Use a data URL for the placeholder instead of an external URL
    safeProfileData.logoUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Cpath d='M100,65 C113.8,65 125,76.2 125,90 C125,103.8 113.8,115 100,115 C86.2,115 75,103.8 75,90 C75,76.2 86.2,65 100,65 Z M100,125 C125,125 150,137.5 150,150 L50,150 C50,137.5 75,125 100,125 Z' fill='%23cccccc'/%3E%3C/svg%3E"
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Form submission states
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [isSubmittingOnlinePresence, setIsSubmittingOnlinePresence] = useState(false);
  const [isSubmittingPIC, setIsSubmittingPIC] = useState(false);

  // Effect to update currentProfileId when initialProfileData.id changes
  useEffect(() => {
    if (safeProfileData.id && safeProfileData.id !== currentProfileId) {
      setCurrentProfileId(safeProfileData.id);
    }
  }, [safeProfileData.id, currentProfileId]);

  // Initialize forms with defaultValues from initialProfileData
  const companyForm = useForm<z.infer<typeof companyInfoSettingsSchema>>({
    resolver: zodResolver(companyInfoSettingsSchema),
    defaultValues: {
      namaPerusahaan: safeProfileData.namaPerusahaan || "",
      merekUsaha: safeProfileData.merekUsaha || "",
      industri: safeProfileData.industri || "",
      alamatKantor: safeProfileData.alamatKantor || "",
    },
  });

  const onlinePresenceForm = useForm<z.infer<typeof onlinePresenceSettingsSchema>>({
    resolver: zodResolver(onlinePresenceSettingsSchema),
    defaultValues: {
      website: safeProfileData.website || "",
      instagram: safeProfileData.socialMedia?.instagram || "",
      linkedin: safeProfileData.socialMedia?.linkedin || "",
      facebook: safeProfileData.socialMedia?.facebook || "",
      twitter: safeProfileData.socialMedia?.twitter || "",
      tiktok: safeProfileData.socialMedia?.tiktok || "",
    },
  });

  const picForm = useForm<z.infer<typeof picSettingsSchema>>({
    resolver: zodResolver(picSettingsSchema),
    defaultValues: {
      nama: safeProfileData.pic?.nama || "",
      nomorTelepon: safeProfileData.pic?.nomorTelepon || "",
    },
  });

  // Update forms when initialProfileData changes - fix infinite loop
  useEffect(() => {
    // Create a stringified version of the current form values and profile data for comparison
    const currentCompanyValues = companyForm.getValues();
    const newCompanyValues = {
      namaPerusahaan: safeProfileData.namaPerusahaan || "",
      merekUsaha: safeProfileData.merekUsaha || "",
      industri: safeProfileData.industri || "",
      alamatKantor: safeProfileData.alamatKantor || "",
    };
    
    // Only reset if values actually changed
    if (
      currentCompanyValues.namaPerusahaan !== newCompanyValues.namaPerusahaan ||
      currentCompanyValues.merekUsaha !== newCompanyValues.merekUsaha ||
      currentCompanyValues.industri !== newCompanyValues.industri ||
      currentCompanyValues.alamatKantor !== newCompanyValues.alamatKantor
    ) {
      companyForm.reset(newCompanyValues);
    }
    
    // Do the same for online presence form
    const currentOnlineValues = onlinePresenceForm.getValues();
    const newOnlineValues = {
      website: safeProfileData.website || "",
      instagram: safeProfileData.socialMedia?.instagram || "",
      linkedin: safeProfileData.socialMedia?.linkedin || "",
      facebook: safeProfileData.socialMedia?.facebook || "",
      twitter: safeProfileData.socialMedia?.twitter || "",
      tiktok: safeProfileData.socialMedia?.tiktok || "",
    };
    
    if (
      currentOnlineValues.website !== newOnlineValues.website ||
      currentOnlineValues.instagram !== newOnlineValues.instagram ||
      currentOnlineValues.linkedin !== newOnlineValues.linkedin ||
      currentOnlineValues.facebook !== newOnlineValues.facebook ||
      currentOnlineValues.twitter !== newOnlineValues.twitter ||
      currentOnlineValues.tiktok !== newOnlineValues.tiktok
    ) {
      onlinePresenceForm.reset(newOnlineValues);
    }
    
    // And for PIC form
    const currentPicValues = picForm.getValues();
    const newPicValues = {
      nama: safeProfileData.pic?.nama || "",
      nomorTelepon: safeProfileData.pic?.nomorTelepon || "",
    };
    
    if (
      currentPicValues.nama !== newPicValues.nama ||
      currentPicValues.nomorTelepon !== newPicValues.nomorTelepon
    ) {
      picForm.reset(newPicValues);
    }
    
    // Update logo preview if needed
    if (safeProfileData.logoUrl && safeProfileData.logoUrl !== logoPreview) {
      setLogoPreview(safeProfileData.logoUrl);
    }
  }, [
    safeProfileData.namaPerusahaan,
    safeProfileData.merekUsaha,
    safeProfileData.industri,
    safeProfileData.alamatKantor,
    safeProfileData.website,
    safeProfileData.socialMedia?.instagram,
    safeProfileData.socialMedia?.linkedin,
    safeProfileData.socialMedia?.facebook,
    safeProfileData.socialMedia?.twitter,
    safeProfileData.socialMedia?.tiktok,
    safeProfileData.pic?.nama,
    safeProfileData.pic?.nomorTelepon,
    safeProfileData.logoUrl,
    companyForm,
    onlinePresenceForm,
    picForm,
    logoPreview
  ]);

  // Logo handler functions
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedLogoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!currentProfileId || !selectedLogoFile) {
      toast.error("Silakan simpan informasi perusahaan dan pilih file logo terlebih dahulu.");
      return;
    }

    try {
      setIsUploadingLogo(true);
      
      const formData = new FormData();
      formData.append('logo', selectedLogoFile);
      
      const result = await updateEmployerLogo(formData);
      
      if (result.success) {
        toast.success(result.message);
        // Update the logo preview with the new URL if returned
        if (result.logoUrl) {
          setLogoPreview(result.logoUrl);
        }
        setSelectedLogoFile(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Gagal mengunggah logo. Silakan coba lagi.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Form submission handlers
  const onCompanySubmit = async (data: z.infer<typeof companyInfoSettingsSchema>) => {
    try {
      setIsSubmittingCompany(true);
      
      const result = await updateCompanyInfoAction(data);
      
      if (result.success) {
        toast.success(result.message);
        // Update profile ID if a new profile was created
        if (result.employerId && currentProfileId !== result.employerId) {
          setCurrentProfileId(result.employerId);
        }
      } else {
        toast.error(result.message);
        // Handle field-specific errors if available
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              companyForm.setError(field as any, { 
                type: 'manual', 
                message: messages[0] 
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error submitting company info:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  const onOnlinePresenceSubmit = async (data: z.infer<typeof onlinePresenceSettingsSchema>) => {
    try {
      setIsSubmittingOnlinePresence(true);
      
      const result = await updateOnlinePresenceAction(data);
      
      if (result.success) {
        toast.success(result.message);
        // Update profile ID if a new profile was created
        if (result.employerId && currentProfileId !== result.employerId) {
          setCurrentProfileId(result.employerId);
        }
      } else {
        toast.error(result.message);
        // Handle field-specific errors if available
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              onlinePresenceForm.setError(field as any, { 
                type: 'manual', 
                message: messages[0] 
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error submitting online presence info:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmittingOnlinePresence(false);
    }
  };

  const onPicSubmit = async (data: z.infer<typeof picSettingsSchema>) => {
    try {
      setIsSubmittingPIC(true);
      
      const result = await updatePicInfoAction(data);
      
      if (result.success) {
        toast.success(result.message);
        // Update profile ID if a new profile was created
        if (result.employerId && currentProfileId !== result.employerId) {
          setCurrentProfileId(result.employerId);
        }
      } else {
        toast.error(result.message);
        // Handle field-specific errors if available
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              picForm.setError(field as any, { 
                type: 'manual', 
                message: messages[0] 
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error submitting PIC info:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmittingPIC(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-muted-foreground">
          Kelola informasi akun dan profil perusahaan Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Profile Section */}
        <div className="lg:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>Informasi akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium">{userName}</h3>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="company">Informasi Perusahaan</TabsTrigger>
              <TabsTrigger value="online">Kehadiran Online</TabsTrigger>
              <TabsTrigger value="pic">Penanggung Jawab</TabsTrigger>
            </TabsList>

            {/* Company Information Tab */}
            <TabsContent value="company">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Informasi Dasar Badan Usaha</CardTitle>
                  <CardDescription>
                    Perbarui informasi inti perusahaan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="namaPerusahaan" className="text-sm font-medium">
                        Nama Perusahaan <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="namaPerusahaan"
                        placeholder="PT Kuliner Nusantara Enak"
                        {...companyForm.register("namaPerusahaan")}
                        className={companyForm.formState.errors.namaPerusahaan ? "border-red-500" : ""}
                      />
                      {companyForm.formState.errors.namaPerusahaan && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.namaPerusahaan.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="merekUsaha" className="text-sm font-medium">
                        Merek Usaha <span className="text-gray-500 text-sm">(opsional)</span>
                      </label>
                      <Input
                        id="merekUsaha"
                        placeholder="Kedai Enak"
                        {...companyForm.register("merekUsaha")}
                      />
                      <p className="text-xs text-gray-500">
                        Nama merek yang dikenal oleh publik jika berbeda dengan nama perusahaan
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="industri" className="text-sm font-medium">
                        Industri dan Bidang Usaha <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="industri"
                        placeholder="Restoran / Kuliner"
                        {...companyForm.register("industri")}
                        className={companyForm.formState.errors.industri ? "border-red-500" : ""}
                      />
                      {companyForm.formState.errors.industri && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.industri.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="alamatKantor" className="text-sm font-medium">
                        Alamat Kantor Utama <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="alamatKantor"
                        placeholder="Jl. Contoh No.123, Kota Jakarta"
                        className={`min-h-24 ${companyForm.formState.errors.alamatKantor ? "border-red-500" : ""}`}
                        {...companyForm.register("alamatKantor")}
                      />
                      {companyForm.formState.errors.alamatKantor && (
                        <p className="text-red-500 text-sm">{companyForm.formState.errors.alamatKantor.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto" 
                      disabled={isSubmittingCompany}
                    >
                      {isSubmittingCompany ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Perubahan
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Online Presence Tab */}
            <TabsContent value="online">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Kehadiran Online</CardTitle>
                  <CardDescription>
                    Kelola website dan media sosial perusahaan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onlinePresenceForm.handleSubmit(onOnlinePresenceSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">
                        Website <span className="text-gray-500 text-sm">(opsional)</span>
                      </label>
                      <Input
                        id="website"
                        placeholder="https://www.perusahaananda.com"
                        {...onlinePresenceForm.register("website")}
                        className={onlinePresenceForm.formState.errors.website ? "border-red-500" : ""}
                      />
                      {onlinePresenceForm.formState.errors.website && (
                        <p className="text-red-500 text-sm">{onlinePresenceForm.formState.errors.website.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Masukkan URL lengkap termasuk http:// atau https://
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Media Sosial <span className="text-gray-500 text-sm">(opsional)</span></h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Tambahkan profil media sosial perusahaan Anda untuk meningkatkan visibilitas
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded bg-pink-100 flex items-center justify-center">
                            <span className="text-pink-600 text-xs font-bold">IG</span>
                          </div>
                          <Input
                            id="instagram"
                            placeholder="username_instagram"
                            {...onlinePresenceForm.register("instagram")}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">LI</span>
                          </div>
                          <Input
                            id="linkedin"
                            placeholder="nama-perusahaan"
                            {...onlinePresenceForm.register("linkedin")}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">FB</span>
                          </div>
                          <Input
                            id="facebook"
                            placeholder="namahalaman"
                            {...onlinePresenceForm.register("facebook")}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">TW</span>
                          </div>
                          <Input
                            id="twitter"
                            placeholder="username_twitter"
                            {...onlinePresenceForm.register("twitter")}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded bg-black flex items-center justify-center">
                            <span className="text-white text-xs font-bold">TT</span>
                          </div>
                          <Input
                            id="tiktok"
                            placeholder="username_tiktok"
                            {...onlinePresenceForm.register("tiktok")}
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto mt-4" 
                      disabled={isSubmittingOnlinePresence}
                    >
                      {isSubmittingOnlinePresence ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Perubahan
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PIC Tab */}
            <TabsContent value="pic">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Penanggung Jawab (PIC)</CardTitle>
                  <CardDescription>
                    Informasi kontak utama untuk komunikasi dengan perusahaan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={picForm.handleSubmit(onPicSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="nama" className="text-sm font-medium">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="nama"
                        placeholder="Nama lengkap penanggung jawab"
                        {...picForm.register("nama")}
                        className={picForm.formState.errors.nama ? "border-red-500" : ""}
                      />
                      {picForm.formState.errors.nama && (
                        <p className="text-red-500 text-sm">{picForm.formState.errors.nama.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="nomorTelepon" className="text-sm font-medium">
                        Nomor Telepon <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="nomorTelepon"
                        placeholder="08123456789"
                        {...picForm.register("nomorTelepon")}
                        className={picForm.formState.errors.nomorTelepon ? "border-red-500" : ""}
                      />
                      {picForm.formState.errors.nomorTelepon && (
                        <p className="text-red-500 text-sm">{picForm.formState.errors.nomorTelepon.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Nomor telepon aktif yang dapat dihubungi (format: 08xxxxxxxxxx)
                      </p>
                    </div>

                    <Alert className="mt-4 bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-800">
                        Informasi PIC hanya digunakan untuk keperluan komunikasi internal dan tidak akan ditampilkan secara publik.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto mt-4" 
                      disabled={isSubmittingPIC}
                    >
                      {isSubmittingPIC ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Perubahan
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 