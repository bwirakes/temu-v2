"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  User, 
  Plus,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import ProfileSkeleton from "./ProfileSkeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import { SectionCard, InfoItem } from "./ProfileComponents";
import { CV } from "./CV";

// Constants for form options
const levelPengalamanOptions = [
  "Baru lulus",
  "Pengalaman magang",
  "Kurang dari 1 tahun", 
  "1-2 tahun",
  "3-5 tahun",
  "5-10 tahun",
  "10 tahun lebih",
];

// Define types locally to avoid import issues
type Pendidikan = {
  id: string;
  namaInstitusi: string;
  lokasi: string;
  jenjangPendidikan: string;
  bidangStudi: string;
  tanggalLulus: string;
  deskripsiTambahan?: string;
  masihBelajar: boolean;
};

type LokasiKerjaType = "Work From Office (WFO)" | "Work From Home (WFH)" | "Hybrid";

type PengalamanKerja = {
  id: string;
  namaPerusahaan: string;
  posisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lokasi: string;
  lokasiKerja: LokasiKerjaType;
  deskripsiPekerjaan: string;
  alasanKeluar?: string;
  masihBekerja: boolean;
};

// Main profile data type - updated to match the server-side ProfileData type
interface ProfileData {
  id: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tanggalLahir: string;
  tempatLahir?: string | null;
  jenisKelamin?: string | null;
  cvFileUrl?: string | null;
  cvUploadDate?: string | Date | null;
  profilePhotoUrl?: string | null;
  levelPengalaman?: string | null;
  ekspektasiKerja?: any;
  alamat?: any;
  pendidikan?: Pendidikan[];
  pengalamanKerja?: PengalamanKerja[];
}

interface ProfileClientProps {
  initialProfileData: ProfileData | null;
}

export default function ProfileClient({ initialProfileData }: ProfileClientProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(initialProfileData);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [activeTab, setActiveTab] = useState("informasi-dasar");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for education editing
  const [editingPendidikan, setEditingPendidikan] = useState<boolean>(false);
  // Initialize pendidikanList from initialProfileData
  const [pendidikanList, setPendidikanList] = useState<Pendidikan[]>(
    initialProfileData?.pendidikan && Array.isArray(initialProfileData.pendidikan) 
      ? initialProfileData.pendidikan 
      : []
  );
  
  // State for work experience editing
  const [editingPengalaman, setEditingPengalaman] = useState<boolean>(false);
  // Initialize pengalamanList from initialProfileData
  const [pengalamanList, setPengalamanList] = useState<PengalamanKerja[]>(
    initialProfileData?.pengalamanKerja && Array.isArray(initialProfileData.pengalamanKerja) 
      ? initialProfileData.pengalamanKerja 
      : []
  );
  const [tidakAdaPengalaman, setTidakAdaPengalaman] = useState<boolean>(
    !(initialProfileData?.pengalamanKerja && Array.isArray(initialProfileData.pengalamanKerja) && initialProfileData.pengalamanKerja.length > 0)
  );
  
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Check authentication client-side to handle session expiry during client navigation
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/job-seeker/profile');
    }
  }, [status, router]);

  // Handle editing mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset the form
      setEditData({});
    } else {
      // If we're entering edit mode, initialize edit data with current values
      setEditData({
        namaLengkap: profileData?.namaLengkap,
        nomorTelepon: profileData?.nomorTelepon,
        tanggalLahir: profileData?.tanggalLahir,
        tempatLahir: profileData?.tempatLahir,
        jenisKelamin: profileData?.jenisKelamin,
        levelPengalaman: profileData?.levelPengalaman,
      });
    }
    
    setIsEditing(!isEditing);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev: Partial<ProfileData>) => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setEditData((prev: Partial<ProfileData>) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch("/api/job-seeker/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save changes");
      }
      
      const result = await response.json();
      
      // Update local state with the saved data
      if (profileData) {
        setProfileData({
          ...profileData,
          ...editData
        });
      }
      
      // Exit edit mode
      setIsEditing(false);
      setEditData({});
      
      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      console.error("Error saving profile changes:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile photo update
  const handleProfilePhotoUpdated = (url: string) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        profilePhotoUrl: url
      });
    }
  };

  // Format dates for display
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "";
    if (dateString === "Sekarang") return "Sekarang";
    
    try {
      const date = new Date(dateString);
      return format(date, "MM/yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Show loading state
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  // Show error state if profile not found
  if (!profileData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Profil tidak ditemukan</h2>
        <p className="text-gray-500 mb-4">
          Kami tidak dapat menemukan data profil Anda. Silakan lengkapi proses onboarding.
        </p>
        <Button asChild>
          <a href="/job-seeker/onboarding">Mulai Onboarding</a>
        </Button>
      </div>
    );
  }

  // Get user initials for display
  const initials = profileData.namaLengkap
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile sidebar */}
        <div className="w-full md:w-1/3">
          <SectionCard
            title="Informasi Profil"
            icon={<User className="h-4 w-4 text-blue-700" />}
            action={
              !isEditing ? (
                <Button variant="ghost" size="sm" onClick={handleEditToggle} className="transition-colors duration-200 h-7 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              ) : null
            }
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <ProfilePhotoUploader 
                  currentPhotoUrl={profileData.profilePhotoUrl} 
                  userName={profileData.namaLengkap}
                  onPhotoUploaded={handleProfilePhotoUpdated}
                />
              </div>
              
              <h2 className="text-lg font-semibold mt-3">
                {isEditing ? (
                  <Input 
                    name="namaLengkap" 
                    value={editData.namaLengkap || ""} 
                    onChange={handleInputChange}
                    className="text-center transition-colors duration-200 focus:border-blue-400 h-8 text-sm"
                  />
                ) : (
                  profileData.namaLengkap
                )}
              </h2>
              
              {!isEditing && profileData.levelPengalaman && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  {profileData.levelPengalaman}
                </Badge>
              )}
              
              {isEditing && (
                <div className="mt-3 w-full space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Level Pengalaman</Label>
                  <Select 
                    value={editData.levelPengalaman || ""} 
                    onValueChange={(value) => handleSelectChange("levelPengalaman", value)}
                  >
                    <SelectTrigger className="transition-colors duration-200 focus:border-blue-400 h-8 text-sm">
                      <SelectValue placeholder="Pilih level pengalaman" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelPengalamanOptions.map((option) => (
                        <SelectItem key={option} value={option} className="text-sm">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {isEditing ? (
                <div className="flex gap-2 mt-3 w-full">
                  <Button variant="outline" onClick={handleEditToggle} className="flex-1 transition-colors duration-200 h-8 text-xs">
                    Batal
                  </Button>
                  <Button onClick={handleSaveChanges} className="flex-1 transition-colors duration-200 h-8 text-xs" disabled={isSaving}>
                    {isSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 mt-5 w-full">
                  <InfoItem 
                    label="Email" 
                    value={
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{profileData.email}</span>
                      </div>
                    }
                  />
                  <InfoItem 
                    label="Nomor Telepon" 
                    value={
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{profileData.nomorTelepon}</span>
                      </div>
                    }
                  />
                  {profileData.alamat?.kota && (
                    <InfoItem 
                      label="Lokasi" 
                      value={
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{profileData.alamat.kota}, {profileData.alamat.provinsi}</span>
                        </div>
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </SectionCard>
        </div>
        
        {/* Main content */}
        <div className="w-full md:w-2/3">
          <SectionCard
            title="Informasi Detail"
            icon={<FileText className="h-4 w-4 text-blue-700" />}
          >
            <Tabs defaultValue="informasi-dasar" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-3">
                <TabsTrigger value="informasi-dasar" className="transition-all duration-200 text-sm py-1">Informasi Dasar</TabsTrigger>
                <TabsTrigger value="pendidikan" className="transition-all duration-200 text-sm py-1">Pendidikan</TabsTrigger>
                <TabsTrigger value="pengalaman" className="transition-all duration-200 text-sm py-1">Pengalaman</TabsTrigger>
              </TabsList>
              
              <TabsContent value="informasi-dasar">
                <div className="space-y-4">
                  {/* Basic information tab content - simplified */}
                  <div className="p-4 bg-gray-50 rounded-md text-sm">
                    Selain informasi kontak, profil Anda mencakup data tentang pendidikan dan pengalaman kerja. 
                    Klik tab di atas untuk melihat dan mengedit informasi tersebut.
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pendidikan">
                <div className="space-y-3">
                  {/* Education tab content - simplified */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Riwayat Pendidikan</h3>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPendidikan(!editingPendidikan)}>
                      {editingPendidikan ? <X className="h-3 w-3 mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
                      {editingPendidikan ? "Batal" : "Edit"}
                    </Button>
                  </div>
                  
                  {pendidikanList.length > 0 ? (
                    <div className="space-y-3">
                      {pendidikanList.map((pendidikan, index) => (
                        <Card key={pendidikan.id || index} className="transition-shadow duration-200 hover:shadow-sm">
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm font-medium">{pendidikan.namaInstitusi}</CardTitle>
                            <CardDescription className="text-xs">
                              {pendidikan.jenjangPendidikan}, {pendidikan.bidangStudi}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed">
                      <p className="text-xs text-muted-foreground">Belum ada data pendidikan</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pengalaman">
                <div className="space-y-3">
                  {/* Work experience tab content - simplified */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Pengalaman Kerja</h3>
                    <Button variant="ghost" size="sm" onClick={() => setEditingPengalaman(!editingPengalaman)}>
                      {editingPengalaman ? <X className="h-3 w-3 mr-1" /> : <Edit className="h-3 w-3 mr-1" />}
                      {editingPengalaman ? "Batal" : "Edit"}
                    </Button>
                  </div>
                  
                  {pengalamanList.length > 0 ? (
                    <div className="space-y-3">
                      {pengalamanList.map((pengalaman, index) => (
                        <Card key={pengalaman.id || index} className="transition-shadow duration-200 hover:shadow-sm">
                          <CardHeader className="pb-2 pt-3">
                            <div className="flex justify-between">
                              <div>
                                <CardTitle className="text-sm font-medium">{pengalaman.posisi}</CardTitle>
                                <CardDescription className="text-xs">
                                  {pengalaman.namaPerusahaan} • {pengalaman.lokasiKerja}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">
                                  {formatDisplayDate(pengalaman.tanggalMulai)} - {pengalaman.tanggalSelesai === "Sekarang" ? "Sekarang" : formatDisplayDate(pengalaman.tanggalSelesai)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{pengalaman.lokasi}</p>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed">
                      <p className="text-xs text-muted-foreground">Belum ada data pengalaman kerja</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </SectionCard>
        </div>
      </div>
      
      {/* CV section */}
      {profileData.cvFileUrl && (
        <CV cvFileUrl={profileData.cvFileUrl} cvUploadDate={profileData.cvUploadDate} />
      )}
    </div>
  );
}
