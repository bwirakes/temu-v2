import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { 
  db, 
  users, 
  userProfiles, 
  userAddresses, 
  userSocialMedia, 
  userPengalamanKerja, 
  userPendidikan, 
  userKeahlian, 
  userBahasa, 
  userSertifikasi, 
  employers, 
  jobs, 
  jobWorkLocations,
  jobApplications,
  levelPengalamanEnum,
  tingkatKeahlianEnum,
  lokasiKerjaEnum,
  applicationStatusEnum
} from '../lib/db-cli';
import { eq, and } from 'drizzle-orm';

/**
 * Helper Functions
 */
const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomIndex = (arr: any[]): number => Math.floor(Math.random() * arr.length);

const randomItem = <T>(arr: T[]): T => arr[randomIndex(arr)];

// Current time constants
const now = new Date();
const oneYearAgo = new Date(now);
oneYearAgo.setFullYear(now.getFullYear() - 1);

const twoYearsAgo = new Date(now);
twoYearsAgo.setFullYear(now.getFullYear() - 2);

const fiveYearsAgo = new Date(now);
fiveYearsAgo.setFullYear(now.getFullYear() - 5);

/**
 * Mock Data
 */

// Names
const namaDepan = [
  'Adi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gading', 'Hendra', 
  'Indah', 'Joko', 'Kartika', 'Lukman', 'Maya', 'Nadia', 'Oscar', 'Putri', 
  'Rudi', 'Siti', 'Tono', 'Umar', 'Vina', 'Wayan', 'Yanto', 'Zahra'
];

const namaBelakang = [
  'Wijaya', 'Susanto', 'Hartono', 'Gunawan', 'Kusuma', 'Santoso', 
  'Hidayat', 'Nugroho', 'Saputra', 'Wibowo', 'Setiawan', 'Sucipto', 
  'Hermawan', 'Prasetyo', 'Purnama', 'Sanjaya', 'Ramadhan', 'Putra', 
  'Permadi', 'Suryanto', 'Kurniawan', 'Utama', 'Cahyono', 'Firdaus'
];

// Companies
const perusahaan = [
  { 
    nama: 'TechCorp Indonesia', 
    industri: 'Teknologi', 
    alamat: 'Jl. Sudirman No. 123, Jakarta Pusat',
    website: 'techcorp.id'
  },
  { 
    nama: 'Creative Solutions', 
    industri: 'Desain & Kreatif', 
    alamat: 'Jl. Asia Afrika No. 45, Bandung',
    website: 'creativesolutions.co.id'
  },
  { 
    nama: 'Fintech Innovations', 
    industri: 'Keuangan & Teknologi', 
    alamat: 'Jl. HR. Muhammad No. 67, Surabaya',
    website: 'fintechinnovations.id'
  },
  { 
    nama: 'AnalyticsPro', 
    industri: 'Analitik Data', 
    alamat: 'Jl. Gatot Subroto No. 89, Jakarta Selatan',
    website: 'analyticspro.id'
  },
  { 
    nama: 'EduTech Indonesia', 
    industri: 'Pendidikan & Teknologi', 
    alamat: 'Jl. Diponegoro No. 34, Yogyakarta',
    website: 'edutech.co.id'
  }
];

// Skills
const keahlianTeknikal = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 
  'Node.js', 'Express', 'PHP', 'Laravel', 'Python', 'Django', 'Flask',
  'Java', 'Spring Boot', 'HTML/CSS', 'Tailwind CSS', 'Bootstrap',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 
  'AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'Git',
  'REST API', 'GraphQL', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'TensorFlow', 'PyTorch', 'Tableau', 'Power BI', 'Excel',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator'
];

// Languages
const bahasa = [
  'Indonesia', 'Inggris', 'Mandarin', 'Jepang', 'Korea', 
  'Arab', 'Belanda', 'Perancis', 'Jerman', 'Spanyol'
];

// Education Institutions
const institusiPendidikan = [
  { 
    nama: 'Universitas Indonesia', 
    lokasi: 'Depok',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Institut Teknologi Bandung', 
    lokasi: 'Bandung',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Universitas Gadjah Mada', 
    lokasi: 'Yogyakarta',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Universitas Airlangga', 
    lokasi: 'Surabaya',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Universitas Diponegoro', 
    lokasi: 'Semarang',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Universitas Padjadjaran', 
    lokasi: 'Bandung',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Universitas Brawijaya', 
    lokasi: 'Malang',
    jenjang: ['S1', 'S2', 'S3']
  },
  { 
    nama: 'Politeknik Negeri Jakarta', 
    lokasi: 'Jakarta',
    jenjang: ['D3', 'D4']
  },
  { 
    nama: 'Politeknik Elektronika Negeri Surabaya', 
    lokasi: 'Surabaya',
    jenjang: ['D3', 'D4']
  },
  { 
    nama: 'SMKN 1 Jakarta', 
    lokasi: 'Jakarta',
    jenjang: ['SMA/SMK']
  }
];

// Fields of Study
const bidangStudi = [
  'Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 
  'Teknik Elektro', 'Desain Komunikasi Visual', 'Manajemen Bisnis',
  'Akuntansi', 'Ekonomi', 'Keuangan', 'Ilmu Komunikasi',
  'Bahasa Inggris', 'Manajemen SDM', 'Hukum', 'Kedokteran',
  'Teknik Sipil', 'Arsitektur', 'Ilmu Statistik', 'Matematika',
  'Farmasi', 'Kimia', 'Fisika', 'Biologi', 'Psikologi'
];

// Job Positions
const posisiPekerjaan = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer', 'UI/UX Designer', 'Product Manager',
  'Project Manager', 'Business Analyst', 'Data Scientist',
  'DevOps Engineer', 'QA Engineer', 'System Administrator',
  'Network Engineer', 'Security Engineer', 'Database Administrator',
  'Technical Writer', 'Technical Support', 'IT Helpdesk',
  'Marketing Specialist', 'SEO Specialist', 'Content Writer',
  'Graphic Designer', 'Video Editor', 'Social Media Manager',
  'HR Specialist', 'Recruiter', 'Office Administrator',
  'Accounting Staff', 'Finance Analyst', 'Tax Consultant'
];

// Certifications
const sertifikasi = [
  { 
    nama: 'AWS Certified Developer', 
    penerbit: 'Amazon Web Services'
  },
  { 
    nama: 'Professional Frontend Developer', 
    penerbit: 'Meta'
  },
  { 
    nama: 'Google Cloud Associate Engineer', 
    penerbit: 'Google'
  },
  { 
    nama: 'Microsoft Certified: Azure Developer', 
    penerbit: 'Microsoft'
  },
  { 
    nama: 'Oracle Certified Professional: Java', 
    penerbit: 'Oracle'
  },
  { 
    nama: 'Certified Scrum Master', 
    penerbit: 'Scrum Alliance'
  },
  { 
    nama: 'CompTIA Security+', 
    penerbit: 'CompTIA'
  },
  { 
    nama: 'CISCO Certified Network Associate', 
    penerbit: 'CISCO'
  },
  { 
    nama: 'Project Management Professional (PMP)', 
    penerbit: 'PMI'
  },
  { 
    nama: 'Certified Information Systems Security Professional', 
    penerbit: 'ISC²'
  }
];

// Cities in Indonesia
const kota = [
  'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 
  'Makassar', 'Yogyakarta', 'Denpasar', 'Palembang', 'Balikpapan'
];

// Provinces in Indonesia
const provinsi = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 
  'Sumatera Utara', 'Sumatera Selatan', 'Sulawesi Selatan', 
  'Kalimantan Timur', 'Bali', 'DI Yogyakarta'
];

/**
 * Main Function to Generate and Insert Mock Data
 */
async function generateMockData() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  
  console.log('Starting mock data generation...');
  
  try {
    // Generate 5 test users with different roles
    console.log('Generating test users...');
    
    const userIds = [];
    const profileIds = [];
    const employerIds = [];
    
    // Create test users
    for (let i = 0; i < 5; i++) {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      const firstName = namaDepan[randomIndex(namaDepan)];
      const lastName = namaBelakang[randomIndex(namaBelakang)];
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      
      if (existingUser.length > 0) {
        console.log(`User ${email} already exists, skipping...`);
        userIds.push(existingUser[0].id);
      } else {
        // Create user
        const [newUser] = await db.insert(users).values({
          name: fullName,
          email: email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log(`Created user: ${newUser.email}`);
        userIds.push(newUser.id);
      }
    }
    
    // Create user profiles
    console.log('Generating user profiles...');
    
    for (const userId of userIds) {
      // Generate random profile data
      const firstName = namaDepan[randomIndex(namaDepan)];
      const lastName = namaBelakang[randomIndex(namaBelakang)];
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      const phoneNumber = `+62812${Math.floor(10000000 + Math.random() * 90000000)}`;
      const birthDate = generateRandomDate(new Date('1980-01-01'), new Date('2000-12-31')).toISOString().split('T')[0];
      const gender = randomItem(['Laki-laki', 'Perempuan', 'Lainnya']);
      const weight = Math.floor(50 + Math.random() * 50);
      const height = Math.floor(150 + Math.random() * 50);
      const religion = randomItem(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']);
      const birthPlace = randomItem(kota);
      
      // Check if profile already exists
      const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      
      let profileId;
      
      if (existingProfile.length > 0) {
        console.log(`Profile for user ${userId} already exists, skipping...`);
        profileId = existingProfile[0].id;
      } else {
        // Create profile
        const [newProfile] = await db.insert(userProfiles).values({
          userId,
          namaLengkap: fullName,
          email,
          nomorTelepon: phoneNumber,
          tanggalLahir: birthDate,
          jenisKelamin: gender as any,
          beratBadan: weight,
          tinggiBadan: height,
          agama: religion,
          fotoProfilUrl: `https://i.pravatar.cc/300?u=${userId}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log(`Created profile for: ${newProfile.namaLengkap}`);
        profileId = newProfile.id;
      }
      
      profileIds.push(profileId);
      
      // Add address
      await db.insert(userAddresses).values({
        userProfileId: profileId,
        jalan: `Jl. ${randomItem(['Sudirman', 'Thamrin', 'Gatot Subroto', 'Asia Afrika', 'Diponegoro'])} No. ${Math.floor(1 + Math.random() * 200)}`,
        rt: `0${Math.floor(1 + Math.random() * 9)}`,
        rw: `0${Math.floor(1 + Math.random() * 9)}`,
        kelurahan: `Kelurahan ${randomItem(['Merdeka', 'Sejahtera', 'Damai', 'Makmur', 'Jaya'])}`,
        kecamatan: `Kecamatan ${randomItem(['Utara', 'Selatan', 'Barat', 'Timur', 'Tengah'])}`,
        kota: randomItem(kota),
        provinsi: randomItem(provinsi),
        kodePos: `${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add social media
      await db.insert(userSocialMedia).values({
        userProfileId: profileId,
        instagram: firstName.toLowerCase(),
        twitter: firstName.toLowerCase(),
        facebook: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
        tiktok: firstName.toLowerCase(),
        linkedin: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Add work experience (1-3 entries)
      const numExperiences = Math.floor(1 + Math.random() * 3);
      
      for (let i = 0; i < numExperiences; i++) {
        const company = randomItem(perusahaan);
        const position = randomItem(posisiPekerjaan);
        const experienceLevel = randomItem(levelPengalamanEnum.enumValues);
        const startDate = generateRandomDate(fiveYearsAgo, oneYearAgo).toISOString().split('T')[0];
        const endDate = i === 0 ? 'Sekarang' : generateRandomDate(new Date(startDate), now).toISOString().split('T')[0];
        const workLocation = randomItem(lokasiKerjaEnum.enumValues);
        
        await db.insert(userPengalamanKerja).values({
          userProfileId: profileId,
          levelPengalaman: experienceLevel,
          namaPerusahaan: company.nama,
          posisi: position,
          tanggalMulai: startDate,
          tanggalSelesai: endDate,
          deskripsiPekerjaan: `Bekerja sebagai ${position} di ${company.nama} dengan tanggung jawab utama pengembangan dan pemeliharaan aplikasi perusahaan. Berkolaborasi dengan tim dalam menyelesaikan proyek-proyek penting dan memastikan kualitas produk yang dihasilkan.`,
          lokasiKerja: workLocation,
          lokasi: company.alamat.split(',')[1].trim(),
          alasanKeluar: i === 0 ? undefined : randomItem(['Kontrak tidak diperpanjang', 'Gaji terlalu kecil', 'Lokasi terlalu jauh', 'Mencari tantangan baru']),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Add education (1-2 entries)
      const numEducations = Math.floor(1 + Math.random() * 2);
      
      for (let i = 0; i < numEducations; i++) {
        const institution = randomItem(institusiPendidikan);
        const level = randomItem(institution.jenjang);
        const field = randomItem(bidangStudi);
        const graduationDate = generateRandomDate(twoYearsAgo, now).toISOString().split('T')[0];
        
        await db.insert(userPendidikan).values({
          userProfileId: profileId,
          namaInstitusi: institution.nama,
          jenjangPendidikan: level,
          bidangStudi: field,
          tanggalLulus: graduationDate,
          nilaiAkhir: `${(3 + Math.random()).toFixed(2)}/4.0`,
          deskripsiTambahan: `Aktif dalam organisasi kampus di ${institution.lokasi} dan kompetisi.`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Add skills (3-7 entries)
      const numSkills = Math.floor(3 + Math.random() * 5);
      const skillsSet = new Set<string>();
      
      while (skillsSet.size < numSkills) {
        skillsSet.add(randomItem(keahlianTeknikal));
      }
      
      // Convert Set to Array and iterate
      const skillsArray = Array.from(skillsSet);
      for (const skill of skillsArray) {
        await db.insert(userKeahlian).values({
          userProfileId: profileId,
          nama: skill,
          tingkat: randomItem(tingkatKeahlianEnum.enumValues),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Add languages (2-3 entries)
      const numLanguages = Math.floor(2 + Math.random() * 2);
      const languagesSet = new Set<string>(['Indonesia']); // Everyone knows Indonesia
      
      while (languagesSet.size < numLanguages) {
        languagesSet.add(randomItem(bahasa.filter(b => b !== 'Indonesia')));
      }
      
      // Convert Set to Array and iterate
      const languagesArray = Array.from(languagesSet);
      for (const language of languagesArray) {
        await db.insert(userBahasa).values({
          userProfileId: profileId,
          nama: language,
          tingkat: language === 'Indonesia' ? 'Mahir' as any : randomItem(tingkatKeahlianEnum.enumValues),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Add certifications (0-2 entries)
      const numCertifications = Math.floor(Math.random() * 3);
      const certificationsSet = new Set<number>();
      
      while (certificationsSet.size < numCertifications) {
        certificationsSet.add(randomIndex(sertifikasi));
      }
      
      // Convert Set to Array and iterate
      const certificationsArray = Array.from(certificationsSet);
      for (const certIdx of certificationsArray) {
        const cert = sertifikasi[certIdx];
        const issueDate = generateRandomDate(twoYearsAgo, now).toISOString().split('T')[0];
        
        await db.insert(userSertifikasi).values({
          userProfileId: profileId,
          nama: cert.nama,
          penerbit: cert.penerbit,
          tanggalTerbit: issueDate,
          fileUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Create employers
    console.log('Generating employers...');
    
    for (let i = 0; i < perusahaan.length; i++) {
      const company = perusahaan[i];
      const userId = userIds[i % userIds.length]; // Cycle through user IDs
      
      // Check if employer already exists for this user
      const existingEmployer = await db.select().from(employers).where(eq(employers.userId, userId));
      
      let employerId;
      
      if (existingEmployer.length > 0) {
        console.log(`Employer for user ${userId} already exists, skipping...`);
        employerId = existingEmployer[0].id;
      } else {
        // Create employer
        const [newEmployer] = await db.insert(employers).values({
          userId,
          namaPerusahaan: company.nama,
          merekUsaha: company.nama,
          industri: company.industri,
          alamatKantor: company.alamat,
          website: company.website,
          socialMedia: {
            instagram: company.nama.toLowerCase().replace(/\s+/g, ''),
            linkedin: company.nama.toLowerCase().replace(/\s+/g, ''),
            facebook: company.nama.toLowerCase().replace(/\s+/g, ''),
          },
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(company.nama)}&background=random&color=fff`,
          pic: {
            nama: `Admin ${company.nama}`,
            nomorTelepon: `+62812${Math.floor(10000000 + Math.random() * 90000000)}`
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log(`Created employer: ${newEmployer.namaPerusahaan}`);
        employerId = newEmployer.id;
      }
      
      employerIds.push(employerId);
      
      // Create jobs for each employer (2-4 per employer)
      const numJobs = Math.floor(2 + Math.random() * 3);
      
      for (let j = 0; j < numJobs; j++) {
        const position = randomItem(posisiPekerjaan);
        const minSalary = Math.floor(5 + Math.random() * 10) * 1000000;
        const maxSalary = minSalary + Math.floor(5 + Math.random() * 15) * 1000000;
        const minExperience = Math.floor(Math.random() * 5);
        const postedDate = generateRandomDate(oneYearAgo, now);
        const deadline = new Date(postedDate);
        deadline.setDate(deadline.getDate() + Math.floor(30 + Math.random() * 60));
        
        // Create job
        const [newJob] = await db.insert(jobs).values({
          employerId,
          jobTitle: position,
          contractType: randomItem(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
          salaryRange: {
            min: minSalary,
            max: maxSalary,
            isNegotiable: Math.random() > 0.3 // 70% chance of being negotiable
          },
          minWorkExperience: minExperience,
          applicationDeadline: deadline,
          requirements: Array.from({ length: Math.floor(3 + Math.random() * 4) }, () => 
            `${randomItem([
              'Berpengalaman minimal', 'Memiliki pengalaman', 'Diutamakan memiliki pengalaman'
            ])} ${minExperience} tahun sebagai ${position} ${randomItem([
              'dengan kemampuan yang baik dalam', 'dan menguasai', 'serta familiar dengan'
            ])} ${randomItem(keahlianTeknikal)}.`
          ),
          responsibilities: Array.from({ length: Math.floor(3 + Math.random() * 4) }, () => 
            `${randomItem([
              'Mengembangkan', 'Memelihara', 'Merancang', 'Mengoptimalkan', 'Mengimplementasikan'
            ])} ${randomItem([
              'aplikasi', 'sistem', 'fitur', 'solusi', 'produk'
            ])} ${randomItem([
              'sesuai kebutuhan perusahaan', 'untuk meningkatkan kinerja', 'dengan standar kualitas tinggi',
              'berdasarkan spesifikasi teknis', 'yang scalable dan maintainable'
            ])}.`
          ),
          description: `${company.nama} sedang mencari ${position} yang berpengalaman untuk bergabung dengan tim kami. Kandidat yang ideal memiliki pengalaman dalam ${randomItem(keahlianTeknikal)} dan ${randomItem(keahlianTeknikal)}.`,
          postedDate,
          numberOfPositions: Math.floor(1 + Math.random() * 5),
          workingHours: randomItem(['09:00 - 17:00', '08:00 - 16:00', '10:00 - 18:00']),
          expectations: {
            ageRange: {
              min: 21,
              max: 35
            },
            expectedCharacter: randomItem([
              'Proaktif dan dapat bekerja dalam tim',
              'Kreatif dan inovatif',
              'Teliti dan bertanggung jawab',
              'Mampu bekerja di bawah tekanan',
              'Memiliki inisiatif tinggi'
            ]),
            foreignLanguage: randomItem(['English', 'No requirement'])
          },
          additionalRequirements: {
            gender: randomItem(['MALE', 'FEMALE', 'ANY']),
            requiredDocuments: 'CV, Portfolio, Sertifikat (jika ada)',
            specialSkills: randomItem(keahlianTeknikal),
            technologicalSkills: randomItem(keahlianTeknikal),
            suitableForDisability: Math.random() > 0.7 // 30% chance
          },
          isConfirmed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        console.log(`Created job: ${newJob.jobTitle} at ${company.nama}`);
        
        // Add work location for this job
        await db.insert(jobWorkLocations).values({
          jobId: newJob.id,
          city: company.alamat.split(',')[1].trim(),
          province: randomItem(provinsi),
          isRemote: Math.random() > 0.7, // 30% chance of being remote
          address: company.alamat,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Generate 0-3 job applications for each job
        const numApplications = Math.floor(Math.random() * 4);
        
        for (let k = 0; k < numApplications; k++) {
          const applicantProfileId = randomItem(profileIds);
          
          // Check if application already exists
          const existingApplication = await db.select()
            .from(jobApplications)
            .where(and(
              eq(jobApplications.applicantProfileId, applicantProfileId),
              eq(jobApplications.jobId, newJob.id)
            ));
          
          if (existingApplication.length > 0) {
            console.log(`Application for job ${newJob.id} by applicant ${applicantProfileId} already exists, skipping...`);
            continue;
          }
          
          // Create application
          const status = randomItem(applicationStatusEnum.enumValues);
          
          const [newApplication] = await db.insert(jobApplications).values({
            applicantProfileId,
            jobId: newJob.id,
            status,
            coverLetter: `Saya sangat tertarik dengan posisi ${newJob.jobTitle} di ${company.nama}. Dengan pengalaman saya di bidang ${randomItem(keahlianTeknikal)} dan ${randomItem(keahlianTeknikal)}, saya yakin dapat memberikan kontribusi yang signifikan bagi perusahaan Anda.`,
            resumeUrl: null
          }).returning();
          
          console.log(`Created job application for job ${newJob.jobTitle} with status ${status}`);
        }
      }
    }
    
    console.log('Mock data generation completed!');
  } catch (err) {
    console.error('Error generating mock data:', err);
  }
  
  process.exit(0);
}

generateMockData().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
}); 