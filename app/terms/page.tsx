import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Syarat dan Ketentuan | TEMU',
  description: 'Syarat dan Ketentuan Penggunaan Aplikasi TEMU. Pahami hak dan kewajiban Anda sebagai pengguna.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 pt-24 pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="text-sm">
          <h1 className="text-2xl font-bold mb-4">SYARAT DAN KETENTUAN</h1>
          <p className="text-sm italic mb-2">DALAM PENGGUNAAN APLIKASI TEMU</p>
          <p className="text-sm italic mb-4">Terakhir Diperbarui: 21 Mei 2025</p>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">Nama Perusahaan: PT TEMU Sejahtera Visi Utama</h2>
          <h2 className="text-lg font-semibold mt-4 mb-2">Nama Platform: TEMU</h2>
          <h2 className="text-lg font-semibold mt-4 mb-2">Berlaku bagi pengguna: Pencari Kerja, Pemberi Kerja, Mitra, dan Masyarakat Umum.</h2>
          <h2 className="text-lg font-semibold mt-4 mb-2">Terakhir Diperbaharui: 21 Mei 2025</h2>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">1. Persetujuan Syarat & Ketentuan Yang Berlaku</h2>
          <p className="mb-3">Dengan mengakses, menggunakan, mendaftar akun, mengunggah data, atau memanfaatkan layanan Aplikasi TEMU milik PT TEMU Sejahtera Visi Utama, maka Anda setuju untuk terikat pada Syarat dan Ketentuan ini, dengan <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-500">Kebijakan Privasi</Link> serta dengan peraturan tambahan lainnya. Jika Anda tidak menyetujui, mohon untuk tidak menggunakan Aplikasi TEMU.</p>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">2. Kelayakan dan Tanggung Jawab Penggunaan Akun</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Pengguna wajib berusia minimum sesuai yang ditentukan oleh negara (berusia di atas 21 tahun atau telah menikah secara sah). Anda bertanggung jawab atas keamanan akun, kata sandi, dan seluruh aktivitas yang terjadi atas nama akun Anda.</li>
            <li>Data yang Anda berikan wajib bersifat akurat, terkini, dan tidak menyesatkan.</li>
            <li>Dilarang keras memberikan informasi palsu, informasi yang menyudutkan, atau informasi yang melanggar hak pihak lain.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">3. Ketentuan untuk Pencari Kerja</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Dengan mengunggah Daftar Riwayat Hidup, CV, profil, atau data diri lainnya, Anda memberikan izin kepada TEMU untuk membagikan data tersebut kepada mitra pemberi kerja.</li>
            <li>TEMU tidak menjamin bahwa lamaran kerja Anda akan menghasilkan panggilan wawancara atau penempatan kerja.</li>
            <li>Dilarang keras memberikan informasi palsu, informasi yang menyudutkan, atau informasi yang melanggar hak pihak lain.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">4. Ketentuan untuk Pemberi Kerja dan Mitra Rekrutmen</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Pemberi kerja wajib mematuhi UU No. 13 Tahun 2003 tentang Ketenagakerjaan, serta dilarang memasang iklan kerja yang bersifat diskriminatif, palsu, atau melanggar hukum.</li>
            <li>Data pencari kerja hanya boleh digunakan untuk keperluan rekrutmen yang sah dan dilarang disalahgunakan atau diperjualbelikan.</li>
            <li>TEMU berhak menangguhkan akun pemberi kerja yang melanggar ketentuan ini.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">5. Penggunaan Platform</h2>
          <p className="mb-3">Pengguna <strong>dilarang</strong>:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Mengakses sistem secara ilegal, termasuk melalui perangkat lunak otomatis (bots, scrapers, dll).</li>
            <li>Menyebarkan konten yang mengandung SARA, pornografi, fitnah, atau hoaks.</li>
            <li>Menggunakan platform untuk tujuan selain mencari atau menawarkan kerja.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">6. Hak Kekayaan Intelektual dan Konten Pengguna</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Seluruh konten dan teknologi pada platform ini dilindungi oleh hak cipta dan merek dagang yang terdaftar di Indonesia.</li>
            <li>Dengan mengunggah konten (Daftar Riwayat Hidup, CV, profil, data diri, ulasan, iklan kerja dan lain sejenis), Anda memberikan hak eksklusif kepada TEMU untuk menyimpan, menampilkan, dan mendistribusikan konten tersebut.</li>
            <li>Pengguna dilarang menyalahgunakan, menjual, atau menduplikasi konten tanpa izin tertulis dari TEMU.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">7. Integrasi API dan Mitra Teknologi</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Akses atas Application Programming Interfaces (API) TEMU dilarang dan hanya diperbolehkan dengan izin tertulis dan tunduk pada perjanjian teknis antara TEMU dengan pihak terkait.</li>
            <li>TEMU berhak memantau dan menangguhkan akses API bila terjadi penyalahgunaan atau pelanggaran batas penggunaan.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">8. Perlindungan Data Pribadi dan Ketentuan Privasi</h2>
          <p className="mb-3 italic">Silahkan mengacu pada <Link href="/privacy" className="text-blue-600 hover:underline dark:text-blue-500">KEBIJAKAN PRIVASI APLIKASI TEMU</Link> yang merupakan bagian tak terpisahkan dari Syarat dan Ketentuan penggunaan jasa, produk dan platform TEMU.</p>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">9. Penghentian Layanan</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>TEMU berhak menangguhkan atau menghapus akun pengguna jika ditemukan pelanggaran terhadap syarat dan ketentuan ini.</li>
            <li>Anda dapat menghapus akun Anda kapan saja melalui pengaturan akun.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">10. Batasan Tanggung Jawab</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>TEMU tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat penggunaan layanan, termasuk keputusan ketenagakerjaan atau tindakan pihak ketiga.</li>
            <li>Kami tidak menjamin ketersediaan pekerjaan, keakuratan informasi lowongan, atau keberhasilan proses rekrutmen.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">11. Hukum yang Berlaku dan Penyelesaian Sengketa</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia.</li>
            <li>Sengketa akan diselesaikan melalui mediasi terlebih dahulu. Jika tidak tercapai kesepakatan, maka akan diselesaikan di Pengadilan Negeri Jakarta Selatan.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">12. Perubahan Syarat dan Ketentuan</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>TEMU dapat sewaktu-waktu melakukan perubahan terhadap syarat ini.</li>
            <li>Perubahan material akan diberitahukan melalui notifikasi pada platform atau email. Penggunaan berkelanjutan setelah pemberitahuan dianggap sebagai persetujuan Anda terhadap perubahan tersebut.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mt-6 mb-2">Hubungi Kami</h2>
          <p className="mb-3">Jika Anda memiliki pertanyaan atau masukan terkait Syarat dan Ketentuan ini, silakan hubungi kami melalui email: <a href="mailto:privasi@temukerja.id" className="text-blue-600 hover:underline dark:text-blue-500"><strong>privasi@temukerja.id</strong></a></p>
        </article>
      </div>
    </div>
  );
} 
