"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormNav from "@/components/FormNav";
import { useOnboarding } from "@/lib/context/OnboardingContext";

const formSchema = z.object({
  website: z.string().url("URL website tidak valid").optional().or(z.literal("")),
  portfolio: z.string().url("URL portfolio tidak valid").optional().or(z.literal("")),
  tentangSaya: z.string().min(50, "Deskripsi minimal 50 karakter").max(500, "Deskripsi maksimal 500 karakter"),
  hobi: z.string().min(3, "Hobi minimal 3 karakter").max(100, "Hobi maksimal 100 karakter"),
});

export default function InformasiTambahanForm() {
  const router = useRouter();
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website: data.informasiTambahan?.website || "",
      portfolio: data.informasiTambahan?.portfolio || "",
      tentangSaya: data.informasiTambahan?.tentangSaya || "",
      hobi: data.informasiTambahan?.hobi || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    updateFormValues({
      informasiTambahan: values
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(12);
      router.push("/job-seeker/onboarding/ekspektasi-kerja");
    }, 500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio</FormLabel>
              <FormControl>
                <Input placeholder="https://www.portfolio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tentangSaya"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tentang Saya</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ceritakan tentang diri Anda..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hobi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hobi</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Membaca, Menulis, Traveling" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormNav isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}