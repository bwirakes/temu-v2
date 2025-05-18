"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, User } from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import Image from "next/image";

// Mock user data - in a real app, this would come from an API or context
const userData = {
  name: "John Doe",
  email: "john.doe@example.com",
};

// Mock company data - in a real app, this would come from an API or context
const companyData = {
  namaPerusahaan: "PT Example Indonesia",
  merekUsaha: "Example",
  industri: "Teknologi",
  alamatKantor: "Jl. Contoh No. 123, Jakarta Selatan",
  website: "https://example.com",
  socialMedia: {
    instagram: "exampleid",
    linkedin: "example-indonesia",
    facebook: "Example Indonesia",
    twitter: "exampleid",
    tiktok: "exampleid",
  },
  pic: {
    nama: "Jane Smith",
    nomorTelepon: "081234567890",
  },
  logoUrl: "https://via.placeholder.com/150",
};

// Validation schemas
const informasiPerusahaanSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan wajib diisi"),
  merekUsaha: z.string().optional(),
  industri: z.string().min(1, "Industri wajib diisi"),
  alamatKantor: z.string().min(1, "Alamat kantor wajib diisi"),
});

const kehadiranOnlineSchema = z.object({
  website: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
});

const picSchema = z.object({
  nama: z.string().min(1, "Nama PIC wajib diisi"),
  nomorTelepon: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor telepon Indonesia tidak valid"
    ),
});

export default function EmployerSettingsPage() {
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(companyData.logoUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for company information
  const companyForm = useForm({
    resolver: zodResolver(informasiPerusahaanSchema),
    defaultValues: {
      namaPerusahaan: companyData.namaPerusahaan,
      merekUsaha: companyData.merekUsaha,
      industri: companyData.industri,
      alamatKantor: companyData.alamatKantor,
    },
  });

  // Form for online presence
  const onlinePresenceForm = useForm({
    resolver: zodResolver(kehadiranOnlineSchema),
    defaultValues: {
      website: companyData.website,
      instagram: companyData.socialMedia.instagram,
      linkedin: companyData.socialMedia.linkedin,
      facebook: companyData.socialMedia.facebook,
      twitter: companyData.socialMedia.twitter,
      tiktok: companyData.socialMedia.tiktok,
    },
  });

  // Form for PIC information
  const picForm = useForm({
    resolver: zodResolver(picSchema),
    defaultValues: {
      nama: companyData.pic.nama,
      nomorTelepon: companyData.pic.nomorTelepon,
    },
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

  const handleCompanySubmit = companyForm.handleSubmit((data) => {
    setIsSubmitting(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Perubahan disimpan",
        description: "Informasi perusahaan berhasil diperbarui.",
      });
    }, 1000);
  });

  const handleOnlinePresenceSubmit = onlinePresenceForm.handleSubmit((data) => {
    setIsSubmitting(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Perubahan disimpan",
        description: "Informasi kehadiran online berhasil diperbarui.",
      });
    }, 1000);
  });

  const handlePicSubmit = picForm.handleSubmit((data) => {
    setIsSubmitting(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Perubahan disimpan",
        description: "Informasi PIC berhasil diperbarui.",
      });
    }, 1000);
  });

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
                <h3 className="text-lg font-medium">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
                <Button variant="outline" className="mt-4 w-full">
                  Ubah Kata Sandi
                </Button>
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
                  <form onSubmit={handleCompanySubmit} className="space-y-4">
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
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
                  <CardTitle>Kehadiran Online dan Identitas Merek</CardTitle>
                  <CardDescription>
                    Perbarui informasi kehadiran online dan identitas merek perusahaan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOnlinePresenceSubmit} className="space-y-6">
                    {/* Website */}
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">
                        Alamat Website Resmi Perusahaan
                      </label>
                      <Input
                        id="website"
                        placeholder="https://perusahaan-anda.com"
                        {...onlinePresenceForm.register("website")}
                        className={onlinePresenceForm.formState.errors.website ? "border-red-500" : ""}
                      />
                      {onlinePresenceForm.formState.errors.website && (
                        <p className="text-red-500 text-sm">{onlinePresenceForm.formState.errors.website.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Harap sertakan http:// atau https:// di awal URL
                      </p>
                    </div>

                    <Separator />

                    {/* Media Sosial */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-700">Media Sosial Perusahaan</h3>
                      
                      <div className="space-y-2">
                        <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                            @
                          </span>
                          <Input
                            id="instagram"
                            placeholder="nama_perusahaan"
                            {...onlinePresenceForm.register("instagram")}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                            linkedin.com/company/
                          </span>
                          <Input
                            id="linkedin"
                            placeholder="perusahaan-anda"
                            {...onlinePresenceForm.register("linkedin")}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
                          <Input
                            id="facebook"
                            placeholder="Nama Halaman Facebook"
                            {...onlinePresenceForm.register("facebook")}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="twitter" className="text-sm font-medium">Twitter/X</label>
                          <div className="flex items-center">
                            <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                              @
                            </span>
                            <Input
                              id="twitter"
                              placeholder="nama_perusahaan"
                              {...onlinePresenceForm.register("twitter")}
                              className="rounded-l-none"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="tiktok" className="text-sm font-medium">TikTok</label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                            @
                          </span>
                          <Input
                            id="tiktok"
                            placeholder="nama_perusahaan"
                            {...onlinePresenceForm.register("tiktok")}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Logo Perusahaan */}
                    <div className="space-y-4">
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

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
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
                    Perbarui informasi kontak penanggung jawab untuk keperluan administrasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePicSubmit} className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        Data PIC yang Anda berikan di bawah ini tidak akan kami tampilkan atau berikan 
                        kepada Pencari Kerja dan hanya digunakan untuk komunikasi antara platform kami 
                        dengan perusahaan Anda.
                      </AlertDescription>
                    </Alert>

                    {/* Nama PIC */}
                    <div className="space-y-2">
                      <label htmlFor="nama" className="text-sm font-medium">
                        Nama Lengkap PIC <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="nama"
                        placeholder="Masukkan nama lengkap penanggung jawab"
                        {...picForm.register("nama")}
                        className={picForm.formState.errors.nama ? "border-red-500" : ""}
                      />
                      {picForm.formState.errors.nama && (
                        <p className="text-red-500 text-sm">{picForm.formState.errors.nama.message}</p>
                      )}
                    </div>

                    {/* Nomor HP PIC */}
                    <div className="space-y-2">
                      <label htmlFor="nomorTelepon" className="text-sm font-medium">
                        Nomor HP PIC yang Aktif <span className="text-red-500">*</span>
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
                        Format: 08XXXXXXXXXX, contoh: 081234567890
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
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
