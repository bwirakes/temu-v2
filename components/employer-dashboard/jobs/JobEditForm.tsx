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

// Define contract type locally
// type ContractType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE";

// Define the schema for the form
const jobSchema = z.object({
  // Basic Information
  jobTitle: z.string().min(1, "Jenis pekerjaan wajib diisi"),
  numberOfPositions: z.number().min(1, "Jumlah tenaga kerja wajib diisi"),
  
  // Requirements
  gender: z.enum(["ANY", "MALE", "FEMALE"]),
  minWorkExperience: z.number().min(0).optional(),
  // Retained fields
  lastEducation: z.enum(["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"]).optional(),
  requiredCompetencies: z.string().optional(), // Will be split into array when submitting
  acceptedDisabilityTypes: z.string().optional(), // Will be split into array when submitting
  numberOfDisabilityPositions: z.number().min(0).default(0),
  
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
      requiredCompetencies: "",
      acceptedDisabilityTypes: "",
      numberOfDisabilityPositions: 0,
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
        
        // Format job data for the form
        form.reset({
          jobTitle: job.jobTitle || "",
          numberOfPositions: job.numberOfPositions || 1,
          gender: job.additionalRequirements?.gender === "MALE" ? "MALE" : 
                 job.additionalRequirements?.gender === "FEMALE" ? "FEMALE" : "ANY",
          minWorkExperience: job.minWorkExperience || 0,
          // New fields
          lastEducation: job.lastEducation || undefined,
          requiredCompetencies: Array.isArray(job.requiredCompetencies) 
            ? job.requiredCompetencies.join("\n") 
            : "",
          acceptedDisabilityTypes: Array.isArray(job.acceptedDisabilityTypes) 
            ? job.acceptedDisabilityTypes.join("\n") 
            : "",
          numberOfDisabilityPositions: job.numberOfDisabilityPositions || 0,
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

  const onSubmit = async (data: JobFormValues) => {
    setIsSaving(true);
    
    try {
      // Validate work locations
      const hasValidLocations = workLocations.every(loc => loc.city && loc.province);
      
      if (!hasValidLocations) {
        toast.error("Validasi gagal", {
          description: "Setiap lokasi kerja harus memiliki kota dan provinsi."
        });
        setIsSaving(false);
        return;
      }

      // Format data for the API
      const jobData = {
        jobTitle: data.jobTitle,
        minWorkExperience: data.minWorkExperience,
        numberOfPositions: data.numberOfPositions,
        // New fields
        lastEducation: data.lastEducation,
        requiredCompetencies: data.requiredCompetencies ? data.requiredCompetencies.split('\n').filter(Boolean) : [],
        acceptedDisabilityTypes: data.acceptedDisabilityTypes ? data.acceptedDisabilityTypes.split('\n').filter(Boolean) : [],
        numberOfDisabilityPositions: data.numberOfDisabilityPositions,
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

      // Delete existing locations and create new ones
      // First, delete all existing locations
      await fetch(`/api/employer/jobs/${jobId}/locations`, {
        method: 'DELETE'
      });

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

          {/* Work Locations */}
          <div className="space-y-3">
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
              value={form.watch("lastEducation") || ""}
              onValueChange={(value) => {
                if (value) {
                  form.setValue("lastEducation", value as any);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pendidikan Minimal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak Ada Persyaratan</SelectItem>
                <SelectItem value="SD">SD</SelectItem>
                <SelectItem value="SMP">SMP</SelectItem>
                <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                <SelectItem value="D1">D1</SelectItem>
                <SelectItem value="D2">D2</SelectItem>
                <SelectItem value="D3">D3</SelectItem>
                <SelectItem value="D4">D4</SelectItem>
                <SelectItem value="S1">S1</SelectItem>
                <SelectItem value="S2">S2</SelectItem>
                <SelectItem value="S3">S3</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Pendidikan minimum yang diperlukan untuk posisi ini
            </p>
          </div>
          
          {/* Required Competencies */}
          <div className="space-y-2">
            <LabelText htmlFor="requiredCompetencies">Kompetensi yang Dibutuhkan</LabelText>
            <Input
              id="requiredCompetencies"
              placeholder="Contoh: Komunikasi efektif, Pemecahan masalah, Kerjasama tim, dll."
              {...form.register("requiredCompetencies")}
            />
            <p className="text-xs text-gray-500">
              Pisahkan beberapa kompetensi dengan koma
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
          {/* Disability fields */}
          <div className="space-y-2">
            <LabelText htmlFor="acceptedDisabilityTypes">Jenis Disabilitas yang Diterima</LabelText>
            <Input
              id="acceptedDisabilityTypes"
              placeholder="Contoh: Disabilitas fisik, Disabilitas sensorik, dll."
              {...form.register("acceptedDisabilityTypes")}
            />
            <p className="text-xs text-gray-500">
              Pisahkan beberapa jenis disabilitas dengan koma
            </p>
          </div>
          
          <div className="space-y-2">
            <LabelText htmlFor="numberOfDisabilityPositions">Jumlah Posisi untuk Disabilitas</LabelText>
            <Input
              id="numberOfDisabilityPositions"
              type="number"
              min="0"
              {...form.register("numberOfDisabilityPositions", { valueAsNumber: true })}
            />
            <p className="text-xs text-gray-500">
              Masukkan 0 jika tidak ada kuota khusus
            </p>
          </div>
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
