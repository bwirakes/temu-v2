import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit, User, Phone, Mail, MapPin } from "lucide-react";
import { SectionCard, InfoItem, EmptyState, StatusBadge } from "./ProfileComponents";
import Image from "next/image";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import { CV } from './CV';

interface ProfileData {
  id: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  cvFileUrl?: string;
  cvUploadDate?: string;
  profilePhotoUrl?: string;
  levelPengalaman?: string;
  alamat?: any;
}

interface ProfileCardProps {
  profileData: ProfileData;
  onPhotoUploaded: (url: string) => void;
  onEdit: () => void;
}

export function ProfileCard({ profileData, onPhotoUploaded, onEdit }: ProfileCardProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Informasi Profil"
        icon={<User className="h-4 w-4 text-blue-700" />}
        action={
          <Button variant="ghost" size="sm" onClick={onEdit} className="transition-colors duration-200 h-7 text-xs">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <ProfilePhotoUploader 
              currentPhotoUrl={profileData.profilePhotoUrl} 
              userName={profileData.namaLengkap}
              onPhotoUploaded={onPhotoUploaded}
            />
          </div>
          
          <h2 className="text-lg font-semibold mt-3">
            {profileData.namaLengkap}
          </h2>
          
          <StatusBadge variant="info">
            {profileData.levelPengalaman || "Belum Ada Level Pengalaman"}
          </StatusBadge>
          
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
        </div>
      </SectionCard>
      
      {/* CV section */}
      <CV cvFileUrl={profileData.cvFileUrl} cvUploadDate={profileData.cvUploadDate} />
    </div>
  );
} 