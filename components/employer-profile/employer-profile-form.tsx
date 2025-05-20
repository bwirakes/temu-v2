"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Link,
  Mail,
  MapPin,
  Phone,
  User,
  Briefcase,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Upload,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { 
  updateEmployerProfile, 
  updateEmployerLogo,
  createEmployerProfileIfNotExists 
} from "@/lib/actions/employer/profile";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EmployerProfileData } from "@/lib/schemas/employer-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define form schema using Zod
const formSchema = z.object({
  namaPerusahaan: z.string().min(1, "Nama perusahaan harus diisi"),
  merekUsaha: z.string().optional(),
  industri: z.string().min(1, "Industri harus diisi"),
  alamatKantor: z.string().min(1, "Alamat kantor harus diisi"),
  email: z.string().email("Format email tidak valid"),
  website: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  
  // Social media
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  
  // Contact person
  picNama: z.string().min(1, "Nama PIC harus diisi"),
  picNomorTelepon: z.string().min(1, "Nomor telepon PIC harus diisi"),
});

type FormValues = z.infer<typeof formSchema>;

interface EmployerProfileFormProps {
  initialData: EmployerProfileData | null;
}

export default function EmployerProfileForm({ initialData }: EmployerProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [isNewProfile, setIsNewProfile] = useState<boolean>(initialData?.id === '');
  const [logoError, setLogoError] = useState<boolean>(false);
  const router = useRouter();

  // Initialize form with initial data
  const defaultValues: Partial<FormValues> = {
    namaPerusahaan: initialData?.namaPerusahaan || "",
    merekUsaha: initialData?.merekUsaha || "",
    industri: initialData?.industri || "",
    alamatKantor: initialData?.alamatKantor || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    
    // Social media
    instagram: initialData?.socialMedia?.instagram || "",
    linkedin: initialData?.socialMedia?.linkedin || "",
    facebook: initialData?.socialMedia?.facebook || "",
    twitter: initialData?.socialMedia?.twitter || "",
    tiktok: initialData?.socialMedia?.tiktok || "",
    
    // Contact person
    picNama: initialData?.pic?.nama || "",
    picNomorTelepon: initialData?.pic?.nomorTelepon || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setSelectedLogo(file);
      setLogoError(false);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get safe logo URL that won't cause image loading errors
  const getSafePlaceholderUrl = (companyName: string = 'Company') => {
    const encodedName = encodeURIComponent(companyName);
    return `https://placehold.co/400x400/e2e8f0/64748b?text=${encodedName}`;
  };

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!selectedLogo) {
      toast.error("Pilih file logo terlebih dahulu");
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append("logo", selectedLogo);
      
      const result = await updateEmployerLogo(formData);
      
      if (result.success) {
        toast.success(result.message);
        if (result.logoUrl) {
          setLogoPreview(result.logoUrl);
        }
        setSelectedLogo(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Gagal mengunggah logo");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit form
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      
      // Basic company info
      formData.append("namaPerusahaan", data.namaPerusahaan);
      formData.append("merekUsaha", data.merekUsaha || "");
      formData.append("industri", data.industri);
      formData.append("alamatKantor", data.alamatKantor);
      formData.append("email", data.email);
      formData.append("website", data.website || "");
      
      // Social media
      formData.append("instagram", data.instagram || "");
      formData.append("linkedin", data.linkedin || "");
      formData.append("facebook", data.facebook || "");
      formData.append("twitter", data.twitter || "");
      formData.append("tiktok", data.tiktok || "");
      
      // Contact person
      formData.append("picNama", data.picNama);
      formData.append("picNomorTelepon", data.picNomorTelepon);
      
      // If this is a new profile, create it first
      if (isNewProfile) {
        const createResult = await createEmployerProfileIfNotExists(formData);
        
        if (createResult.success) {
          toast.success("Profile created successfully.");
          setIsNewProfile(false);
          router.refresh();
        } else {
          toast.error(createResult.message);
          
          // If there are validation errors, log them
          console.error("Validation errors:", createResult.message);
        }
      } else {
        // Update existing profile
        const result = await updateEmployerProfile(formData);
        
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
          
          // If there are validation errors, log them
          if (result.errors) {
            console.error("Validation errors:", result.errors);
          }
        }
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Gagal menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    reset(defaultValues);
  };

  return (
    <div>
      {isNewProfile && (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Profile Setup Required</AlertTitle>
          <AlertDescription className="text-yellow-700">
            It seems this is your first time accessing the employer profile page. 
            Please fill out the required information below to complete your profile setup.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="company-info" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="company-info">Company Information</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
          <TabsTrigger value="logo">Company Logo</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <TabsContent value="company-info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="namaPerusahaan">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="namaPerusahaan"
                      placeholder="Enter company name"
                      {...register("namaPerusahaan")}
                      className={errors.namaPerusahaan ? "border-red-500" : ""}
                    />
                    {errors.namaPerusahaan && (
                      <p className="text-sm text-red-500">{errors.namaPerusahaan.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="merekUsaha">Business Brand</Label>
                    <Input
                      id="merekUsaha"
                      placeholder="Enter business brand (if different from company name)"
                      {...register("merekUsaha")}
                      className={errors.merekUsaha ? "border-red-500" : ""}
                    />
                    {errors.merekUsaha && (
                      <p className="text-sm text-red-500">{errors.merekUsaha.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industri">Industry <span className="text-red-500">*</span></Label>
                  <Input
                    id="industri"
                    placeholder="Enter company industry"
                    {...register("industri")}
                    className={errors.industri ? "border-red-500" : ""}
                  />
                  {errors.industri && (
                    <p className="text-sm text-red-500">{errors.industri.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alamatKantor">Office Address <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="alamatKantor"
                    placeholder="Enter office address"
                    {...register("alamatKantor")}
                    className={`min-h-[100px] ${errors.alamatKantor ? "border-red-500" : ""}`}
                  />
                  {errors.alamatKantor && (
                    <p className="text-sm text-red-500">{errors.alamatKantor.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter company email"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="Enter company website"
                      {...register("website")}
                      className={errors.website ? "border-red-500" : ""}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500">{errors.website.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium mb-4">Person In Charge (PIC)</h3>
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="picNama">PIC Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="picNama"
                        placeholder="Enter PIC name"
                        {...register("picNama")}
                        className={errors.picNama ? "border-red-500" : ""}
                      />
                      {errors.picNama && (
                        <p className="text-sm text-red-500">{errors.picNama.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="picNomorTelepon">PIC Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="picNomorTelepon"
                        placeholder="Enter PIC phone number"
                        {...register("picNomorTelepon")}
                        className={errors.picNomorTelepon ? "border-red-500" : ""}
                      />
                      {errors.picNomorTelepon && (
                        <p className="text-sm text-red-500">{errors.picNomorTelepon.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social-media">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  <span>Social Media</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </Label>
                    <Input
                      id="instagram"
                      placeholder="Instagram username or URL"
                      {...register("instagram")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="LinkedIn profile URL"
                      {...register("linkedin")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                    </Label>
                    <Input
                      id="facebook"
                      placeholder="Facebook page URL"
                      {...register("facebook")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="Twitter handle or URL"
                      {...register("twitter")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="flex items-center gap-2">
                      <span className="ml-1">TikTok</span>
                    </Label>
                    <Input
                      id="tiktok"
                      placeholder="TikTok username or URL"
                      {...register("tiktok")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>Company Logo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
                  <div className="w-40 h-40 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {logoPreview && !logoError ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={logoPreview}
                          alt={defaultValues.namaPerusahaan || "Company Logo"}
                          fill
                          className="object-contain"
                          onError={() => setLogoError(true)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Building className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo">Upload Logo</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500">
                        Recommended size: 500x500 pixels, max 2MB. Supported formats: JPG, PNG
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleLogoUpload}
                      disabled={!selectedLogo || isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      <span>Upload Logo</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!isDirty || isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isNewProfile ? "Create Profile" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
} 
