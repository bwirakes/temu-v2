"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse, isValid } from "date-fns";
import { id } from "date-fns/locale";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { FormLabel } from "@/components/ui/form-label";
import { toast } from "sonner";

const informasiLanjutanSchema = z.object({
  tanggalLahir: z.date({
    required_error: "Tanggal lahir wajib diisi",
  }),
  tanggalLahirText: z.string().optional(),
  tempatLahir: z.string().optional(),
  jenisKelamin: z
    .enum(["Laki-laki", "Perempuan"])
    .optional(),
});

type InformasiLanjutanValues = z.infer<typeof informasiLanjutanSchema>;

export default function InformasiLanjutanForm() {
  const { data, updateFormValues, navigateToNextStep, currentStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    data.tanggalLahir ? new Date(data.tanggalLahir) : undefined
  );
  const [dateInputError, setDateInputError] = useState<string | null>(null);

  const defaultValues: Partial<InformasiLanjutanValues> = {
    tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
    tanggalLahirText: data.tanggalLahir ? format(new Date(data.tanggalLahir), "dd/MM/yyyy") : "",
    tempatLahir: data.tempatLahir || "",
    jenisKelamin: (data.jenisKelamin === "Laki-laki" || data.jenisKelamin === "Perempuan") ? data.jenisKelamin : undefined,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InformasiLanjutanValues>({
    resolver: zodResolver(informasiLanjutanSchema),
    defaultValues,
  });

  // Update the form value when date changes
  useEffect(() => {
    if (date) {
      setValue("tanggalLahir", date);
      setValue("tanggalLahirText", format(date, "dd/MM/yyyy"));
      setDateInputError(null);
    }
  }, [date, setValue]);

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Format input to include slashes automatically
    if (inputValue.length > 0) {
      // Remove any non-digit characters
      const digits = inputValue.replace(/\D/g, '');
      
      // Format with slashes
      if (digits.length <= 2) {
        inputValue = digits;
      } else if (digits.length <= 4) {
        inputValue = `${digits.substring(0, 2)}/${digits.substring(2)}`;
      } else {
        inputValue = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
      }
    }
    
    setValue("tanggalLahirText", inputValue);
    
    if (!inputValue) {
      setDateInputError("Tanggal lahir wajib diisi");
      setValue("tanggalLahir", undefined as any); // Clear the actual date if input is empty
      return;
    }

    // Only try to parse if we have enough characters for a complete date
    if (inputValue.length < 8 && inputValue.length !== 0) { // Allow clearing, but require length for parsing
      setDateInputError("Format tanggal tidak lengkap.");
      setValue("tanggalLahir", undefined as any);
      return;
    }
    if (inputValue.length === 0) { // If cleared completely
        setDateInputError("Tanggal lahir wajib diisi");
        setValue("tanggalLahir", undefined as any);
        return;
    }


    try {
      // Try to parse the date with different formats
      let parsedDate: Date | null = null;
      const formats = ["dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "d-M-yyyy", "yyyy-MM-dd"];
      
      for (const fmt of formats) {
        const attemptedDate = parse(inputValue, fmt, new Date());
        if (isValid(attemptedDate)) {
          parsedDate = attemptedDate;
          break;
        }
      }

      if (parsedDate && isValid(parsedDate)) {
        // Check if date is within valid range
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        const minDate = new Date("1900-01-01");
        
        if (parsedDate > today) {
          setDateInputError("Tanggal tidak boleh lebih dari hari ini");
          setValue("tanggalLahir", undefined as any);
          return;
        }
        
        if (parsedDate < minDate) {
          setDateInputError("Tanggal tidak boleh kurang dari tahun 1900");
          setValue("tanggalLahir", undefined as any);
          return;
        }

        setDate(parsedDate);
        setValue("tanggalLahir", parsedDate, { shouldValidate: true });
        setDateInputError(null);
      } else if (inputValue.length >= 10 || (inputValue.length >=8 && !inputValue.includes('/'))) { // Trigger error if fully typed or close to it
        setDateInputError("Format tanggal tidak valid. Gunakan format DD/MM/YYYY");
        setValue("tanggalLahir", undefined as any);
      } else {
        // For incomplete dates that are not yet 10 chars, clear previous error if any, but don't set date
        setDateInputError(null); 
        setValue("tanggalLahir", undefined as any);
      }
    } catch (error) {
      if (inputValue.length >= 10) {
        setDateInputError("Format tanggal tidak valid. Gunakan format DD/MM/YYYY");
      }
      setValue("tanggalLahir", undefined as any);
    }
  };

  const onSubmit = async (values: InformasiLanjutanValues) => {
    // Re-validate tanggalLahir directly from form state before submission
    if (!values.tanggalLahir) {
        setDateInputError("Tanggal lahir wajib diisi");
        toast.error("Tanggal lahir wajib diisi. Mohon periksa kembali.");
        return;
    }
    if (dateInputError) {
      toast.error(`Masalah pada tanggal lahir: ${dateInputError}`);
      return;
    }
    
    setIsSubmitting(true);
    
    const updatedValues = {
      tanggalLahir: values.tanggalLahir.toISOString().split("T")[0], // Ensure date is in YYYY-MM-DD
      tempatLahir: values.tempatLahir || null, // Send null if empty
      jenisKelamin: values.jenisKelamin || null, // Send null if undefined
    };
    
    try {
      updateFormValues(updatedValues);
      toast.success("Data berhasil disimpan");
      
      // Log current step before navigation for debugging
      console.log("[InformasiLanjutanForm] Current step before navigation:", currentStep);
      
      navigateToNextStep();
    } catch (error) {
      console.error("Error saving information:", error);
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateText = watch("tanggalLahirText");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Tempat Lahir field */}
        <div className="space-y-2">
          <FormLabel htmlFor="tempatLahir">Tempat Lahir <span className="text-gray-500 text-sm font-normal">(Opsional)</span></FormLabel>
          <Input
            id="tempatLahir"
            placeholder="Contoh: Jakarta"
            {...register("tempatLahir")}
          />
        </div>
        
        {/* Tanggal Lahir */}
        <div className="space-y-2">
          <FormLabel htmlFor="tanggalLahirText" required>
            Tanggal Lahir
          </FormLabel>
          
          <div className="relative">
            <Input
              id="tanggalLahirText"
              placeholder="DD/MM/YYYY"
              value={dateText || ""}
              onChange={handleDateInputChange}
              inputMode="numeric"
              maxLength={10}
              className={cn(
                dateInputError || errors.tanggalLahir ? "border-red-500" : ""
              )}
            />
            <div className="text-xs text-gray-500 mt-1">
              Format: DD/MM/YYYY (contoh: 15/06/1987)
            </div>
            {dateInputError && (
              <p className="text-red-500 text-sm mt-1">{dateInputError}</p>
            )}
            {errors.tanggalLahir && !dateInputError && (
              <p className="text-red-500 text-sm mt-1">{errors.tanggalLahir.message as string}</p>
            )}
          </div>
        </div>

        {/* Jenis Kelamin */}
        <div className="space-y-2">
          <FormLabel>Jenis Kelamin <span className="text-gray-500 text-sm font-normal">(Opsional)</span></FormLabel>
          <RadioGroup
            value={watch("jenisKelamin")}
            onValueChange={(value) => 
              setValue("jenisKelamin", value as "Laki-laki" | "Perempuan", { shouldValidate: true })
            }
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Laki-laki" id="laki-laki" />
              <FormLabel htmlFor="laki-laki" className="cursor-pointer font-normal">Laki-laki</FormLabel>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Perempuan" id="perempuan" />
              <FormLabel htmlFor="perempuan" className="cursor-pointer font-normal">Perempuan</FormLabel>
            </div>
          </RadioGroup>
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting} saveOnNext={false} />
    </form>
  );
} 