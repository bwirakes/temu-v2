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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormNav from "@/components/FormNav";
import { cn } from "@/lib/utils";
import { FormLabel } from "@/components/ui/form-label";

// Define agama options
const agamaOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"] as const;

const informasiLanjutanSchema = z.object({
  tanggalLahir: z.date({
    required_error: "Tanggal lahir wajib diisi",
  }),
  tanggalLahirText: z.string().optional(),
  jenisKelamin: z
    .enum(["Laki-laki", "Perempuan"])
    .optional(),
  beratBadan: z
    .number()
    .min(30, "Berat badan minimal 30 kg")
    .max(200, "Berat badan maksimal 200 kg")
    .optional(),
  tinggiBadan: z
    .number()
    .min(100, "Tinggi badan minimal 100 cm")
    .max(250, "Tinggi badan maksimal 250 cm")
    .optional(),
  agama: z.enum(agamaOptions).optional(),
});

type InformasiLanjutanValues = z.infer<typeof informasiLanjutanSchema>;

export default function InformasiLanjutanForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    data.tanggalLahir ? new Date(data.tanggalLahir) : undefined
  );
  const [dateInputError, setDateInputError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const defaultValues: Partial<InformasiLanjutanValues> = {
    tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
    tanggalLahirText: data.tanggalLahir ? format(new Date(data.tanggalLahir), "dd/MM/yyyy") : "",
    jenisKelamin: data.jenisKelamin === "Lainnya" ? undefined : data.jenisKelamin,
    beratBadan: data.beratBadan,
    tinggiBadan: data.tinggiBadan,
    agama: data.agama as any,
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

  const onSubmit = (values: InformasiLanjutanValues) => {
    if (dateInputError) {
      return;
    }
    
    setIsSubmitting(true);
    
    updateFormValues({
      tanggalLahir: values.tanggalLahir.toISOString().split("T")[0],
      jenisKelamin: values.jenisKelamin,
      beratBadan: values.beratBadan,
      tinggiBadan: values.tinggiBadan,
      agama: values.agama,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(3);
      router.push("/job-seeker/onboarding/alamat");
    }, 500);
  };

  const selectedDate = watch("tanggalLahir");
  const dateText = watch("tanggalLahirText");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
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

        {/* Berat & Tinggi Badan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="beratBadan">Berat Badan (kg)</FormLabel>
            <Input
              id="beratBadan"
              type="number"
              placeholder="70"
              {...register("beratBadan", { valueAsNumber: true })}
              className={errors.beratBadan ? "border-red-500" : ""}
            />
            {errors.beratBadan && (
              <p className="text-red-500 text-sm">{errors.beratBadan.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <FormLabel htmlFor="tinggiBadan">Tinggi Badan (cm)</FormLabel>
            <Input
              id="tinggiBadan"
              type="number"
              placeholder="170"
              {...register("tinggiBadan", { valueAsNumber: true })}
              className={errors.tinggiBadan ? "border-red-500" : ""}
            />
            {errors.tinggiBadan && (
              <p className="text-red-500 text-sm">{errors.tinggiBadan.message}</p>
            )}
          </div>
        </div>

        {/* Agama */}
        <div className="space-y-2">
          <FormLabel htmlFor="agama">Agama</FormLabel>
          <Select
            onValueChange={(value) => setValue("agama", value as any)}
            defaultValue={defaultValues.agama}
          >
            <SelectTrigger id="agama" className="w-full">
              <SelectValue placeholder="Pilih agama" />
            </SelectTrigger>
            <SelectContent>
              {agamaOptions.map((agama) => (
                <SelectItem key={agama} value={agama}>
                  {agama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting} />
    </form>
  );
} 