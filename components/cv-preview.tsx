'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
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

// Define types for contact info and social links
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

// Sample data for the CV preview
const sampleData = {
  namaLengkap: 'Ahmad Rizky',
  email: 'ahmad.rizky@example.com',
  nomorTelepon: '+62 812 3456 7890',
  alamat: {
    jalan: 'Jl. Sudirman No. 123',
    kelurahan: 'Setiabudi',
    kecamatan: 'Setiabudi',
    kota: 'Jakarta',
    provinsi: 'DKI Jakarta',
    kodePos: '12910'
  },
  socialMedia: {
    instagram: 'ahmadrizky',
    twitter: 'ahmadrizky',
    linkedin: 'ahmadrizky',
    facebook: 'ahmadrizky'
  },
  fotoProfilUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
  photo_upload_option: true,
  // Personal information
  jenisKelamin: 'Laki-laki',
  tanggalLahir: '1995-05-15',
  tempatLahir: 'Jakarta',
  statusPernikahan: 'Belum Menikah',
  agama: 'Islam',
  tinggiBadan: 175,
  beratBadan: 70,
  // Work summary fields
  levelPengalaman: '5 Years',
  status_pekerjaan: 'Employed',
  transportation_for_work: 'Private Car',
  alasanKeluarLainnya: 'Seeking career growth opportunities',
  informasiTambahan: {
    tentangSaya: 'Frontend developer dengan pengalaman 5 tahun dalam pengembangan aplikasi web menggunakan React dan TypeScript. Memiliki kemampuan untuk membuat antarmuka yang responsif dan user-friendly.\n\nSaya berfokus pada pembuatan kode yang bersih, terstruktur, dan mudah dikelola. Saya juga memiliki pengalaman dalam bekerja dengan tim lintas fungsi untuk menghasilkan produk yang berkualitas tinggi.',
    website: 'ahmadrizky.dev'
  },
  ekspektasiKerja: {
    jobTypes: 'Frontend Developer, Web Developer'
  },
  pendidikan: [
    {
      namaInstitusi: 'Universitas Indonesia',
      lokasi: 'Depok',
      jenjangPendidikan: 'S1',
      bidangStudi: 'Teknik Informatika',
      tanggalLulus: '2018-06-30',
      deskripsiTambahan: 'GPA: 3.8/4.0. Aktif dalam organisasi kampus dan kompetisi pemrograman.',
      nilaiAkhir: '3.8/4.0'
    }
  ],
  pengalamanKerja: [
    {
      id: '1',
      levelPengalaman: '3-5 tahun' as const,
      namaPerusahaan: 'TechCorp Indonesia',
      posisi: 'Senior Frontend Developer',
      tanggalMulai: '2021-01-01',
      tanggalSelesai: 'Sekarang',
      deskripsiPekerjaan: 'Mengembangkan dan memelihara aplikasi web perusahaan menggunakan React, TypeScript, dan Next.js.\nMengimplementasikan sistem design system untuk konsistensi UI.\nMembangun komponen yang dapat digunakan kembali untuk meningkatkan efisiensi pengembangan.\nBekerja sama dengan tim backend untuk mengintegrasikan API.\nMentor untuk developer junior dalam tim.',
      lokasi: 'Jakarta',
      gajiTerakhir: 'Rp 15.000.000/month',
      alasanKeluar: 'Still employed',
      lokasiKerja: 'WFO'
    },
    {
      id: '2',
      levelPengalaman: '1-3 tahun' as const,
      namaPerusahaan: 'Creative Digital',
      posisi: 'Frontend Developer',
      tanggalMulai: '2018-06-01',
      tanggalSelesai: '2020-12-31',
      deskripsiPekerjaan: 'Mengembangkan aplikasi web e-commerce dengan React dan Redux.\nBerkolaborasi dengan tim backend untuk integrasi API.\nMengoptimalkan performa aplikasi web untuk pengalaman pengguna yang lebih baik.\nMengimplementasikan desain responsif untuk berbagai ukuran perangkat.',
      lokasi: 'Bandung',
      gajiTerakhir: 'Rp 8.000.000/month',
      alasanKeluar: 'Career growth opportunity',
      lokasiKerja: 'WFH'
    }
  ],
  keahlian: [
    {
      nama: 'JavaScript',
      tingkat: 'Mahir' as SkillLevel
    },
    {
      nama: 'TypeScript',
      tingkat: 'Mahir' as SkillLevel
    },
    {
      nama: 'React',
      tingkat: 'Mahir' as SkillLevel
    },
    {
      nama: 'Next.js',
      tingkat: 'Menengah' as SkillLevel
    },
    {
      nama: 'HTML/CSS',
      tingkat: 'Mahir' as SkillLevel
    }
  ],
  bahasa: [
    {
      nama: 'Indonesia',
      tingkat: 'Mahir' as SkillLevel
    },
    {
      nama: 'English',
      tingkat: 'Menengah' as SkillLevel
    },
    {
      nama: 'Japanese',
      tingkat: 'Pemula' as SkillLevel
    }
  ],
  sertifikasi: [
    {
      nama: 'AWS Certified Developer',
      penerbit: 'Amazon Web Services',
      tanggalTerbit: '2022-06'
    },
    {
      nama: 'Professional Frontend Developer',
      penerbit: 'Meta',
      tanggalTerbit: '2021-04'
    }
  ],
  it_skills: ['Tailwind CSS', 'Redux', 'GraphQL', 'Git', 'Responsive Design', 'UI/UX']
};

export default function CVPreview() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const data = sampleData;

  const handlePrint = useReactToPrint({
    // @ts-ignore - The type definitions in the library are incorrect
    content: () => profileRef.current,
    documentTitle: `${data.namaLengkap || 'Your'}_Resume`,
    onAfterPrint: () => console.log('PDF generated successfully!'),
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
  const educationData = data.pendidikan.map(pendidikan => ({
    degree: `${pendidikan.jenjangPendidikan} ${pendidikan.bidangStudi}`,
    school: pendidikan.namaInstitusi,
    period: pendidikan.tanggalLulus === "Masih Kuliah" 
      ? `${pendidikan.tanggalLulus}` 
      : `Hingga ${pendidikan.tanggalLulus.split('-')[0] || ''}`,
    description: pendidikan.lokasi,
    achievements: pendidikan.deskripsiTambahan 
      ? [pendidikan.deskripsiTambahan]
      : [],
    nilaiAkhir: pendidikan.nilaiAkhir
  }));

  // Prepare work experience data
  const timelineData = data.pengalamanKerja.map(pengalaman => {
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
      gajiTerakhir: pengalaman.gajiTerakhir,
      alasanKeluar: pengalaman.alasanKeluar
    };
  });

  // Prepare skills data
  const skillsData = {
    technical: data.keahlian.map(keahlian => {
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
    }),
    languages: data.bahasa.map(bahasa => {
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
    }),
    certifications: data.sertifikasi?.map(sertifikasi => ({
      name: sertifikasi.nama,
      issuer: sertifikasi.penerbit,
      date: sertifikasi.tanggalTerbit,
    })) || [],
    it_skills: data.it_skills
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
        aria-label="Curriculum Vitae"
      >
        <div className="space-y-12">
          <ProfileHeader 
            name={data.namaLengkap || 'Your Name'} 
            title={data.ekspektasiKerja?.jobTypes || 'Job Seeker'}
            photoUrl={data.fotoProfilUrl}
            photo_upload_option={data.photo_upload_option}
            contactInfo={contactInfo}
            socialLinks={socialLinks}
          />
          
          <AboutSection 
            aboutText={data.informasiTambahan?.tentangSaya || 'No information provided.'}
          />

          <PersonalInfoSection
            tanggalLahir={data.tanggalLahir}
            tempatLahir={data.tempatLahir}
            jenisKelamin={data.jenisKelamin}
            statusPernikahan={data.statusPernikahan}
            agama={data.agama}
            tinggiBadan={data.tinggiBadan}
            beratBadan={data.beratBadan}
          />
          
          <WorkSummarySection
            levelPengalaman={data.levelPengalaman}
            status_pekerjaan={data.status_pekerjaan}
            transportation_for_work={data.transportation_for_work}
            alasanKeluarLainnya={data.alasanKeluarLainnya}
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

          <CertificationsSection 
            certifications={data.sertifikasi || []}
          />
        </div>
      </div>
    </div>
  );
} 