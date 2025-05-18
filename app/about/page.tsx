import Image from 'next/image';
import Link from 'next/link';
import CharacterAnimation from '../components/character-animation';

export const metadata = {
  title: 'Tentang Kami | Temu - Platform Karir dan Rekrutmen',
  description: 'Pelajari tentang misi, tujuan, dan tim di balik platform Temu, platform karir dan rekrutmen terdepan di Indonesia.'
};

export default function AboutPage() {
  return (
    <div className="bg-notion-background">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      {/* Hero Section */}
      <section className="notion-container pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <CharacterAnimation 
            text="Tentang Temu"
            tag="h1"
            className="text-notion-title mb-6"
            delay={300}
          />
          <p className="text-lg text-notion-text-light animation-delay-100 animate-fade-in mb-10">
            Platform rekrutmen dan pencarian kerja yang dirancang untuk menghubungkan pencari kerja dengan perusahaan terkemuka di Indonesia.
          </p>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 animation-delay-300 animate-fade-in">
          <div className="relative h-[400px] rounded-notion border border-notion-border overflow-hidden shadow-notion-card">
            <Image
              src="/images/about-team.jpg"
              alt="Tim Temu"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://placehold.co/1200x400/e2e8f0/64748b?text=Tim+Temu";
              }}
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="notion-container py-20 border-t border-notion-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <CharacterAnimation 
              text="Misi Kami"
              tag="h2"
              className="text-notion-subtitle mb-4"
              delay={400}
            />
            <div className="space-y-4 text-notion-text-light">
              <p>
                Temu didirikan dengan misi sederhana namun kuat: memudahkan pencari kerja menemukan pekerjaan yang sesuai dengan keterampilan dan minat mereka, serta membantu perusahaan menemukan talenta terbaik untuk tim mereka.
              </p>
              <p>
                Kami percaya bahwa setiap orang berhak mendapatkan kesempatan kerja yang sesuai dengan potensi mereka, dan setiap perusahaan berhak menemukan kandidat yang tepat untuk memajukan bisnis mereka.
              </p>
              <p>
                Melalui platform Temu, kami membangun ekosistem rekrutmen yang transparan, efisien, dan memberdayakan kedua belah pihak.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <CharacterAnimation 
              text="Nilai-Nilai Kami"
              tag="h2"
              className="text-notion-subtitle mb-4"
              delay={500}
            />
            <div className="space-y-6">
              <div className="notion-card p-6">
                <div className="h-12 w-12 rounded-notion bg-notion-highlight-blue flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Kepercayaan & Transparansi</h3>
                <p className="text-notion-text-light">
                  Kami membangun kepercayaan melalui proses rekrutmen yang transparan dan pengalaman pengguna yang jujur.
                </p>
              </div>
              
              <div className="notion-card p-6">
                <div className="h-12 w-12 rounded-notion bg-notion-highlight-green flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Inovasi & Efisiensi</h3>
                <p className="text-notion-text-light">
                  Kami terus berinovasi untuk membuat proses rekrutmen lebih efisien dan efektif bagi semua pihak.
                </p>
              </div>
              
              <div className="notion-card p-6">
                <div className="h-12 w-12 rounded-notion bg-notion-highlight-orange flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Inklusivitas</h3>
                <p className="text-notion-text-light">
                  Kami mendukung keberagaman dan kesempatan yang sama bagi semua pencari kerja dan perusahaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="bg-notion-background-gray py-20">
        <div className="notion-container">
          <CharacterAnimation 
            text="Didukung Oleh"
            tag="h2"
            className="text-notion-subtitle text-center mb-16"
            delay={600}
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="notion-card p-8 flex items-center justify-center h-24">
              <div className="text-center font-medium text-gray-400">Logo Partner 1</div>
            </div>
            <div className="notion-card p-8 flex items-center justify-center h-24">
              <div className="text-center font-medium text-gray-400">Logo Partner 2</div>
            </div>
            <div className="notion-card p-8 flex items-center justify-center h-24">
              <div className="text-center font-medium text-gray-400">Logo Partner 3</div>
            </div>
            <div className="notion-card p-8 flex items-center justify-center h-24">
              <div className="text-center font-medium text-gray-400">Logo Partner 4</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="notion-container py-20">
        <div className="max-w-2xl mx-auto text-center animation-delay-500 animate-fade-in">
          <CharacterAnimation 
            text="Bergabunglah dengan Kami"
            tag="h2"
            className="text-notion-subtitle mb-6"
            delay={700}
          />
          <p className="text-notion-text-light mb-8">
            Menjadi bagian dari ekosistem Temu untuk mendapatkan akses ke ribuan peluang karir dan talenta berbakat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers" className="notion-button">
              Temukan Lowongan
            </Link>
            <Link href="/employer/register" className="notion-button-outline">
              Rekrut Talenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 