"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  User, 
  Plus,
  X,
  Save,
  Trash2
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
import { v4 as uuidv4 } from 'uuid';

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
  namaInstitusi?: string;
  lokasi?: string;
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
  lokasi?: string;
  lokasiKerja?: LokasiKerjaType;
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
  const [currentPendidikan, setCurrentPendidikan] = useState<Pendidikan | null>(null);
  const [pendidikanFormMode, setPendidikanFormMode] = useState<'add' | 'edit' | null>(null);
  
  // State for work experience editing
  const [editingPengalaman, setEditingPengalaman] = useState<boolean>(false);
  // Initialize pengalamanList from initialProfileData
  const [pengalamanList, setPengalamanList] = useState<PengalamanKerja[]>(
    initialProfileData?.pengalamanKerja && Array.isArray(initialProfileData.pengalamanKerja) 
      ? initialProfileData.pengalamanKerja 
      : []
  );
  const [currentPengalaman, setCurrentPengalaman] = useState<PengalamanKerja | null>(null);
  const [pengalamanFormMode, setPengalamanFormMode] = useState<'add' | 'edit' | null>(null);
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

  // New handlers for education
  const handleAddEducation = () => {
    setCurrentPendidikan({
      id: uuidv4(),
      jenjangPendidikan: '',
      bidangStudi: '',
      tanggalLulus: '',
      masihBelajar: false
    });
    setPendidikanFormMode('add');
  };

  const handleEditEducation = (pendidikan: Pendidikan) => {
    setCurrentPendidikan(pendidikan);
    setPendidikanFormMode('edit');
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/job-seeker/profile/pendidikan/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete education");
      }
      
      // Update local state
      setPendidikanList(prevList => prevList.filter(item => item.id !== id));
      
      // Update profile data
      if (profileData) {
        setProfileData({
          ...profileData,
          pendidikan: pendidikanList.filter(item => item.id !== id)
        });
      }
      
      toast.success("Data pendidikan berhasil dihapus");
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menghapus data pendidikan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEducation = async (educationData: Pendidikan) => {
    try {
      setIsLoading(true);
      
      const method = pendidikanFormMode === 'add' ? 'POST' : 'PUT';
      const url = pendidikanFormMode === 'add' 
        ? '/api/job-seeker/profile/pendidikan' 
        : `/api/job-seeker/profile/pendidikan/${educationData.id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(educationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save education data");
      }
      
      const savedEducation = await response.json();
      
      // Update local state
      if (pendidikanFormMode === 'add') {
        setPendidikanList(prevList => [...prevList, savedEducation]);
      } else {
        setPendidikanList(prevList => 
          prevList.map(item => item.id === savedEducation.id ? savedEducation : item)
        );
      }
      
      // Update profile data
      if (profileData) {
        const updatedPendidikan = pendidikanFormMode === 'add'
          ? [...(profileData.pendidikan || []), savedEducation]
          : (profileData.pendidikan || []).map(item => 
              item.id === savedEducation.id ? savedEducation : item
            );
            
        setProfileData({
          ...profileData,
          pendidikan: updatedPendidikan
        });
      }
      
      // Reset form
      setCurrentPendidikan(null);
      setPendidikanFormMode(null);
      
      toast.success(
        pendidikanFormMode === 'add' 
          ? "Data pendidikan berhasil ditambahkan" 
          : "Data pendidikan berhasil diperbarui"
      );
    } catch (error) {
      console.error("Error saving education data:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan data pendidikan");
    } finally {
      setIsLoading(false);
    }
  };

  // New handlers for work experience
  const handleAddWorkExperience = () => {
    setCurrentPengalaman({
      id: uuidv4(),
      namaPerusahaan: '',
      posisi: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      deskripsiPekerjaan: '',
      masihBekerja: false
    });
    setPengalamanFormMode('add');
  };

  const handleEditWorkExperience = (pengalaman: PengalamanKerja) => {
    setCurrentPengalaman(pengalaman);
    setPengalamanFormMode('edit');
  };

  const handleDeleteWorkExperience = async (id: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/job-seeker/profile/pengalaman/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete work experience");
      }
      
      // Update local state
      setPengalamanList(prevList => prevList.filter(item => item.id !== id));
      
      // Update profile data
      if (profileData) {
        setProfileData({
          ...profileData,
          pengalamanKerja: pengalamanList.filter(item => item.id !== id)
        });
      }
      
      toast.success("Data pengalaman kerja berhasil dihapus");
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menghapus data pengalaman kerja");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkExperience = async (workExperienceData: PengalamanKerja) => {
    try {
      setIsLoading(true);
      
      const method = pengalamanFormMode === 'add' ? 'POST' : 'PUT';
      const url = pengalamanFormMode === 'add' 
        ? '/api/job-seeker/profile/pengalaman' 
        : `/api/job-seeker/profile/pengalaman/${workExperienceData.id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workExperienceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save work experience data");
      }
      
      const savedExperience = await response.json();
      
      // Update local state
      if (pengalamanFormMode === 'add') {
        setPengalamanList(prevList => [...prevList, savedExperience]);
      } else {
        setPengalamanList(prevList => 
          prevList.map(item => item.id === savedExperience.id ? savedExperience : item)
        );
      }
      
      // Update profile data
      if (profileData) {
        const updatedPengalaman = pengalamanFormMode === 'add'
          ? [...(profileData.pengalamanKerja || []), savedExperience]
          : (profileData.pengalamanKerja || []).map(item => 
              item.id === savedExperience.id ? savedExperience : item
            );
            
        setProfileData({
          ...profileData,
          pengalamanKerja: updatedPengalaman
        });
      }
      
      // Reset form
      setCurrentPengalaman(null);
      setPengalamanFormMode(null);
      setTidakAdaPengalaman(false);
      
      toast.success(
        pengalamanFormMode === 'add' 
          ? "Data pengalaman kerja berhasil ditambahkan" 
          : "Data pengalaman kerja berhasil diperbarui"
      );
    } catch (error) {
      console.error("Error saving work experience data:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan data pengalaman kerja");
    } finally {
      setIsLoading(false);
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
                      isEditing ? (
                        <Input 
                          name="nomorTelepon" 
                          value={editData.nomorTelepon || ""} 
                          onChange={handleInputChange}
                          className="text-sm h-8"
                        />
                      ) : (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{profileData.nomorTelepon}</span>
                        </div>
                      )
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
                  {/* Basic information tab content */}
                  {isEditing ? (
                    <div className="space-y-4 p-4 border rounded-md">
                      <h3 className="text-sm font-medium">Edit Informasi Dasar</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tanggalLahir" className="text-sm">Tanggal Lahir</Label>
                          <Input
                            id="tanggalLahir"
                            name="tanggalLahir"
                            type="date"
                            value={editData.tanggalLahir || ""}
                            onChange={handleInputChange}
                            className="text-sm h-9"
                          />
                        </div>
                        
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <Label htmlFor="jenisKelamin" className="text-sm">Jenis Kelamin</Label>
                          <Select
                            value={editData.jenisKelamin || ""}
                            onValueChange={(value) => handleSelectChange("jenisKelamin", value)}
                          >
                            <SelectTrigger id="jenisKelamin" className="text-sm h-9">
                              <SelectValue placeholder="Pilih jenis kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                              <SelectItem value="Perempuan">Perempuan</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3">
                        <h3 className="text-sm font-medium">Informasi Dasar</h3>
                      </div>
                      
                      <div className="divide-y">
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-sm text-gray-500">Tanggal Lahir</span>
                          <span className="text-sm font-medium">
                            {profileData.tanggalLahir ? new Date(profileData.tanggalLahir).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }) : 'Tidak diisi'}
                          </span>
                        </div>
                        
                        <div className="px-4 py-3 flex justify-between items-center">
                          <span className="text-sm text-gray-500">Jenis Kelamin</span>
                          <span className="text-sm font-medium">
                            {profileData.jenisKelamin || 'Tidak diisi'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-gray-50 rounded-md text-sm">
                    <p>Informasi dasar Anda digunakan oleh perekrut untuk mempertimbangkan kesesuaian Anda dengan posisi yang ditawarkan.</p>
                    <p className="mt-1">Selain informasi dasar, profil Anda juga mencakup data tentang pendidikan dan pengalaman kerja.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pendidikan">
                <div className="space-y-3">
                  {/* Education tab content - simplified */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Riwayat Pendidikan</h3>
                    {!pendidikanFormMode && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleAddEducation}>
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Education form */}
                  {pendidikanFormMode && currentPendidikan && (
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {pendidikanFormMode === 'add' ? 'Tambah Pendidikan' : 'Edit Pendidikan'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="jenjangPendidikan" className="text-xs">Jenjang Pendidikan</Label>
                            <Select
                              value={currentPendidikan.jenjangPendidikan}
                              onValueChange={(value) => setCurrentPendidikan({
                                ...currentPendidikan,
                                jenjangPendidikan: value
                              })}
                            >
                              <SelectTrigger id="jenjangPendidikan" className="text-sm h-9">
                                <SelectValue placeholder="Pilih jenjang pendidikan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                                <SelectItem value="D3">D3</SelectItem>
                                <SelectItem value="S1">S1</SelectItem>
                                <SelectItem value="S2">S2</SelectItem>
                                <SelectItem value="S3">S3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="bidangStudi" className="text-xs">Bidang Studi</Label>
                            <Input
                              id="bidangStudi"
                              value={currentPendidikan.bidangStudi}
                              onChange={(e) => setCurrentPendidikan({
                                ...currentPendidikan,
                                bidangStudi: e.target.value
                              })}
                              className="text-sm h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="namaInstitusi" className="text-xs">Nama Institusi</Label>
                            <Input
                              id="namaInstitusi"
                              value={currentPendidikan.namaInstitusi || ''}
                              onChange={(e) => setCurrentPendidikan({
                                ...currentPendidikan,
                                namaInstitusi: e.target.value
                              })}
                              className="text-sm h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lokasi" className="text-xs">Lokasi</Label>
                            <Input
                              id="lokasi"
                              value={currentPendidikan.lokasi || ''}
                              onChange={(e) => setCurrentPendidikan({
                                ...currentPendidikan,
                                lokasi: e.target.value
                              })}
                              className="text-sm h-9"
                              placeholder="Contoh: Jakarta, Indonesia"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tanggalLulus" className="text-xs">Tanggal Lulus</Label>
                            <Input
                              id="tanggalLulus"
                              type="date"
                              value={currentPendidikan.tanggalLulus}
                              onChange={(e) => setCurrentPendidikan({
                                ...currentPendidikan,
                                tanggalLulus: e.target.value
                              })}
                              className="text-sm h-9"
                              disabled={currentPendidikan.masihBelajar}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-6">
                            <input
                              type="checkbox"
                              id="masihBelajar"
                              checked={currentPendidikan.masihBelajar}
                              onChange={(e) => setCurrentPendidikan({
                                ...currentPendidikan,
                                masihBelajar: e.target.checked,
                                tanggalLulus: e.target.checked ? '' : currentPendidikan.tanggalLulus
                              })}
                              className="h-4 w-4 text-blue-600"
                            />
                            <Label htmlFor="masihBelajar" className="text-xs">Masih dalam pendidikan</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="deskripsiTambahan" className="text-xs">Deskripsi Tambahan (Opsional)</Label>
                          <textarea
                            id="deskripsiTambahan"
                            value={currentPendidikan.deskripsiTambahan || ''}
                            onChange={(e) => setCurrentPendidikan({
                              ...currentPendidikan,
                              deskripsiTambahan: e.target.value
                            })}
                            className="w-full min-h-[100px] text-sm p-2 border rounded-md"
                            placeholder="Tambahkan informasi relevan seperti prestasi, kegiatan, atau detail lainnya"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setCurrentPendidikan(null);
                              setPendidikanFormMode(null);
                            }}
                          >
                            Batal
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveEducation(currentPendidikan)}
                            disabled={isLoading || !currentPendidikan.jenjangPendidikan || !currentPendidikan.bidangStudi || (!currentPendidikan.masihBelajar && !currentPendidikan.tanggalLulus)}
                          >
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Education list */}
                  {!pendidikanFormMode && pendidikanList.length > 0 ? (
                    <div className="space-y-3">
                      {pendidikanList.map((pendidikan, index) => (
                        <Card key={pendidikan.id || index} className="transition-shadow duration-200 hover:shadow-sm">
                          <CardHeader className="p-3 pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-sm font-medium">
                                {pendidikan.jenjangPendidikan}{pendidikan.bidangStudi ? `: ${pendidikan.bidangStudi}` : ''}
                              </CardTitle>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditEducation(pendidikan)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDeleteEducation(pendidikan.id)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-3 pt-0 pb-3">
                            {pendidikan.namaInstitusi && (
                              <p className="text-xs text-gray-600">
                                {pendidikan.namaInstitusi}{pendidikan.lokasi ? `, ${pendidikan.lokasi}` : ''}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {pendidikan.masihBelajar 
                                ? 'Masih dalam pendidikan' 
                                : pendidikan.tanggalLulus 
                                  ? `Lulus: ${new Date(pendidikan.tanggalLulus).toLocaleDateString('id-ID', {month: 'long', year: 'numeric'})}` 
                                  : ''}
                            </p>
                            {pendidikan.deskripsiTambahan && (
                              <p className="text-xs text-gray-600 mt-2 italic">
                                {pendidikan.deskripsiTambahan}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    !pendidikanFormMode && (
                      <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed">
                        <p className="text-xs text-muted-foreground">Belum ada data pendidikan</p>
                        <Button variant="link" size="sm" onClick={handleAddEducation} className="mt-2 h-7 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Pendidikan
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pengalaman">
                <div className="space-y-3">
                  {/* Work experience tab content */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Pengalaman Kerja</h3>
                    {!pengalamanFormMode && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleAddWorkExperience}>
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Work experience form */}
                  {pengalamanFormMode && currentPengalaman && (
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          {pengalamanFormMode === 'add' ? 'Tambah Pengalaman' : 'Edit Pengalaman'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="posisi" className="text-xs">Posisi</Label>
                            <Input
                              id="posisi"
                              value={currentPengalaman.posisi}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                posisi: e.target.value
                              })}
                              className="text-sm h-9"
                              placeholder="Contoh: Software Engineer"
                            />
                          </div>
                          
                          <div className="space-y-2 col-span-1 md:col-span-2">
                            <Label htmlFor="namaPerusahaan" className="text-xs">Nama Perusahaan</Label>
                            <Input
                              id="namaPerusahaan"
                              value={currentPengalaman.namaPerusahaan}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                namaPerusahaan: e.target.value
                              })}
                              className="text-sm h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lokasi" className="text-xs">Lokasi</Label>
                            <Input
                              id="lokasi"
                              value={currentPengalaman.lokasi || ''}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                lokasi: e.target.value
                              })}
                              className="text-sm h-9"
                              placeholder="Contoh: Jakarta, Indonesia"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lokasiKerja" className="text-xs">Jenis Lokasi Kerja</Label>
                            <Select
                              value={currentPengalaman.lokasiKerja || ''}
                              onValueChange={(value) => setCurrentPengalaman({
                                ...currentPengalaman,
                                lokasiKerja: value as LokasiKerjaType
                              })}
                            >
                              <SelectTrigger id="lokasiKerja" className="text-sm h-9">
                                <SelectValue placeholder="Pilih jenis lokasi kerja" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Work From Office (WFO)">Work From Office (WFO)</SelectItem>
                                <SelectItem value="Work From Home (WFH)">Work From Home (WFH)</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tanggalMulai" className="text-xs">Tanggal Mulai</Label>
                            <Input
                              id="tanggalMulai"
                              type="date"
                              value={currentPengalaman.tanggalMulai}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                tanggalMulai: e.target.value
                              })}
                              className="text-sm h-9"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tanggalSelesai" className="text-xs">Tanggal Selesai</Label>
                            <Input
                              id="tanggalSelesai"
                              type="date"
                              value={currentPengalaman.tanggalSelesai !== "Sekarang" ? currentPengalaman.tanggalSelesai : ''}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                tanggalSelesai: e.target.value
                              })}
                              className="text-sm h-9"
                              disabled={currentPengalaman.masihBekerja}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-6 col-span-1 md:col-span-2">
                            <input
                              type="checkbox"
                              id="masihBekerja"
                              checked={currentPengalaman.masihBekerja}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                masihBekerja: e.target.checked,
                                tanggalSelesai: e.target.checked ? "Sekarang" : currentPengalaman.tanggalSelesai === "Sekarang" ? '' : currentPengalaman.tanggalSelesai
                              })}
                              className="h-4 w-4 text-blue-600"
                            />
                            <Label htmlFor="masihBekerja" className="text-xs">Saya masih bekerja di sini</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="deskripsiPekerjaan" className="text-xs">Deskripsi Pekerjaan</Label>
                          <textarea
                            id="deskripsiPekerjaan"
                            value={currentPengalaman.deskripsiPekerjaan}
                            onChange={(e) => setCurrentPengalaman({
                              ...currentPengalaman,
                              deskripsiPekerjaan: e.target.value
                            })}
                            className="w-full min-h-[100px] text-sm p-2 border rounded-md"
                            placeholder="Jelaskan tanggung jawab dan pencapaian Anda"
                          />
                        </div>
                        
                        {!currentPengalaman.masihBekerja && (
                          <div className="space-y-2">
                            <Label htmlFor="alasanKeluar" className="text-xs">Alasan Keluar (Opsional)</Label>
                            <textarea
                              id="alasanKeluar"
                              value={currentPengalaman.alasanKeluar || ''}
                              onChange={(e) => setCurrentPengalaman({
                                ...currentPengalaman,
                                alasanKeluar: e.target.value
                              })}
                              className="w-full min-h-[80px] text-sm p-2 border rounded-md"
                              placeholder="Jelaskan alasan Anda pindah atau keluar dari perusahaan ini"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setCurrentPengalaman(null);
                              setPengalamanFormMode(null);
                            }}
                          >
                            Batal
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveWorkExperience(currentPengalaman)}
                            disabled={
                              isLoading || 
                              !currentPengalaman.posisi || 
                              !currentPengalaman.namaPerusahaan || 
                              !currentPengalaman.tanggalMulai || 
                              (!currentPengalaman.masihBekerja && !currentPengalaman.tanggalSelesai) ||
                              !currentPengalaman.deskripsiPekerjaan
                            }
                          >
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Work experience list */}
                  {!pengalamanFormMode && pengalamanList.length > 0 ? (
                    <div className="space-y-3">
                      {pengalamanList.map((pengalaman, index) => (
                        <Card key={pengalaman.id || index} className="transition-shadow duration-200 hover:shadow-sm">
                          <CardHeader className="pb-2 pt-3">
                            <div className="flex justify-between">
                              <div>
                                <CardTitle className="text-sm font-medium">{pengalaman.posisi}</CardTitle>
                                <CardDescription className="text-xs">
                                  {pengalaman.namaPerusahaan}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex space-x-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditWorkExperience(pengalaman)}>
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDeleteWorkExperience(pengalaman.id)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs font-medium">
                                  {formatDisplayDate(pengalaman.tanggalMulai)} - {pengalaman.tanggalSelesai === "Sekarang" ? "Sekarang" : formatDisplayDate(pengalaman.tanggalSelesai)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-3 pt-0 pb-3">
                            {pengalaman.lokasi && (
                              <p className="text-xs text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {pengalaman.lokasi}
                                {pengalaman.lokasiKerja && (
                                  <span className="ml-2 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-[10px]">
                                    {pengalaman.lokasiKerja}
                                  </span>
                                )}
                              </p>
                            )}
                            {pengalaman.deskripsiPekerjaan && (
                              <p className="text-xs text-gray-600 mt-2">
                                {pengalaman.deskripsiPekerjaan}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    !pengalamanFormMode && (
                      <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed">
                        <p className="text-xs text-muted-foreground">{tidakAdaPengalaman ? "Belum ada pengalaman kerja" : "Belum ada data pengalaman kerja"}</p>
                        <Button variant="link" size="sm" onClick={handleAddWorkExperience} className="mt-2 h-7 text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Pengalaman
                        </Button>
                      </div>
                    )
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
