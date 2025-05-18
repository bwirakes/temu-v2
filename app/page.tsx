import Link from 'next/link';
import Image from 'next/image';
import CharacterAnimation from './components/character-animation';

export default function HomePage() {
  return (
    <div className="bg-notion-background">
      {/* Add padding to account for fixed header */}
      <div className="pt-16"></div>
      
      {/* Hero Section */}
      <section className="notion-container pt-20 pb-16">
        <div className="max-w-3xl mx-auto">
          <CharacterAnimation 
            text="Satu platform untuk karir dan rekrutmen"
            tag="h1"
            className="text-notion-title mb-6"
            delay={300}
          />
          <p className="text-lg text-notion-text-light animation-delay-100 animate-fade-in mb-10">
            Temu adalah platform yang menghubungkan pencari kerja dengan perusahaan terkemuka di Indonesia. Temukan peluang karir Anda atau rekrut talenta terbaik untuk tim Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animation-delay-200 animate-fade-in">
            <Link href="/careers" className="notion-button">
              Cari Pekerjaan
            </Link>
            <Link href="/employer/register" className="notion-button-outline">
              Rekrut Talenta
            </Link>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 animation-delay-300 animate-fade-in">
          <div className="relative h-[400px] rounded-notion border border-notion-border overflow-hidden shadow-notion-card">
            <Image
              src="/images/hero-dashboard.png"
              alt="Temu Platform Dashboard"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="notion-container py-20 border-t border-notion-border">
        <CharacterAnimation 
          text="Fitur yang memudahkan perjalanan karir Anda"
          tag="h2"
          className="text-notion-subtitle text-center mb-16 animation-delay-400"
          delay={600}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="notion-card animation-delay-100 animate-fade-in">
            <div className="p-6">
              <div className="h-12 w-12 rounded-notion bg-notion-highlight-blue flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Pencarian Cerdas</h3>
              <p className="text-notion-text-light">
                Temukan pekerjaan yang sesuai dengan keterampilan, pengalaman, dan preferensi lokasi Anda dengan mudah.
              </p>
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="notion-card animation-delay-200 animate-fade-in">
            <div className="p-6">
              <div className="h-12 w-12 rounded-notion bg-notion-highlight-green flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Profil Terverifikasi</h3>
              <p className="text-notion-text-light">
                Perusahaan dan pencari kerja yang terverifikasi untuk memastikan pengalaman rekrutmen yang aman dan terpercaya.
              </p>
            </div>
          </div>
          
          {/* Feature 3 */}
          <div className="notion-card animation-delay-300 animate-fade-in">
            <div className="p-6">
              <div className="h-12 w-12 rounded-notion bg-notion-highlight-orange flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Job Fair Virtual</h3>
              <p className="text-notion-text-light">
                Ikuti job fair virtual untuk bertemu langsung dengan perusahaan dan mempercepat proses rekrutmen Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-notion-background-gray py-20">
        <div className="notion-container">
          <CharacterAnimation 
            text="Apa kata pengguna kami"
            tag="h2"
            className="text-notion-subtitle text-center mb-16 animation-delay-400"
            delay={800}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="notion-card animation-delay-100 animate-fade-in">
              <div className="p-6">
                <p className="text-notion-text-light mb-6">
                  &quot;Temu membantu saya menemukan pekerjaan impian saya dalam waktu kurang dari sebulan. Antarmuka yang intuitif dan fitur pencarian yang canggih membuat proses pencarian kerja menjadi menyenangkan.&quot;
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-notion-highlight-pink flex items-center justify-center mr-3">
                    <span className="font-medium">AS</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Andi Surya</h4>
                    <p className="text-sm text-notion-text-light">UI/UX Designer</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="notion-card animation-delay-200 animate-fade-in">
              <div className="p-6">
                <p className="text-notion-text-light mb-6">
                  &quot;Sebagai HRD, Temu memudahkan saya untuk menemukan kandidat berkualitas dengan cepat. Fitur filter yang detail membantu kami menemukan talenta yang sesuai dengan kebutuhan perusahaan.&quot;
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-notion-highlight-blue flex items-center justify-center mr-3">
                    <span className="font-medium">DP</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Dewi Pratiwi</h4>
                    <p className="text-sm text-notion-text-light">HR Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="notion-container py-20">
        <div className="max-w-2xl mx-auto text-center animation-delay-500 animate-fade-in">
          <CharacterAnimation 
            text="Mulai perjalanan karir Anda hari ini"
            tag="h2"
            className="text-notion-subtitle mb-6"
            delay={1000}
          />
          <p className="text-notion-text-light mb-8">
            Bergabunglah dengan ribuan pencari kerja dan perusahaan yang telah menggunakan Temu untuk menemukan kesempatan terbaik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers" className="notion-button">
              Jelajahi Lowongan
            </Link>
            <Link href="/register" className="notion-button-outline">
              Buat Akun
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 