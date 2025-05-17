"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parse, isValid } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { FormLabel } from "@/components/ui/form-label";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import { toast } from "sonner";

const informasiLanjutanSchema = z.object({
  tanggalLahir: z.date({
    required_error: "Tanggal lahir wajib diisi",
  }),
  tanggalLahirText: z.string().optional(),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  jenisKelamin: z
    .enum(["Laki-laki", "Perempuan"])
    .optional(),
});

type InformasiLanjutanValues = z.infer<typeof informasiLanjutanSchema>;

export default function InformasiLanjutanForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { saveStep, isLoading: isSaving } = useOnboardingApi();
  const [date, setDate] = useState<Date | undefined>(
    data.tanggalLahir ? new Date(data.tanggalLahir) : undefined
  );
  const [dateInputError, setDateInputError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const defaultValues: Partial<InformasiLanjutanValues> = {
    tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
    tanggalLahirText: data.tanggalLahir ? format(new Date(data.tanggalLahir), "dd/MM/yyyy") : "",
    tempatLahir: data.tempatLahir || "",
    jenisKelamin: data.jenisKelamin === "Lainnya" ? undefined : data.jenisKelamin,
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
      return;
    }

    // Only try to parse if we have enough characters for a complete date
    if (inputValue.length < 8) {
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
        const minDate = new Date("1900-01-01");
        
        if (parsedDate > today) {
          setDateInputError("Tanggal tidak boleh lebih dari hari ini");
          return;
        }
        
        if (parsedDate < minDate) {
          setDateInputError("Tanggal tidak boleh kurang dari tahun 1900");
          return;
        }

        setDate(parsedDate);
        setValue("tanggalLahir", parsedDate);
        setDateInputError(null);
      } else if (inputValue.length >= 10) {
        setDateInputError("Format tanggal tidak valid. Gunakan format DD/MM/YYYY");
      }
    } catch (error) {
      if (inputValue.length >= 10) {
        setDateInputError("Format tanggal tidak valid. Gunakan format DD/MM/YYYY");
      }
    }
  };

  const onSubmit = async (values: InformasiLanjutanValues) => {
    if (dateInputError) {
      return;
    }
    
    setIsSubmitting(true);
    
    const updatedValues = {
      tanggalLahir: values.tanggalLahir.toISOString().split("T")[0],
      tempatLahir: values.tempatLahir,
      jenisKelamin: values.jenisKelamin,
    };
    
    updateFormValues(updatedValues);

    try {
      await saveStep(2, updatedValues);
      
      toast.success("Data berhasil disimpan");
      setCurrentStep(3);
      router.push("/job-seeker/onboarding/alamat");
    } catch (error) {
      console.error("Error saving information:", error);
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDate = watch("tanggalLahir");
  const dateText = watch("tanggalLahirText");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Tempat Lahir */}
        <div className="space-y-2">
          <FormLabel htmlFor="tempatLahir" required>
            Tempat Lahir
          </FormLabel>
          <Input
            id="tempatLahir"
            placeholder="Masukkan kota kelahiran Anda"
            {...register("tempatLahir")}
            className={errors.tempatLahir ? "border-red-500" : ""}
          />
          {errors.tempatLahir && (
            <p className="text-red-500 text-sm">{errors.tempatLahir.message}</p>
          )}
        </div>
        
        {/* Tanggal Lahir */}
        <div className="space-y-2">
          <FormLabel htmlFor="tanggalLahirText" required>
            Tanggal Lahir
          </FormLabel>
          
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="tanggalLahirText"
                placeholder="DD/MM/YYYY"
                value={dateText}
                onChange={handleDateInputChange}
                inputMode="numeric"
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
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="px-3"
                  aria-label="Pilih tanggal menggunakan kalender"
                >
                  <CalendarIcon className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setDate(date);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Jenis Kelamin */}
        <div className="space-y-2">
          <FormLabel>Jenis Kelamin</FormLabel>
          <RadioGroup
            defaultValue={defaultValues.jenisKelamin}
            onValueChange={(value) => 
              setValue("jenisKelamin", value as "Laki-laki" | "Perempuan")
            }
            className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Laki-laki" id="laki-laki" />
              <FormLabel htmlFor="laki-laki" className="cursor-pointer">Laki-laki</FormLabel>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Perempuan" id="perempuan" />
              <FormLabel htmlFor="perempuan" className="cursor-pointer">Perempuan</FormLabel>
            </div>
          </RadioGroup>
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting || isSaving} saveOnNext={false} />
    </form>
  );
} 