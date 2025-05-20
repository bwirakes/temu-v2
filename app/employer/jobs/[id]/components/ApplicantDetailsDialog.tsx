"use client"

import { Applicant } from "../applicants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, differenceInYears } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, MapPin, Briefcase, GraduationCap, Phone, Mail, User, Calendar, ChevronsUpDown } from "lucide-react";

interface ApplicantDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: Applicant | null;
}

// Helper function to format currency (IDR)
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to calculate age from date of birth
const calculateAge = (dob: string | null | undefined) => {
  if (!dob) return null;
  try {
    return differenceInYears(new Date(), parseISO(dob));
  } catch (error) {
    console.error("Error calculating age:", error);
    return null;
  }
};

// Helper function to format date
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd MMMM yyyy", { locale: id });
  } catch (e) {
    console.warn("Invalid date string for formatting:", dateString);
    return "N/A";
  }
};

export function ApplicantDetailsDialog({ 
  isOpen, 
  onOpenChange, 
  applicant 
}: ApplicantDetailsDialogProps) {
  if (!applicant) return null;

  // Calculate age if we have date of birth
  const age = calculateAge(applicant.tanggalLahir);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detail Pelamar: {applicant.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="personal">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="personal" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Informasi Pribadi</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Pendidikan</span>
            </TabsTrigger>
            <TabsTrigger value="experience" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Pengalaman</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Preferensi</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nama</p>
                    <p>{applicant.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{applicant.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal Melamar</p>
                    <p>{formatDate(applicant.applicationDate)}</p>
                  </div>
                  {applicant.tanggalLahir && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tanggal Lahir</p>
                      <p>{formatDate(applicant.tanggalLahir)} {age ? `(${age} tahun)` : ""}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {applicant.jenisKelamin && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Jenis Kelamin</p>
                      <p>{applicant.jenisKelamin}</p>
                    </div>
                  )}
                  {applicant.kotaDomisili && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Kota Domisili</p>
                      <p>{applicant.kotaDomisili}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CV</p>
                    {applicant.cvFileUrl ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-1 h-8"
                        onClick={() => window.open(applicant.cvFileUrl!, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" /> Lihat CV
                      </Button>
                    ) : (
                      <p>Tidak tersedia</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informasi Pendidikan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Pendidikan Terakhir</p>
                  <Badge className="mt-1">{applicant.education || "Tidak tersedia"}</Badge>
                </div>

                {applicant.pendidikanFull && applicant.pendidikanFull.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Riwayat Pendidikan:</p>
                    {applicant.pendidikanFull.map((pendidikan, index) => (
                      <Card key={index} className="p-4 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Jenjang</p>
                            <p>{pendidikan.jenjangPendidikan || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Institusi</p>
                            <p>{pendidikan.namaInstitusi || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Bidang Studi</p>
                            <p>{pendidikan.bidangStudi || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Tanggal Lulus</p>
                            <p>{formatDate(pendidikan.tanggalLulus)}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada informasi riwayat pendidikan.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pengalaman Kerja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.levelPengalaman && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Level Pengalaman</p>
                    <Badge variant="outline" className="mt-1">
                      {applicant.levelPengalaman}
                    </Badge>
                  </div>
                )}

                {applicant.pengalamanKerjaTerakhir && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pengalaman Kerja Terakhir</p>
                    <div className="mt-1">
                      <p className="font-medium">
                        {applicant.pengalamanKerjaTerakhir.posisi || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {applicant.pengalamanKerjaTerakhir.namaPerusahaan || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {applicant.gajiTerakhir !== null && applicant.gajiTerakhir !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gaji Terakhir</p>
                    <p>{formatCurrency(applicant.gajiTerakhir)}</p>
                  </div>
                )}

                {applicant.pengalamanKerjaFull && applicant.pengalamanKerjaFull.length > 0 ? (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Riwayat Pekerjaan:</p>
                    <div className="space-y-4">
                      {applicant.pengalamanKerjaFull.map((pengalaman, index) => (
                        <Card key={index} className="p-4 border rounded-md">
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-medium">{pengalaman.posisi || "N/A"}</p>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(pengalaman.tanggalMulai)} - {pengalaman.tanggalSelesai ? formatDate(pengalaman.tanggalSelesai) : "Sekarang"}
                              </div>
                            </div>
                            <p className="text-sm">{pengalaman.namaPerusahaan || "N/A"}</p>
                            {pengalaman.deskripsiPekerjaan && (
                              <div className="pt-1">
                                <p className="text-sm font-medium text-muted-foreground">Deskripsi:</p>
                                <p className="text-sm whitespace-pre-line">{pengalaman.deskripsiPekerjaan}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Tidak ada informasi riwayat pekerjaan.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferensi & Ekspektasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.ekspektasiGaji && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ekspektasi Gaji</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p>
                        {formatCurrency(applicant.ekspektasiGaji.min)} - {formatCurrency(applicant.ekspektasiGaji.max)}
                      </p>
                      {applicant.ekspektasiGaji.negotiable && (
                        <Badge variant="outline" className="text-xs">
                          Dapat Dinegosiasi
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {applicant.preferensiLokasiKerja && applicant.preferensiLokasiKerja.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferensi Lokasi Kerja</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {applicant.preferensiLokasiKerja.map((lokasi, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lokasi}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {applicant.preferensiJenisPekerjaan && applicant.preferensiJenisPekerjaan.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Jenis Pekerjaan yang Diinginkan</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {applicant.preferensiJenisPekerjaan.map((jenis, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {jenis}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 