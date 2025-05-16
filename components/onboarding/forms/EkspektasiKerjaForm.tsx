"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

import { 
  useOnboarding, 
  EkspektasiKerja, 
  CommuteMethod,
  WillingToTravel,
  WorkOvertime,
  EmploymentUrgency
} from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";

// Define the schema for validation per step
// This allows us to validate each step independently
const stepSchemas = {
  1: z.object({
    jobTypes: z.string().min(1, "Jenis pekerjaan wajib diisi"),
  }),
  2: z.object({
    minSalary: z.coerce.number().positive("Gaji minimum harus lebih dari 0"),
    idealSalary: z.coerce.number().positive("Gaji ideal harus lebih dari 0"),
  }).refine((data) => data.idealSalary >= data.minSalary, {
    message: "Gaji ideal harus lebih besar atau sama dengan gaji minimum",
    path: ["idealSalary"],
  }),
  3: z.object({
    commuteMethod: z.enum(["private_transport", "public_transport"], {
      required_error: "Pilih salah satu opsi",
    }),
    willingToTravel: z.enum(["local_only", "jabodetabek", "anywhere"], {
      required_error: "Pilih salah satu opsi",
    }),
  }),
  4: z.object({
    workOvertime: z.enum(["yes", "no"], {
      required_error: "Pilih salah satu opsi",
    }),
    employmentUrgency: z.enum(["very_urgent", "urgent", "moderate", "conditional"], {
      required_error: "Pilih salah satu opsi",
    }),
  }),
};

// Define step titles for display
const stepTitles = {
  1: "Preferensi Pekerjaan",
  2: "Ekspektasi Gaji",
  3: "Preferensi Lokasi",
  4: "Jam Kerja & Urgensi",
};

// Define which steps are optional
const optionalSteps = [2, 4];

// Define the combined schema for final validation
const ekspektasiKerjaSchema = z.object({
  jobTypes: z.string().min(1, "Jenis pekerjaan wajib diisi"),
  minSalary: z.coerce.number().positive("Gaji minimum harus lebih dari 0").optional(),
  idealSalary: z.coerce.number().positive("Gaji ideal harus lebih dari 0").optional(),
  commuteMethod: z.enum(["private_transport", "public_transport"], {
    required_error: "Pilih salah satu opsi",
  }),
  willingToTravel: z.enum(["local_only", "jabodetabek", "anywhere"], {
    required_error: "Pilih salah satu opsi",
  }),
  workOvertime: z.enum(["yes", "no"]).optional(),
  employmentUrgency: z.enum(["very_urgent", "urgent", "moderate", "conditional"]).optional(),
}).refine((data) => {
  // If both salary fields are provided, make sure ideal >= min
  if (data.minSalary && data.idealSalary) {
    return data.idealSalary >= data.minSalary;
  }
  return true;
}, {
  message: "Gaji ideal harus lebih besar atau sama dengan gaji minimum",
  path: ["idealSalary"],
});

type EkspektasiKerjaValues = z.infer<typeof ekspektasiKerjaSchema>;

export default function EkspektasiKerjaForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const totalSteps = 4;
  
  // Prepare the default values
  const defaultValues: Partial<EkspektasiKerjaValues> = {
    jobTypes: data.ekspektasiKerja?.jobTypes || "",
    minSalary: data.ekspektasiKerja?.minSalary || undefined,
    idealSalary: data.ekspektasiKerja?.idealSalary || undefined,
    commuteMethod: data.ekspektasiKerja?.commuteMethod || undefined,
    willingToTravel: data.ekspektasiKerja?.willingToTravel || undefined,
    workOvertime: data.ekspektasiKerja?.workOvertime || undefined,
    employmentUrgency: data.ekspektasiKerja?.employmentUrgency || undefined,
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    trigger,
    getValues,
  } = useForm<EkspektasiKerjaValues>({
    resolver: zodResolver(ekspektasiKerjaSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const watchedValues = watch();
  
  const handleNextStep = async () => {
    // Get the schema for the current step
    const currentSchema = stepSchemas[formStep as keyof typeof stepSchemas];
    
    // Create an object with only the fields for this step
    let fieldsToValidate: string[] = [];
    
    // Define fields to validate for each step
    switch (formStep) {
      case 1:
        fieldsToValidate = ["jobTypes"];
        break;
      case 2:
        fieldsToValidate = ["minSalary", "idealSalary"];
        break;
      case 3:
        fieldsToValidate = ["commuteMethod", "willingToTravel"];
        break;
      case 4:
        fieldsToValidate = ["workOvertime", "employmentUrgency"];
        break;
    }
    
    // Skip validation for optional steps if skipping
    const isOptionalStep = optionalSteps.includes(formStep);
    
    if (isOptionalStep || await trigger(fieldsToValidate as any)) {
      // If validation passes, move to the next step
      if (formStep < totalSteps) {
        setFormStep(formStep + 1);
      } else {
        // If on the last step, submit the form
        handleFinalSubmit();
      }
    }
  };
  
  const handleSkipStep = () => {
    if (optionalSteps.includes(formStep) && formStep < totalSteps) {
      setFormStep(formStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };
  
  // Submit the form and navigate to the next step in the onboarding flow
  const handleFinalSubmit = () => {
    const values = getValues();
    setIsSubmitting(true);
    
    // Save form values to context, ensuring defaults for optional fields
    updateFormValues({
      ekspektasiKerja: {
        jobTypes: values.jobTypes,
        minSalary: values.minSalary || 0,
        idealSalary: values.idealSalary || 0,
        commuteMethod: values.commuteMethod,
        willingToTravel: values.willingToTravel,
        workOvertime: values.workOvertime || "no", // Default to no
        employmentUrgency: values.employmentUrgency || "conditional", // Default value
      } as EkspektasiKerja,
    });
    
    // Navigate to the next step
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(13); // Next step in the onboarding flow
      router.push("/job-seeker/onboarding/ringkasan");
    }, 500);
  };
  
  // Function to render current step content
  const renderStepContent = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="jobTypes" className="block text-lg font-medium">
                Bantu kami pahami loker yang cocok dengan kamu!
              </label>
              <p className="text-gray-500 text-sm">
                Sebutkan sebanyak-banyaknya jenis pekerjaan apa yang kamu inginkan
              </p>
              <Textarea
                id="jobTypes"
                placeholder="Contoh: Software Engineer, Digital Marketing Specialist, Barista"
                className={cn(
                  "min-h-32 mt-2",
                  errors.jobTypes ? "border-red-500 focus-visible:ring-red-500" : ""
                )}
                {...register("jobTypes")}
              />
              {errors.jobTypes && (
                <p className="text-sm text-red-500 mt-1">{errors.jobTypes.message}</p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <label className="block text-lg font-medium">
              Berapa harapan gaji yang kamu inginkan?
            </label>
            <p className="text-gray-500 text-sm">
              Tolong sebutkan angka paling minimum dan ideal
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <label htmlFor="minSalary" className="text-sm font-medium">
                  Gaji minimum:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="5000000"
                    className={cn(
                      "pl-8",
                      errors.minSalary ? "border-red-500 focus-visible:ring-red-500" : ""
                    )}
                    {...register("minSalary")}
                  />
                </div>
                {errors.minSalary && (
                  <p className="text-sm text-red-500 mt-1">{errors.minSalary.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="idealSalary" className="text-sm font-medium">
                  Gaji ideal:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rp
                  </span>
                  <Input
                    id="idealSalary"
                    type="number"
                    placeholder="8000000"
                    className={cn(
                      "pl-8",
                      errors.idealSalary ? "border-red-500 focus-visible:ring-red-500" : ""
                    )}
                    {...register("idealSalary")}
                  />
                </div>
                {errors.idealSalary && (
                  <p className="text-sm text-red-500 mt-1">{errors.idealSalary.message}</p>
                )}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            {/* Commute Method */}
            <div className="space-y-3">
              <label className="block text-lg font-medium">
                Untuk bekerja, bagaimana cara kamu berangkat ke kantor?
              </label>
              
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="commutePrivate"
                    value="private_transport"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.commuteMethod === "private_transport"}
                    {...register("commuteMethod")}
                  />
                  <label htmlFor="commutePrivate" className="text-base font-normal cursor-pointer w-full">
                    Saya memiliki kendaraan pribadi.
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="commutePublic"
                    value="public_transport"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.commuteMethod === "public_transport"}
                    {...register("commuteMethod")}
                  />
                  <label htmlFor="commutePublic" className="text-base font-normal cursor-pointer w-full">
                    Saya menggunakan transportasi umum.
                  </label>
                </div>
              </div>
              {errors.commuteMethod && (
                <p className="text-sm text-red-500">{errors.commuteMethod.message}</p>
              )}
            </div>
            
            {/* Willing To Travel */}
            <div className="space-y-3 mt-6">
              <label className="block text-lg font-medium">
                Apakah kamu bersedia berpergian untuk pekerjaan ini?
              </label>
              
              <div className={cn(
                "flex flex-col space-y-2 mt-2",
                errors.willingToTravel ? "border-red-500 rounded-md" : ""
              )}>
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="travelLocal"
                    value="local_only"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.willingToTravel === "local_only"}
                    {...register("willingToTravel")}
                  />
                  <label htmlFor="travelLocal" className="text-base font-normal cursor-pointer w-full">
                    Saya hanya ingin bekerja sekitar tempat saya tinggal.
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="travelJabodetabek"
                    value="jabodetabek"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.willingToTravel === "jabodetabek"}
                    {...register("willingToTravel")}
                  />
                  <label htmlFor="travelJabodetabek" className="text-base font-normal cursor-pointer w-full">
                    Saya siap ditempatakan dimana saja asal di Jabodetabek.
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="travelAnywhere"
                    value="anywhere"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.willingToTravel === "anywhere"}
                    {...register("willingToTravel")}
                  />
                  <label htmlFor="travelAnywhere" className="text-base font-normal cursor-pointer w-full">
                    Saya siap ditempatkan dimana saja.
                  </label>
                </div>
              </div>
              
              {errors.willingToTravel && (
                <p className="text-sm text-red-500">{errors.willingToTravel.message}</p>
              )}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            {/* Work Overtime */}
            <div className="space-y-3">
              <label className="block text-lg font-medium">
                Apakah kamu bersedia kerja lembur dan diluar jam kerja biasa?
              </label>
              <p className="text-gray-500 text-sm">
                Contoh: Akhir pekan, malam hari, tanggal merah
              </p>
              
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="overtimeYes"
                    value="yes"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.workOvertime === "yes"}
                    {...register("workOvertime")}
                  />
                  <label htmlFor="overtimeYes" className="text-base font-normal cursor-pointer w-full">
                    Ya, saya bersedia
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="overtimeNo"
                    value="no"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.workOvertime === "no"}
                    {...register("workOvertime")}
                  />
                  <label htmlFor="overtimeNo" className="text-base font-normal cursor-pointer w-full">
                    Tidak, saya tidak bersedia
                  </label>
                </div>
              </div>
              {errors.workOvertime && (
                <p className="text-sm text-red-500">{errors.workOvertime.message}</p>
              )}
            </div>
            
            {/* Employment Urgency */}
            <div className="space-y-3 mt-6">
              <label className="block text-lg font-medium">
                Seberapa serius kamu butuh pekerjaan saat ini?
              </label>
              
              <div className={cn(
                "flex flex-col space-y-2 mt-2",
                errors.employmentUrgency ? "border-red-500 rounded-md" : ""
              )}>
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="urgencyVery"
                    value="very_urgent"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.employmentUrgency === "very_urgent"}
                    {...register("employmentUrgency")}
                  />
                  <label htmlFor="urgencyVery" className="text-base font-normal cursor-pointer w-full">
                    Sangat butuh. Tulang punggung keluarga.
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="urgencyUrgent"
                    value="urgent"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.employmentUrgency === "urgent"}
                    {...register("employmentUrgency")}
                  />
                  <label htmlFor="urgencyUrgent" className="text-base font-normal cursor-pointer w-full">
                    Butuh. Saat ini hidup pas-pasan.
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="urgencyModerate"
                    value="moderate"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.employmentUrgency === "moderate"}
                    {...register("employmentUrgency")}
                  />
                  <label htmlFor="urgencyModerate" className="text-base font-normal cursor-pointer w-full">
                    Cukup butuh. Masih dapat hidup dari keluarga.
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 p-3 rounded-md border hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    id="urgencyConditional"
                    value="conditional"
                    className="h-4 w-4"
                    defaultChecked={defaultValues.employmentUrgency === "conditional"}
                    {...register("employmentUrgency")}
                  />
                  <label htmlFor="urgencyConditional" className="text-base font-normal cursor-pointer w-full">
                    Saya akan terima pekerjaan jika tawaran Perusahaan sesuai.
                  </label>
                </div>
              </div>
              
              {errors.employmentUrgency && (
                <p className="text-sm text-red-500">{errors.employmentUrgency.message}</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-6">
        {/* Step title and indicator */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {stepTitles[formStep as keyof typeof stepTitles]}
          </h2>
          <span className="text-sm text-gray-500">
            {optionalSteps.includes(formStep) ? "(Opsional) " : ""}
            {formStep}/{totalSteps}
          </span>
        </div>
        
        {/* Step content */}
        <div className="bg-white rounded-lg p-6">
          {renderStepContent()}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={formStep === 1 || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          
          <div className="flex space-x-2">
            {optionalSteps.includes(formStep) && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipStep}
                disabled={isSubmitting || formStep === totalSteps}
              >
                Lewati
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              {formStep === totalSteps ? (
                isSubmitting ? "Menyimpan..." : "Simpan"
              ) : (
                <>
                  Lanjut
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 
