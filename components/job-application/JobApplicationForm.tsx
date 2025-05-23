"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  LoaderCircle, 
  FileText, 
  Download, 
  Upload, 
  X, 
  Calendar, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Building,
  Wallet
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Import our JobApplication context
import { useJobApplication, jobApplicationSchema } from "@/lib/context/JobApplicationContext";

// Form schema type definition using our schema from context
type ApplicationFormValues = z.infer<typeof jobApplicationSchema>;

interface JobApplicationFormProps {
  jobId: string;
}

// Helper function to format date
const formatDate = (dateString: string | Date | undefined | null) => {
  if (!dateString) return "N/A";
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch (e) {
    return String(dateString);
  }
};

// Helper function to format currency
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return "N/A";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function JobApplicationForm({ jobId }: JobApplicationFormProps) {
  // Use our job application context
  const { 
    data, 
    isSubmitting, 
    updateForm, 
    submitApplication 
  } = useJobApplication();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize form with default values from context
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      jobId: jobId,
      fullName: data.fullName || "",
      email: data.email || "",
      phone: data.phone || "",
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

  // Handle CV file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Validate file type (PDF, DOC, DOCX)
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Format file tidak didukung",
        description: "Harap unggah file dalam format PDF, DOC, atau DOCX",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Ukuran file terlalu besar",
        description: "Ukuran file maksimal adalah 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };
  
  // Handle CV upload
  const uploadCV = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Update form with the new CV file URL
      updateForm({ cvFileUrl: data.url });
      
      toast({
        title: "CV berhasil diunggah",
        description: "CV Anda telah berhasil diunggah dan akan digunakan dalam lamaran ini",
      });
      
      // Clear the file input
      setFile(null);
      
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: "Gagal mengunggah CV",
        description: "Terjadi kesalahan saat mengunggah CV. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove uploaded CV file
  const removeFile = () => {
    setFile(null);
  };

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
        // Handle validation errors from Zod or API
        if ('form' in (error as any)) {
          toast({
            title: "Error",
            description: (error as any).form || "Failed to submit application. Please try again.",
            variant: "destructive",
          });
        }
        
        // Set field errors
        Object.entries(error as Record<string, string>).forEach(([field, message]) => {
          form.setError(field as any, { message });
        });
      } else {
        // Generic error
        toast({
          title: "Error",
          description: "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    }
  }

  const hasCvFile = !!data.cvFileUrl;

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
              {hasCvFile && (
                <div className="mb-6 rounded-md border p-4 bg-blue-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3 border rounded-lg flex items-center justify-center p-3 bg-white">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="w-full md:w-2/3">
                      <h3 className="font-medium text-gray-900">CV Tersedia</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        CV yang sudah Anda unggah sebelumnya dapat digunakan dalam lamaran ini
                      </p>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-sm" 
                          type="button" 
                          asChild
                        >
                          <a href={data.cvFileUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            Lihat CV
                          </a>
                        </Button>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="shareData"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Gunakan CV ini dalam lamaran
                              </FormLabel>
                              <FormDescription>
                                Dengan mencentang ini, CV Anda yang tersimpan akan digunakan dalam lamaran pekerjaan ini.
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* New CV Upload Section */}
              <div className="mb-6 rounded-md border p-4">
                <h3 className="font-medium text-gray-900 mb-2">Unggah CV Baru</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Anda dapat mengunggah CV baru untuk lamaran ini. Format yang didukung: PDF, DOC, DOCX (Maks. 5MB)
                </p>
                
                {file ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={uploadCV}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <LoaderCircle className="h-4 w-4 mr-1 animate-spin" />
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            <span>Unggah</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={removeFile}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-md">
                    <label htmlFor="cv-upload" className="flex flex-col items-center cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Klik untuk memilih file</span>
                      <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              {!hasCvFile && !file && (
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
              )}
              
              {/* Enhanced Profile Data Display Section */}
              {data.shareData && (
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium">Informasi Profil Anda</h3>
                  </div>
                  <Separator />
                  
                  <div className="rounded-md border p-4">
                    <div className="space-y-6">
                      {/* Personal Information Section */}
                      <div>
                        <div className="flex items-center gap-2 pb-2 border-b mb-3">
                          <User className="h-4 w-4 text-blue-500" />
                          <h4 className="text-base font-medium">Informasi Pribadi</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.tanggalLahir && (
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Tanggal Lahir</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <p>{formatDate(data.tanggalLahir)}</p>
                              </div>
                            </div>
                          )}
                          
                          {data.jenisKelamin && (
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <p>{data.jenisKelamin}</p>
                              </div>
                            </div>
                          )}
                          
                          {data.education && (
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">Pendidikan Terakhir</p>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className="font-normal">{data.education}</Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Work Experience Section */}
                      {(data.pengalamanKerjaTerakhir || data.levelPengalaman || data.gajiTerakhir) && (
                        <div>
                          <div className="flex items-center gap-2 pb-2 border-b mb-3">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            <h4 className="text-base font-medium">Pengalaman Kerja</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.pengalamanKerjaTerakhir && (
                              <div className="flex flex-col space-y-1 col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Pengalaman Kerja Terakhir</p>
                                <div className="border rounded-md p-3">
                                  <p className="font-medium">{data.pengalamanKerjaTerakhir.posisi || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">{data.pengalamanKerjaTerakhir.namaPerusahaan || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                            
                            {data.levelPengalaman && (
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Level Pengalaman</p>
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <Badge>{data.levelPengalaman}</Badge>
                                </div>
                              </div>
                            )}
                            
                            {data.gajiTerakhir !== undefined && data.gajiTerakhir !== null && (
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Gaji Terakhir</p>
                                <div className="flex items-center gap-2">
                                  <Wallet className="h-4 w-4 text-muted-foreground" />
                                  <p>{formatCurrency(data.gajiTerakhir)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {data.pengalamanKerjaFull && data.pengalamanKerjaFull.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-muted-foreground mb-2">Riwayat Pekerjaan:</p>
                              <div className="space-y-3">
                                {data.pengalamanKerjaFull.map((pengalaman, index) => (
                                  <div key={index} className="border rounded-md p-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                      <p className="font-medium">{pengalaman.posisi || 'N/A'}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(pengalaman.tanggalMulai)} - {pengalaman.tanggalSelesai ? formatDate(pengalaman.tanggalSelesai) : 'Sekarang'}
                                      </p>
                                    </div>
                                    <p className="text-sm">{pengalaman.namaPerusahaan || 'N/A'}</p>
                                    {/* Only render if deskripsiPekerjaan exists and is not null */}
                                    {typeof pengalaman.deskripsiPekerjaan === 'string' && pengalaman.deskripsiPekerjaan !== '' && (
                                      <p className="text-sm text-muted-foreground mt-2">{pengalaman.deskripsiPekerjaan}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Education History Section */}
                      {data.pendidikanFull && data.pendidikanFull.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 pb-2 border-b mb-3">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            <h4 className="text-base font-medium">Riwayat Pendidikan</h4>
                          </div>
                          <div className="space-y-3">
                            {data.pendidikanFull.map((pendidikan, index) => (
                              <div key={index} className="border rounded-md p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-sm font-medium">{pendidikan.jenjangPendidikan || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">{pendidikan.namaInstitusi || 'N/A'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                      {pendidikan.bidangStudi && <span className="font-medium">{pendidikan.bidangStudi}</span>}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Lulus: {formatDate(pendidikan.tanggalLulus)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        Data profil di atas akan disertakan dalam lamaran Anda. Jika Anda ingin mengedit data profil, silakan kunjungi
                        <Link href="/job-seeker/profile" className="font-medium underline ml-1">halaman profil</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
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
                            <RadioGroupItem value="SD" id="SD" />
                            <Label htmlFor="SD">SD</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="SMP" id="SMP" />
                            <Label htmlFor="SMP">SMP</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="SMA/SMK" id="SMA/SMK" />
                            <Label htmlFor="SMA/SMK">SMA/SMK</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="D1" id="D1" />
                            <Label htmlFor="D1">D1</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="D2" id="D2" />
                            <Label htmlFor="D2">D2</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="D3" id="D3" />
                            <Label htmlFor="D3">D3</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* @ts-ignore - Adding type ignore to resolve RadioGroupItem typing issues */}
                            <RadioGroupItem value="D4" id="D4" />
                            <Label htmlFor="D4">D4</Label>
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
                    <FormLabel>Informasi Tambahan <span className="text-gray-500">(Opsional)</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Bagikan informasi, wawasan, dan pengalaman lain yang relevan untuk perusahaan" 
                        className="min-h-[180px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Tuliskan informasi tambahan seperti pengalaman, keterampilan, dan minat Anda yang relevan dengan posisi ini.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Saya menyetujui <Link href="/syarat-dan-ketentuan" className="text-blue-600 hover:underline" target="_blank">Syarat & Ketentuan</Link>
                      </FormLabel>
                      <FormDescription>
                        Dengan mencentang, Anda menyatakan bahwa informasi yang Anda berikan adalah benar dan akurat.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Kirim Lamaran
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 