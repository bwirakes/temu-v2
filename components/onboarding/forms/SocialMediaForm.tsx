"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "lucide-react";

import { useOnboarding } from "@/lib/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormNav from "@/components/FormNav";

const socialMediaSchema = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  linkedin: z.string().optional(),
  other: z.string().optional(),
});

type SocialMediaValues = z.infer<typeof socialMediaSchema>;

export default function SocialMediaForm() {
  const { data, updateFormValues, setCurrentStep } = useOnboarding();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<SocialMediaValues> = {
    instagram: data.socialMedia?.instagram || "",
    twitter: data.socialMedia?.twitter || "",
    facebook: data.socialMedia?.facebook || "",
    tiktok: data.socialMedia?.tiktok || "",
    linkedin: data.socialMedia?.linkedin || "",
    other: data.socialMedia?.other || "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialMediaValues>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues,
  });

  const onSubmit = (values: SocialMediaValues) => {
    setIsSubmitting(true);
    
    updateFormValues({
      socialMedia: values,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(5);
      router.push("/onboarding/upload-foto");
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="instagram"
              placeholder="@username"
              className="pl-9"
              {...register("instagram")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">X (Twitter)</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="twitter"
              placeholder="@username"
              className="pl-9"
              {...register("twitter")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="facebook"
              placeholder="username"
              className="pl-9"
              {...register("facebook")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiktok">TikTok</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="tiktok"
              placeholder="@username"
              className="pl-9"
              {...register("tiktok")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="linkedin"
              placeholder="URL profil"
              className="pl-9"
              {...register("linkedin")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="other">Media Sosial Lainnya</Label>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="other"
              placeholder="URL profil"
              className="pl-9"
              {...register("other")}
            />
          </div>
        </div>
      </div>

      <FormNav isSubmitting={isSubmitting} />
    </form>
  );
}