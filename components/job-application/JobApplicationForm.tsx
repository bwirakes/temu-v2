"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";

// Import our JobApplication context
import { useJobApplication, jobApplicationSchema } from "@/lib/context/JobApplicationContext";

// Form schema type definition using our schema from context
type ApplicationFormValues = z.infer<typeof jobApplicationSchema>;

interface JobApplicationFormProps {
  jobId: string;
}

export default function JobApplicationForm({ jobId }: JobApplicationFormProps) {
  // Use our job application context
  const { 
    data, 
    isSubmitting, 
    updateForm, 
    submitApplication 
  } = useJobApplication();
  
  // Initialize form with default values from context
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      jobId: jobId,
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
      coverLetter: data.coverLetter || "",
      education: data.education,
      additionalNotes: data.additionalNotes || "",
      agreeToTerms: data.agreeToTerms || false,
      shareData: data.shareData || false,
    },
  });

  // Update context data when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateForm(value as Partial<ApplicationFormValues>);
    });
    
    return () => subscription.unsubscribe();
  }, [form, updateForm]);

  // Handle form submission
  async function onSubmit(formData: ApplicationFormValues) {
    try {
      // Update form data in context
      updateForm(formData);
      
      // Submit the application using our context
      await submitApplication();
      
      // Note: The navigation to the success page is handled in the context
    } catch (error) {
      console.error("Error submitting application:", error);
      
      // If there are field-specific errors, set them in the form
      if (error && typeof error === 'object') {
        Object.entries(error as Record<string, string>).forEach(([field, message]) => {
          form.setError(field as any, { message });
        });
      }
    }
  }

  return (
    <Card id="job-application-form">
      <CardHeader>
        <CardTitle>Formulir Lamaran</CardTitle>
        <CardDescription>
          Lengkapi formulir di bawah ini untuk mengajukan lamaran pekerjaan Anda.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="shareData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6 rounded-md border p-4 bg-blue-50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Gunakan data CV yang tersimpan
                      </FormLabel>
                      <FormDescription>
                        Dengan mencentang ini, Anda menyetujui untuk berbagi data CV Anda dengan perusahaan terkait.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@contoh.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+628xxxxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pendidikan Terakhir</FormLabel>
                    <FormControl>
                      {/* @ts-ignore - Adding type ignore to resolve RadioGroup typing issues */}
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="SMA" id="SMA" />
                            <Label htmlFor="SMA">SMA/SMK</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="Diploma" id="Diploma" />
                            <Label htmlFor="Diploma">Diploma</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="S1" id="S1" />
                            <Label htmlFor="S1">S1</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="S2" id="S2" />
                            <Label htmlFor="S2">S2</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="S3" id="S3" />
                            <Label htmlFor="S3">S3</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informasi Tambahan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Bagikan informasi, wawasan, dan pengalaman lain yang relevan untuk perusahaan" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Tambahkan informasi lain yang ingin Anda sampaikan kepada calon pemberi kerja yang relevan dengan posisi ini.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surat Lamaran</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tuliskan surat lamaran Anda" 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Jelaskan mengapa Anda tertarik dengan posisi ini dan mengapa Anda adalah kandidat yang tepat.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Syarat dan Ketentuan
                      </FormLabel>
                      <FormDescription>
                        Dengan mencentang ini, Anda menyetujui syarat dan ketentuan yang berlaku untuk proses pelamaran pekerjaan ini.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Mengirimkan lamaran...
                  </>
                ) : (
                  "Kirim Lamaran"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 