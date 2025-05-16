'use client';

import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSearchParams } from 'next/navigation';
import {
  FileDown,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Loader2,
} from 'lucide-react';

// Import components from the resume-builder directory
import ProfileHeader from '@/components/resume-builder/ProfileHeader';
import AboutSection from '@/components/resume-builder/AboutSection';
import TimelineSection from '@/components/resume-builder/TimelineSection';
import SkillsSection from '@/components/resume-builder/SkillsSection';
import EducationSection from '@/components/resume-builder/EducationSection';
import ExportButton from '@/components/resume-builder/ExportButton';
import ThemeToggle from '@/components/resume-builder/ThemeToggle';
import PersonalInfoSection from '@/components/resume-builder/PersonalInfoSection';
import WorkSummarySection from '@/components/resume-builder/WorkSummarySection';
import CertificationsSection from '@/components/resume-builder/CertificationsSection';

// Define contact info and social links interfaces
interface ContactInfo {
  icon: React.ReactNode;
  text: string;
  link?: string;
}
      
interface SocialLink {
  icon: React.ReactNode;
  text: string;
  link?: string;
}

// Define skill level type
type SkillLevel = "Pemula" | "Menengah" | "Mahir";

// Utility to determine icon for a particular skill
const determineSkillIcon = (skillName: string): string => {
  const name = skillName.toLowerCase();

  if (name.includes('figma') || name.includes('design') || name.includes('desain') || name.includes('ui/ux')) {
    return 'design';
  }
  if (name.includes('react') || name.includes('javascript') || name.includes('typescript') || name.includes('code')) {
    return 'code';
  }
  if (name.includes('excel') || name.includes('word') || name.includes('office') || name.includes('spreadsheet')) {
    return 'office';
  }
  if (name.includes('english') || name.includes('language') || name.includes('bahasa') || name.includes('communication')) {
    return 'language';
  }
  
  return 'general';
};

export default function CVBuilder() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  
  // Get userId or profileId from query params
  const userId = searchParams.get('userId');
  const profileId = searchParams.get('profileId');
  
  useEffect(() => {
    async function fetchCVData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine which endpoint to use based on available parameters
        let endpoint = '/api/job-seeker/cv/sample'; // Default to sample data
        
        if (userId) {
          endpoint = `/api/job-seeker/cv/${userId}`;
        } else if (profileId) {
          endpoint = `/api/job-seeker/cv/profile/${profileId}`;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          // If the API fails, we'll throw an error
          throw new Error(`Failed to fetch CV data: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err: any) {
        console.error('Error fetching CV data:', err);
        setError(err.message || 'Failed to load CV data');
        
        // If we have an error but were not already fetching the sample data,
        // try to fallback to sample data
        if (userId || profileId) {
          try {
            console.log('Attempting to fallback to sample data...');
            const fallbackResponse = await fetch('/api/job-seeker/cv/sample');
            
            if (fallbackResponse.ok) {
              const fallbackResult = await fallbackResponse.json();
              setData(fallbackResult.data);
              // Clear the error since we recovered
              setError(null);
            }
          } catch (fallbackErr) {
            console.error('Failed to load fallback sample data:', fallbackErr);
            // Keep the original error
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCVData();
  }, [userId, profileId]);

  const handlePrint = useReactToPrint({
    // @ts-ignore - The type definitions in the library are incorrect
    content: () => profileRef.current,
    documentTitle: `${data?.namaLengkap || 'Your'}_Resume`,
    onAfterPrint: () => console.log('PDF generated successfully!'),
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading CV data...</span>
      </div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 text-xl mb-4">
          {error || 'Failed to load CV data. Please try again.'}
        </div>
        <button 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Format address for display
  const formattedAddress = data.alamat ? 
    `${data.alamat.jalan || ''}, ${data.alamat.kelurahan || ''}, ${data.alamat.kecamatan || ''}, ${data.alamat.kota || ''}, ${data.alamat.provinsi || ''} ${data.alamat.kodePos || ''}`.replace(/^[, ]+|[, ]+$|[, ]+(?=[, ])/g, '') 
    : '';

  // Prepare contact info for ProfileHeader
  const contactInfo: ContactInfo[] = [
    data.email ? { 
      icon: <Mail size={14} />, 
      text: data.email, 
      link: `mailto:${data.email}` 
    } : null,
    data.nomorTelepon ? { 
      icon: <Phone size={14} />, 
      text: data.nomorTelepon, 
      link: `tel:${data.nomorTelepon}` 
    } : null,
    formattedAddress ? { 
      icon: <MapPin size={14} />, 
      text: formattedAddress 
    } : null,
  ].filter(Boolean) as ContactInfo[];

  // Prepare social media links
  const socialLinks: SocialLink[] = [
    data.socialMedia?.instagram ? { 
      icon: <Instagram size={14} />, 
      text: `@${data.socialMedia.instagram.replace(/^@/, '')}`, 
      link: `https://instagram.com/${data.socialMedia.instagram.replace(/^@/, '')}` 
    } : null,
    data.socialMedia?.twitter ? { 
      icon: <Twitter size={14} />, 
      text: `@${data.socialMedia.twitter.replace(/^@/, '')}`, 
      link: `https://twitter.com/${data.socialMedia.twitter.replace(/^@/, '')}` 
    } : null,
    data.socialMedia?.facebook ? { 
      icon: <Facebook size={14} />, 
      text: data.socialMedia.facebook, 
      link: `https://facebook.com/${data.socialMedia.facebook}` 
    } : null,
    data.socialMedia?.linkedin ? { 
      icon: <Linkedin size={14} />, 
      text: data.socialMedia.linkedin, 
      link: `https://linkedin.com/in/${data.socialMedia.linkedin}` 
    } : null,
    data.informasiTambahan?.website ? { 
      icon: <Globe size={14} />, 
      text: data.informasiTambahan.website, 
      link: data.informasiTambahan.website.startsWith('http') 
        ? data.informasiTambahan.website 
        : `https://${data.informasiTambahan.website}` 
    } : null,
  ].filter(Boolean) as SocialLink[];

  // Prepare education data
  const educationData = data.pendidikan?.map((pendidikan: any) => ({
    degree: `${pendidikan.jenjangPendidikan} ${pendidikan.bidangStudi}`,
    school: pendidikan.namaInstitusi,
    period: pendidikan.tanggalLulus === "Masih Kuliah" 
      ? `${pendidikan.tanggalLulus}` 
      : `Hingga ${pendidikan.tanggalLulus.split('-')[0] || ''}`,
    description: pendidikan.lokasi,
    achievements: pendidikan.deskripsiTambahan 
      ? [pendidikan.deskripsiTambahan]
      : [],
    nilaiAkhir: pendidikan.nilaiAkhir // New field
  })) || [];

  // Prepare work experience data
  const timelineData = data.pengalamanKerja?.map((pengalaman: any) => {
    // Map job positions to appropriate icons
    const mapPositionToIcon = (position: string): string => {
      const positionLower = position.toLowerCase();
      
      if (positionLower.includes('developer') || positionLower.includes('engineer')) {
        return 'file';
      }
      if (positionLower.includes('designer') || positionLower.includes('ui')) {
        return 'palette';
      }
      if (positionLower.includes('marketing') || positionLower.includes('mail')) {
        return 'mail';
      }
      if (positionLower.includes('slack')) {
        return 'slack';
      }
      
      return 'briefcase';
    };

    return {
      period: `${pengalaman.tanggalMulai.split('-')[0] || ''} - ${pengalaman.tanggalSelesai === "Sekarang" ? "Present" : pengalaman.tanggalSelesai.split('-')[0] || ''}`,
      title: pengalaman.posisi,
      company: pengalaman.namaPerusahaan,
      description: pengalaman.deskripsiPekerjaan || '',
      location: pengalaman.lokasi,
      responsibilities: pengalaman.deskripsiPekerjaan 
        ? pengalaman.deskripsiPekerjaan.split('\n').filter(Boolean)
        : [],
      icon: mapPositionToIcon(pengalaman.posisi),
      // Additional fields
      gajiTerakhir: pengalaman.gajiTerakhir,
      alasanKeluar: pengalaman.alasanKeluar
    };
  }) || [];

  // Prepare skills data
  const skillsData = {
    technical: data.keahlian?.map((keahlian: any) => {
      // Map skill level to percentage
      const mapSkillLevelToPercentage = (level?: SkillLevel): number => {
        switch (level) {
          case "Pemula": return 30;
          case "Menengah": return 60;
          case "Mahir": return 90;
          default: return 60;
        }
      };

      return {
        name: keahlian.nama,
        icon: determineSkillIcon(keahlian.nama),
        level: mapSkillLevelToPercentage(keahlian.tingkat),
        tingkat: keahlian.tingkat
      };
    }) || [],
    languages: data.bahasa?.map((bahasa: any) => {
      // Map language level to percentage
      const mapLanguageLevelToPercentage = (level?: SkillLevel): number => {
        switch (level) {
          case "Pemula": return 30;
          case "Menengah": return 60;
          case "Mahir": return 90;
          default: return 60;
        }
      };

      return {
        name: bahasa.nama,
        icon: 'language',
        level: mapLanguageLevelToPercentage(bahasa.tingkat),
        tingkat: bahasa.tingkat
      };
    }) || [],
    certifications: data.sertifikasi?.map((sertifikasi: any) => ({
      name: sertifikasi.nama,
      issuer: sertifikasi.penerbit,
      date: sertifikasi.tanggalTerbit,
    })) || [],
    it_skills: data.additionalFields?.it_skills || []
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <ExportButton 
          onClick={handlePrint} 
          icon={<FileDown size={18} />} 
          label="Export PDF" 
        />
      </div>

      <div 
        ref={profileRef} 
        className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg my-8 print:shadow-none print:my-0"
        >
        <div className="space-y-12">
          <ProfileHeader 
            name={data.namaLengkap || 'Your Name'} 
            title={data.ekspektasiKerja?.jobTypes || 'Job Seeker'}
            photoUrl={data.fotoProfilUrl || 'https://images.unsplash.com/photo-1510706019500-d23a509eecd4?q=80&w=2667&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
            photo_upload_option={data.additionalFields?.photo_upload_option}
            contactInfo={contactInfo}
            socialLinks={socialLinks}
          />
          
          <AboutSection 
            aboutText={data.informasiTambahan?.tentangSaya || 'No information provided.'}
          />

          {/* Personal Info Section */}
          <PersonalInfoSection
            tanggalLahir={data.personalInfo?.tanggalLahir}
            tempatLahir={data.personalInfo?.tempatLahir}
            jenisKelamin={data.personalInfo?.jenisKelamin}
            statusPernikahan={data.personalInfo?.statusPernikahan}
            agama={data.personalInfo?.agama}
            tinggiBadan={data.personalInfo?.tinggiBadan}
            beratBadan={data.personalInfo?.beratBadan}
          />
          
          {/* Work Summary Section */}
          <WorkSummarySection
            levelPengalaman={data.workSummary?.levelPengalaman}
            status_pekerjaan={data.workSummary?.status_pekerjaan}
            transportation_for_work={data.workSummary?.transportation_for_work}
            alasanKeluarLainnya={data.workSummary?.alasanKeluarLainnya}
          />
          
          <TimelineSection 
            experienceData={timelineData.length > 0 ? timelineData : undefined}
          />
          
          <EducationSection 
            educationData={educationData.length > 0 ? educationData : undefined}
          />
          
          <SkillsSection 
            skills={skillsData}
          />

          {/* Certifications Section */}
          <CertificationsSection 
            certifications={data.sertifikasi || []}
          />
        </div>
      </div>
    </div>
  );
}