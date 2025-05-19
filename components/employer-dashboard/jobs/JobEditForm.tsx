"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle, XCircle, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// Define education options
const EDUCATION_OPTIONS = [
  { value: "SMP", label: "SMP", showJurusan: false },
  { value: "SMK", label: "SMK", showJurusan: true },
  { value: "SMA", label: "SMA", showJurusan: true },
  { value: "SMA/SMK/Sederajat", label: "SMA/SMK/Sederajat", showJurusan: true },
  { value: "D1", label: "D1", showJurusan: true },
  { value: "D2", label: "D2", showJurusan: true },
  { value: "D3", label: "D3", showJurusan: true },
  { value: "D4", label: "D4", showJurusan: true },
  { value: "S1", label: "S1", showJurusan: true },
  { value: "S2", label: "S2", showJurusan: true },
  { value: "S3", label: "S3", showJurusan: true }
];

// Define a constant for "no requirements" option
const NO_REQUIREMENTS = "NO_REQUIREMENTS";

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

// Define the schema for the form
const jobSchema = z.object({
  // Basic Information
  jobTitle: z.string().min(1, "Jenis pekerjaan wajib diisi"),
  numberOfPositions: z.number().min(1, "Jumlah tenaga kerja wajib diisi"),
  
  // Requirements
  gender: z.enum(["ANY", "MALE", "FEMALE"]),
  minWorkExperience: z.number().min(0).optional(),
  // Retained fields
  lastEducation: z.string().optional(),
  jurusan: z.string().optional(),
  requiredCompetencies: z.string().optional(), // Will be split into array when submitting
  acceptedDisabilityTypes: z.string().optional(), // Will be split into array when submitting
  numberOfDisabilityPositions: z.number().min(0).default(0),
  suitableForDisability: z.boolean().default(false),
  
  // Company Expectations - only keeping age range
  ageRangeMin: z.number().min(15, "Minimal umur 15 tahun"),
  ageRangeMax: z.number().max(100, "Maksimal umur 100 tahun"),
  
  // Additional Information
  // contractType field removed
});

type JobFormValues = z.infer<typeof jobSchema>;

interface WorkLocation {
  id?: string;
  address: string;
  city: string;
  province: string;
  isRemote: boolean;
}

interface JobEditFormProps {
  jobId: string;
  onSave: () => void;
  onCancel: () => void;
}

// Custom label component to fix type issues
const LabelText = ({ htmlFor, children, required }: { 
  htmlFor: string; 
  children: React.ReactNode;
  required?: boolean;
}) => (
  <Label htmlFor={htmlFor} className="flex items-center gap-1">
    <span>{children}</span>
    {required && <span className="text-red-500">*</span>}
    {!required && children !== "Lokasi Kerja" && <span className="text-gray-500 text-xs">(opsional)</span>}
  </Label>
);

export default function JobEditForm({ jobId, onSave, onCancel }: JobEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([
    { address: "", city: "", province: "", isRemote: false }
  ]);
  const [showWorkLocations, setShowWorkLocations] = useState(true);
  const [customDisabilityType, setCustomDisabilityType] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobTitle: "",
      numberOfPositions: 1,
      gender: "ANY",
      minWorkExperience: 0,
      // New fields defaults
      lastEducation: undefined,
      jurusan: undefined,
      requiredCompetencies: "",
      acceptedDisabilityTypes: "",
      numberOfDisabilityPositions: 0,
      suitableForDisability: false,
      // Existing fields
      ageRangeMin: 18,
      ageRangeMax: 55,
    },
  });

  // Fetch job data and work locations from API
  useEffect(() => {
    const fetchJobData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/employer/jobs/${jobId}/edit`);
        
        if (!jobResponse.ok) {
          const error = await jobResponse.json();
          throw new Error(error.error || 'Failed to fetch job details');
        }
        
        const jobData = await jobResponse.json();
        
        if (!jobData.job) {
          throw new Error('No job data received');
        }
        
        const job = jobData.job;
        
        // Check if job has disability types or positions
        const hasDisabilityInfo = 
          (job.acceptedDisabilityTypes && job.acceptedDisabilityTypes.length > 0) || 
          (job.numberOfDisabilityPositions && job.numberOfDisabilityPositions > 0);
        
        // Format job data for the form
        form.reset({
          jobTitle: job.jobTitle || "",
          numberOfPositions: job.numberOfPositions || 1,
          gender: job.additionalRequirements?.gender === "MALE" ? "MALE" : 
                 job.additionalRequirements?.gender === "FEMALE" ? "FEMALE" : "ANY",
          minWorkExperience: job.minWorkExperience || 0,
          // New fields
          lastEducation: job.lastEducation || NO_REQUIREMENTS,
          jurusan: job.jurusan || undefined,
          requiredCompetencies: job.requiredCompetencies || "",
          acceptedDisabilityTypes: Array.isArray(job.acceptedDisabilityTypes) 
            ? job.acceptedDisabilityTypes.join("\n") 
            : "",
          numberOfDisabilityPositions: job.numberOfDisabilityPositions || 0,
          suitableForDisability: hasDisabilityInfo,
          // Existing fields
          ageRangeMin: job.expectations?.ageRange?.min || 18,
          ageRangeMax: job.expectations?.ageRange?.max || 55,
        });
        
        // Fetch work locations
        const locationsResponse = await fetch(`/api/employer/jobs/${jobId}/locations`);
        
        if (!locationsResponse.ok) {
          const error = await locationsResponse.json();
          throw new Error(error.error || 'Failed to fetch work locations');
        }
        
        const locationsData = await locationsResponse.json();
        
        if (locationsData.locations && locationsData.locations.length > 0) {
          setWorkLocations(locationsData.locations.map((loc: any) => ({
            id: loc.id,
            address: loc.address || "",
            city: loc.city || "",
            province: loc.province || "",
            isRemote: loc.isRemote || false
          })));
          setShowWorkLocations(true);
        } else {
          setShowWorkLocations(false);
        }
      } catch (err: any) {
        console.error('Error fetching job data:', err);
        setError(err.message || 'Error fetching job data');
        toast.error('Error fetching job data', {
          description: err.message || 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchJobData();
    }
  }, [jobId, form]);

  const addLocation = () => {
    setWorkLocations([
      ...workLocations,
      { address: "", city: "", province: "", isRemote: false }
    ]);
  };

  const removeLocation = (index: number) => {
    if (workLocations.length > 1) {
      setWorkLocations(workLocations.filter((_, i) => i !== index));
    }
  };

  const handleLocationChange = (index: number, field: keyof WorkLocation, value: string | boolean) => {
    const updatedLocations = [...workLocations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value
    };
    setWorkLocations(updatedLocations);
  };

  const addDisabilityType = () => {
    if (customDisabilityType.trim() === "") return;
    
    const currentTypes = form.getValues("acceptedDisabilityTypes") || "";
    const typesArray = currentTypes.split("\n").filter(Boolean);
    
    if (!typesArray.includes(customDisabilityType)) {
      const updatedTypes = [...typesArray, customDisabilityType].join("\n");
      form.setValue("acceptedDisabilityTypes", updatedTypes);
      setCustomDisabilityType("");
    }
  };

  const toggleDisabilityType = (type: string) => {
    const currentTypes = form.getValues("acceptedDisabilityTypes") || "";
    const typesArray = currentTypes.split("\n").filter(Boolean);
    
    let updatedTypes;
    if (typesArray.includes(type)) {
      updatedTypes = typesArray.filter(t => t !== type);
    } else {
      updatedTypes = [...typesArray, type];
    }
    
    form.setValue("acceptedDisabilityTypes", updatedTypes.join("\n"));
  };

  const removeDisabilityType = (type: string) => {
    const currentTypes = form.getValues("acceptedDisabilityTypes") || "";
    const typesArray = currentTypes.split("\n").filter(Boolean);
    const updatedTypes = typesArray.filter(t => t !== type).join("\n");
    form.setValue("acceptedDisabilityTypes", updatedTypes);
  };

  const onSubmit = async (data: JobFormValues) => {
    setIsSaving(true);
    
    try {
      // Only validate work locations if the section is shown
      if (showWorkLocations) {
        const hasValidLocations = workLocations.every(loc => loc.city && loc.province);
        
        if (!hasValidLocations) {
          toast.error("Validasi gagal", {
            description: "Setiap lokasi kerja harus memiliki kota dan provinsi."
          });
          setIsSaving(false);
          return;
        }
      }

      // Format data for the API
      const jobData = {
        jobTitle: data.jobTitle,
        minWorkExperience: data.minWorkExperience,
        numberOfPositions: data.numberOfPositions,
        // New fields - don't send NO_REQUIREMENTS to API
        lastEducation: data.lastEducation === NO_REQUIREMENTS ? undefined : data.lastEducation,
        jurusan: data.jurusan,
        requiredCompetencies: data.requiredCompetencies || '',
        acceptedDisabilityTypes: data.suitableForDisability && data.acceptedDisabilityTypes ? 
          data.acceptedDisabilityTypes.split('\n').filter(Boolean) : [],
        numberOfDisabilityPositions: data.suitableForDisability ? data.numberOfDisabilityPositions : 0,
        // Only include age range in expectations
        expectations: {
          ageRange: {
            min: data.ageRangeMin,
            max: data.ageRangeMax
          }
        },
        // Only include gender field in additionalRequirements
        additionalRequirements: {
          gender: data.gender,
        }
      };

      // Update job data
      const updateResponse = await fetch(`/api/employer/jobs/${jobId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || 'Failed to update job');
      }

      // Delete existing locations
      await fetch(`/api/employer/jobs/${jobId}/locations`, {
        method: 'DELETE'
      });

      // Add new locations only if the section is shown
      if (showWorkLocations) {
        // Then add each location
        for (const location of workLocations) {
          if (location.city && location.province) {
            await fetch(`/api/employer/jobs/${jobId}/locations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                city: location.city,
                province: location.province,
                isRemote: location.isRemote,
                address: location.address
              })
            });
          }
        }
      }

      toast.success("Perubahan disimpan", {
        description: "Lowongan pekerjaan berhasil diperbarui."
      });
      
      onSave();
    } catch (err: any) {
      console.error('Error updating job:', err);
      toast.error('Error updating job', {
        description: err.message || 'Please try again later',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data lowongan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Job Data</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push('/employer/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>
            Informasi dasar tentang lowongan pekerjaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <LabelText htmlFor="jobTitle" required>Jenis Pekerjaan</LabelText>
            <Input
              id="jobTitle"
              placeholder="Contoh: Senior Frontend Developer"
              {...form.register("jobTitle")}
              className={form.formState.errors.jobTitle ? "border-red-500" : ""}
            />
            {form.formState.errors.jobTitle && (
              <p className="text-sm text-red-500">{form.formState.errors.jobTitle.message}</p>
            )}
          </div>

          {/* Number of Positions */}
          <div className="space-y-2">
            <LabelText htmlFor="numberOfPositions" required>Jumlah Tenaga Kerja yang Dicari</LabelText>
            <Input
              id="numberOfPositions"
              type="number"
              min="1"
              {...form.register("numberOfPositions", { valueAsNumber: true })}
              className={form.formState.errors.numberOfPositions ? "border-red-500" : ""}
            />
            {form.formState.errors.numberOfPositions && (
              <p className="text-sm text-red-500">{form.formState.errors.numberOfPositions.message}</p>
            )}
          </div>

          {/* Work Location Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="showWorkLocations"
              checked={showWorkLocations}
              onCheckedChange={(checked) => setShowWorkLocations(!!checked)}
            />
            <Label htmlFor="showWorkLocations" className="font-medium">
              Tambahkan Lokasi Kerja
            </Label>
          </div>

          {/* Work Locations - Only shown if toggle is enabled */}
          {showWorkLocations && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-1">
                  <span>Lokasi Kerja</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLocation}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambah Lokasi</span>
                </Button>
              </div>

              {workLocations.map((location, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Lokasi {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(index)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Hapus lokasi</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`isRemote-${index}`}
                      checked={location.isRemote}
                      onCheckedChange={(checked) => 
                        handleLocationChange(index, "isRemote", Boolean(checked))
                      }
                    />
                    <Label htmlFor={`isRemote-${index}`}>
                      Pekerjaan ini dapat dilakukan secara remote
                    </Label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`address-${index}`}>Alamat</Label>
                      <Input
                        id={`address-${index}`}
                        value={location.address}
                        onChange={(e) => handleLocationChange(index, "address", e.target.value)}
                        placeholder="Jl. Contoh No. 123"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`city-${index}`} className="flex items-center gap-1">
                          <span>Kota</span>
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`city-${index}`}
                          value={location.city}
                          onChange={(e) => handleLocationChange(index, "city", e.target.value)}
                          placeholder="Jakarta"
                          className={!location.city ? "border-red-500" : ""}
                        />
                        {!location.city && (
                          <p className="text-sm text-red-500">Kota wajib diisi</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`province-${index}`} className="flex items-center gap-1">
                          <span>Provinsi</span>
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`province-${index}`}
                          value={location.province}
                          onChange={(e) => handleLocationChange(index, "province", e.target.value)}
                          placeholder="DKI Jakarta"
                          className={!location.province ? "border-red-500" : ""}
                        />
                        {!location.province && (
                          <p className="text-sm text-red-500">Provinsi wajib diisi</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Persyaratan</CardTitle>
          <CardDescription>
            Persyaratan yang harus dipenuhi oleh pelamar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gender */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <span>Jenis Kelamin</span>
              <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={form.watch("gender")}
              onValueChange={(value) => form.setValue("gender", value as "ANY" | "MALE" | "FEMALE")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ANY" id="gender-any" />
                <Label htmlFor="gender-any">Semua Jenis Kelamin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MALE" id="gender-male" />
                <Label htmlFor="gender-male">Laki-laki</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FEMALE" id="gender-female" />
                <Label htmlFor="gender-female">Perempuan</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Minimum Work Experience */}
          <div className="space-y-2">
            <LabelText htmlFor="minWorkExperience">Minimum Pengalaman Kerja</LabelText>
            <div className="flex items-center space-x-2">
              <Input
                id="minWorkExperience"
                type="number"
                min="0"
                className="w-24"
                {...form.register("minWorkExperience", { valueAsNumber: true })}
              />
              <span>tahun</span>
            </div>
            <p className="text-xs text-gray-500">
              Masukkan 0 jika tidak ada persyaratan pengalaman kerja
            </p>
          </div>

          {/* Last Education */}
          <div className="space-y-2">
            <LabelText htmlFor="lastEducation">Pendidikan Terakhir</LabelText>
            <Select
              value={form.watch("lastEducation") || NO_REQUIREMENTS}
              onValueChange={(value) => {
                form.setValue("lastEducation", value);
                
                // Clear jurusan if not applicable for this education level or if "No Requirements" is selected
                const educationOption = EDUCATION_OPTIONS.find(option => option.value === value);
                if (!educationOption?.showJurusan || value === NO_REQUIREMENTS) {
                  form.setValue("jurusan", "");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pendidikan Minimal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_REQUIREMENTS}>Tidak Ada Persyaratan</SelectItem>
                {EDUCATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Pendidikan minimum yang diperlukan untuk posisi ini
            </p>
          </div>
          
          {/* Jurusan field - only shown for applicable education levels */}
          {(() => {
            const currentEducation = form.watch("lastEducation");
            // Don't show jurusan if education is NO_REQUIREMENTS
            if (currentEducation === NO_REQUIREMENTS) return null;
            
            const educationOption = EDUCATION_OPTIONS.find(option => option.value === currentEducation);
            if (educationOption?.showJurusan) {
              return (
                <div className="space-y-2">
                  <LabelText htmlFor="jurusan">Jurusan</LabelText>
                  <Input
                    id="jurusan"
                    placeholder="Contoh: Teknik Informatika, Manajemen Bisnis"
                    {...form.register("jurusan")}
                  />
                  <p className="text-xs text-gray-500">
                    Jurusan yang dibutuhkan untuk posisi ini (opsional)
                  </p>
                </div>
              );
            }
            return null;
          })()}
          
          {/* Required Competencies */}
          <div className="space-y-2">
            <LabelText htmlFor="requiredCompetencies">Kompetensi yang Dibutuhkan</LabelText>
            <Textarea
              id="requiredCompetencies"
              placeholder="Contoh:
Komunikasi efektif
Pemecahan masalah
Kerjasama tim"
              className="h-24"
              {...form.register("requiredCompetencies")}
            />
            <p className="text-xs text-gray-500">
              Tuliskan setiap kompetensi pada baris terpisah
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Expectations - Only Age Range */}
      <Card>
        <CardHeader>
          <CardTitle>Harapan Perusahaan</CardTitle>
          <CardDescription>
            Harapan perusahaan terhadap pelamar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Age Range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <span>Harapan Umur</span>
              <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageRangeMin">Minimal</Label>
                <Input
                  id="ageRangeMin"
                  type="number"
                  min="15"
                  {...form.register("ageRangeMin", { valueAsNumber: true })}
                  className={form.formState.errors.ageRangeMin ? "border-red-500" : ""}
                />
                {form.formState.errors.ageRangeMin && (
                  <p className="text-sm text-red-500">{form.formState.errors.ageRangeMin.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ageRangeMax">Maksimal</Label>
                <Input
                  id="ageRangeMax"
                  type="number"
                  min="15"
                  {...form.register("ageRangeMax", { valueAsNumber: true })}
                  className={form.formState.errors.ageRangeMax ? "border-red-500" : ""}
                />
                {form.formState.errors.ageRangeMax && (
                  <p className="text-sm text-red-500">{form.formState.errors.ageRangeMax.message}</p>
                )}
              </div>
            </div>
            {form.watch("ageRangeMin") >= form.watch("ageRangeMax") && (
              <p className="text-sm text-red-500">Minimal umur harus lebih kecil dari maksimal umur</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
          <CardDescription>
            Informasi tambahan tentang lowongan pekerjaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Suitable for Disability */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <Checkbox
                id="suitableForDisability"
                checked={form.watch("suitableForDisability")}
                onCheckedChange={(checked) => {
                  form.setValue("suitableForDisability", !!checked);
                  if (!checked) {
                    form.setValue("acceptedDisabilityTypes", "");
                    form.setValue("numberOfDisabilityPositions", 0);
                  }
                }}
              />
            </div>
            <div className="ml-3 text-sm">
              <Label htmlFor="suitableForDisability" className="font-medium text-gray-700">
                Pekerjaan dapat dilakukan oleh rekan dengan Disabilitas
              </Label>
              <p className="text-muted-foreground">
                Centang jika posisi ini cocok untuk kandidat dengan disabilitas
              </p>
            </div>
          </div>

          {/* Disability-specific fields (only shown when suitableForDisability is checked) */}
          {form.watch("suitableForDisability") && (
            <div className="border border-blue-200 bg-blue-50 p-4 rounded-md space-y-4">
              <h3 className="font-medium text-blue-800">Informasi Disabilitas</h3>
              
              {/* Accepted Disability Types */}
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Jenis Disabilitas yang Cocok <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Pilih satu atau lebih jenis disabilitas yang cocok untuk posisi ini
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {DISABILITY_TYPES.map((type) => (
                    <div key={type} className="flex items-center">
                      <Checkbox
                        id={`disability-${type}`}
                        checked={(form.watch("acceptedDisabilityTypes") || "").includes(type)}
                        onCheckedChange={() => toggleDisabilityType(type)}
                        className="mr-2"
                      />
                      <Label htmlFor={`disability-${type}`} className="text-sm text-gray-700">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {/* Custom disability type input */}
                <div className="mt-3 flex items-center">
                  <Input
                    type="text"
                    value={customDisabilityType}
                    onChange={(e) => setCustomDisabilityType(e.target.value)}
                    placeholder="Jenis disabilitas lainnya"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDisabilityType}
                    className="ml-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    <span>Tambah</span>
                  </Button>
                </div>
                
                {/* Display selected custom disability types */}
                {form.watch("acceptedDisabilityTypes") && (
                  <div className="mt-2">
                    {(form.watch("acceptedDisabilityTypes") || "")
                      .split('\n')
                      .filter(Boolean)
                      .filter(type => !DISABILITY_TYPES.includes(type))
                      .length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Jenis disabilitas tambahan:</p>
                          <div className="flex flex-wrap gap-2">
                            {(form.watch("acceptedDisabilityTypes") || "")
                              .split('\n')
                              .filter(Boolean)
                              .filter(type => !DISABILITY_TYPES.includes(type))
                              .map(type => (
                                <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {type}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeDisabilityType(type)}
                                    className="ml-1 h-4 w-4 p-0 text-blue-500 hover:text-blue-700"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
              
              {/* Number of Disability Positions */}
              <div className="space-y-2">
                <LabelText htmlFor="numberOfDisabilityPositions" required>Jumlah Posisi untuk Rekan Disabilitas</LabelText>
                <Input
                  id="numberOfDisabilityPositions"
                  type="number"
                  min="1"
                  className="w-24"
                  {...form.register("numberOfDisabilityPositions", { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500">
                  Berapa banyak posisi yang tersedia untuk kandidat dengan disabilitas?
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 
