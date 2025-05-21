import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | TEMU',
  description: 'Kebijakan Privasi Aplikasi TEMU. Pahami bagaimana informasi Anda dikumpulkan, digunakan, dan dilindungi.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-neutral-900 text-gray-800 dark:text-neutral-200 pt-24 pb-12 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="text-sm">
          <h1 className="text-2xl font-bold mb-4">KEBIJAKAN PRIVASI APLIKASI TEMU</h1>
          <p className="text-sm italic mb-4">Terakhir Diperbarui: 24 Mei 2025</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Komitmen Kami terhadap Privasi Anda</h2>
          <p className="mb-3">TEMU bertujuan untuk membantu perorangan/individu agar dapat mengakses peluang kerja melalui proses yang relative memudahkan dan membangun kemampuan pencari kerja, serta membantu organisasi menjalankan bisnis yang sukses dengan menemukan talenta yang tepat melalui sistem rekrutmen yang efektif. Kami percaya penting bagi Anda –User/Pengguna TEMU– untuk memahami bagaimana informasi Anda dikumpulkan, digunakan, dilindungi, dan bagaimana Anda dapat mengelolanya saat berinteraksi dengan kami.</p>
          <p className="mb-3">Kebijakan Privasi ini menjelaskan secara rinci bagaimana informasi Anda dikumpulkan, digunakan, dilindungi, dan bagaimana Anda dapat mengelolanya ketika Anda menggunakan layanan kami.</p>
          <p className="mb-3">Dengan mendaftar dan membuat akun, menggunakan produk dan layanan kami, mengunjungi Platform kami atau berkomunikasi dengan kami melalui telepon, email, secara langsung, atau cara lainnya, maka ketentuan dalam Kebijakan Privasi ini berlaku bagi Anda.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Siapa Kami</h2>
          <p className="mb-3">Kami adalah <strong>PT TEMU Sejahtera Visi Utama (TSVU)</strong>. Kami mengoperasikan beberapa platform ketenagakerjaan daring dan layanan terkait di Indonesia, yang melayani Warga Negara Indonesia pencari kerja, serta organisasi yang menyediakan pekerjaan bagi WNI di mana pun di dunia.</p>
          <p className="mb-3">Platform kami menyediakan akses kerja bagi lulusan SMK, SMA, D1, D2, D4, atau yang memiliki tingkat pendidikan di bawah itu.</p>
          <p className="mb-3">Kebijakan Privasi ini mencakup semua entitas bisnis kami yang beroperasi dengan merek dagang terdaftar <strong>&quot;TEMU.&quot;</strong></p>
          <p className="mb-3">Sangat penting bagi Anda untuk membaca seluruh Kebijakan Privasi ini secara saksama untuk memahami semua aspek yang berlaku bagi Anda.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Siapa yang Bertanggung Jawab atas Informasi Pribadi Anda?</h2>
          <p className="mb-3">Jika Anda adalah Pencari Kerja, ketika Anda mengisi formulir untuk menjadi Pengguna Aplikasi TEMU dan/atau melamar suatu posisi kerja yang diiklankan oleh Penyedia Kerja di Platform kami, maka kami memproses lamaran kerja Anda (dan Informasi Pribadi yang disertakan) bersama-sama dengan Penyedia Kerja tersebut. Dalam hal ini, kami dan Penyedia Kerja bertindak sebagai pengendali data atas Informasi Pribadi Anda.</p>
          <p className="mb-3">Dalam situasi lain, ketika kami mengumpulkan Informasi Pribadi Anda, kami bertindak sebagai pengendali data tunggal. Pengendali data atas Informasi Pribadi Anda adalah <strong>PT TEMU Sejahtera Visi Utama</strong>.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 2: Informasi Pribadi yang Kami Kumpulkan dari Anda</h2>
          <h3 className="text-base font-medium mt-4 mb-2">Informasi Pribadi Apa yang Kami Kumpulkan dari Anda?</h3>
          <p className="mb-3">Kami mengumpulkan berbagai jenis informasi tentang Anda tergantung pada bagaimana Anda berinteraksi dengan kami dan menggunakan produk serta layanan kami. Sebagai contoh:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Untuk mendaftar sebagai Pengguna Terdaftar di Platform TEMU, Anda perlu memberikan informasi dasar seperti nama dan alamat email Anda.</li>
            <li>Jika Anda adalah Pencari Kerja, dan memilih untuk membuat Profil dan/atau melamar pekerjaan, tergantung pada Penyedia Kerja, kami dapat mengumpulkan Informasi Pribadi tambahan atas nama Penyedia Kerja.</li>
          </ul>
          <h4 className="text-base font-medium mt-4 mb-2">Kategori Informasi Pribadi: Data Umum</h4>
          <ol className="list-decimal pl-5 mb-3 space-y-1">
            <li>Untuk semua Pengguna Terdaftar: nama, alamat email, dan kata sandi.</li>
            <li>Untuk Pencari Kerja yang membuat Profil: Anda dapat memberikan informasi seperti: negara domisili (termasuk lokasi rumah, lokasi kerja yang diinginkan), CV, lisensi dan sertifikasi (misalnya tanggal kedaluwarsa SIM), dan informasi lainnya yang dimasukkan dalam CV atau Profil Anda di Platform kami.</li>
            <li>Untuk Pencari Kerja yang melamar pekerjaan: tergantung Penyedia Kerja, kami dapat mengumpulkan informasi tambahan dari Anda seperti CV, surat lamaran, jawaban atas pertanyaan seleksi, atau informasi lain yang diminta Penyedia Kerja. Kami juga dapat mengumpulkan informasi dari Penyedia Kerja terkait status lamaran Anda (misalnya: masuk daftar pendek, wawancara, diterima, ditolak, dsb).</li>
          </ol>
          <h4 className="text-base font-medium mt-4 mb-2">Kategori Informasi Pribadi: Data Kontak</h4>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Alamat email, nomor ponsel, nomor telepon rumah, nomor kontak lainnya, alamat sesuai KTP, alamat tempat tinggal saat ini, alamat surat menyurat, detail perusahaan (jika relevan).</li>
            <li>Login melalui Google, media sosial, atau Apple ID (Akun Tertaut).</li>
            <li>Jika Anda Penyedia Kerja: nama perusahaan, NPWP, alamat usaha dan alamat tagihan; nama, email dan nomor telepon kontak utama (admin akun Penyedia Kerja) serta informasi pengguna tambahan yang ditambahkan oleh Penyedia Kerja.</li>
          </ul>
          <h4 className="text-base font-medium mt-4 mb-2">Kategori Informasi Pribadi: Data Latar Belakang</h4>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Untuk Pencari Kerja yang membuat Profil: ringkasan pribadi, pengalaman kerja, riwayat pendidikan, kemampuan bahasa, keterampilan lainnya, kualifikasi profesional, informasi gaji, preferensi klasifikasi pekerjaan dan lokasi kerja yang diinginkan.</li>
          </ul>
          <h4 className="text-base font-medium mt-4 mb-2">Kategori Informasi Pribadi: Data Penggunaan dan Perangkat</h4>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Informasi akses dan kunjungan ke Platform, pola penggunaan, ID perangkat, cookies, halaman yang dikunjungi, riwayat pencarian dan klik, personalisasi konten, alamat IP, jenis dan versi browser, halaman perujuk, sistem operasi, cap waktu tanggal dan alur klik yang disimpan dalam log.</li>
            <li>Data ini dikumpulkan secara otomatis melalui penggunaan cookies yang disimpan di browser atau perangkat Anda. (Lihat bagian 11 untuk detail pengelolaan Data Penggunaan dan Perangkat.)</li>
          </ul>
          <h4 className="text-base font-medium mt-4 mb-2">Kategori Informasi Pribadi: Data Pihak Ketiga (termasuk Data Pribadi Orang Terkait)</h4>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Nama, alamat email, nomor ponsel, nomor kontak lainnya, alamat kontak, tempat kerja, jabatan, hubungan dengan Pengguna Terdaftar (pastikan Anda telah mendapatkan izin dari pihak terkait sebelum memberikan datanya kepada kami).</li>
          </ul>
          <h4 className="text-base font-medium mt-4 mb-2">Kategori Informasi Pribadi: Data Lokasi</h4>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Alamat rumah, alamat surat menyurat dan/atau lokasi perangkat saat menggunakan Platform pada perangkat Anda. Lokasi perangkat hanya disimpan di perangkat Anda dan hanya jika Anda memberikan izin untuk aplikasi mengakses lokasi Anda.</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">Jika Anda adalah Pengguna Tidak Terdaftar:</h3>
          <p className="mb-3">Kami mengumpulkan Data Penggunaan dan Perangkat, Data Kontak, dan/atau Data Lokasi jika Anda menghubungi kami sebagai Pengguna Tidak Terdaftar, misalnya melalui telepon, email atau online.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Informasi Pribadi dari Kategori yang Lain:</h3>
          <p className="mb-3">Kami juga dapat mengumpulkan Informasi Pribadi lainnya yang Anda berikan saat berinteraksi dengan kami, misalnya dalam survei atau promosi.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Pengguna yang Tidak Diizinkan Menggunakan TEMU</h3>
          <p className="mb-3">Kami tidak mengizinkan Pengguna berusia di bawah usia minimum sesuai dengan hukum privasi yang berlaku. Jika Anda berusia di bawah ketentuan usia tersebut, mohon agar tidak menggunakan platform kami. Kami tidak bertanggung jawab apabila Anda tetap menggunakan platform ini dengan memberikan informasi palsu.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Apakah Kami Mengumpulkan Informasi Sensitif?</h3>
          <p className="mb-3">Dalam sebagian besar kasus, kami tidak perlu mengumpulkan Informasi Sensitif Anda. Anda tidak perlu mengungkapkan informasi ini kecuali benar-benar relevan, terutama bagi Pencari Kerja selama proses lamaran.</p>
          <p className="mb-3">Namun, dalam beberapa situasi, kami dapat mengumpulkan dan menangani Informasi Sensitif, misalnya jika seorang Pencari Kerja memutuskan memberikan informasi kesehatan (seperti status vaksinasi) kepada Penyedia Kerja. Informasi ini akan kami kumpulkan atas nama Penyedia Kerja.</p>
          <p className="mb-3">Kami hanya mengumpulkan Informasi Sensitif jika:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Anda memberikan persetujuan dengan secara sukarela menyertakan informasi tersebut dalam dokumen lamaran atau Profil Anda;</li>
            <li>Anda memberikan persetujuan eksplisit kepada TEMU (atau penyedia verifikasi pihak ketiga kami) untuk membagikannya kepada kami;</li>
            <li>Ada dasar hukum lainnya yang memungkinkan kami mengumpulkan informasi tersebut.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 3: Bagaimana Kami Mengumpulkan Informasi Pribadi Anda</h2>
          <p className="mb-3">Kami mengumpulkan Informasi Pribadi Anda melalui beberapa cara:</p>
          <h3 className="text-base font-medium mt-4 mb-2">Secara Langsung dari Anda</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>mendaftar dan membuat akun;</li>
            <li>menggunakan Platform kami.</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">Secara Tidak Langsung</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Saat Anda mendaftar atau masuk menggunakan akun Google, Facebook, atau Apple. Dengan menggunakan metode ini, Anda memberi izin kepada pihak tersebut untuk membagikan informasi seperti nama dan email kepada kami. Jika Anda telah memiliki akun dengan alamat email yang sama, akun Anda akan ditautkan.</li>
            <li>Saat Anda memperbarui email di pengaturan akun, ini tidak akan secara otomatis memutuskan tautan dari akun Google/Facebook/Apple. Anda dapat memutuskan tautan melalui pengaturan masing-masing platform tersebut.</li>
            <li>Dari Penyedia Layanan dan Mitra kami (termasuk penyedia perangkat lunak rekrutmen).</li>
            <li>Jika Anda Pencari Kerja, kami dapat menerima informasi tambahan dari Penyedia Kerja melalui proses lamaran.</li>
            <li>Dari otoritas pemerintah, penegak hukum, atau badan pengatur sesuai kebutuhan (misalnya kepolisian, imigrasi, bea cukai).</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">Dari Aktivitas Online Anda</h3>
          <p className="mb-3">Kami menggunakan Cookies untuk mengumpulkan Data Penggunaan dan Perangkat saat Anda menggunakan Platform TEMU atau melihat iklan kami di situs pihak ketiga. (Lihat Bagian 11 untuk informasi lebih lanjut.)</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 4: Bagaimana Kami Menggunakan Informasi Pribadi Anda</h2>
          <p className="mb-3">Kami hanya mengumpulkan dan menggunakan Informasi Pribadi jika ada dasar hukum yang sah dan diperlukan untuk tujuan berikut:</p>
          <ol className="list-decimal pl-5 mb-3 space-y-1">
            <li><strong>Menganalisis dan Mengembangkan Solusi SDM di Indonesia</strong><br /><strong>Kategori Data:</strong> Data Umum, Data Kontak, Data Latar Belakang, Data Penggunaan dan Perangkat, Data Pihak Ketiga, Data Lokasi<br /><strong>Dasar Hukum:</strong> Kewajiban Kontraktual, Kepentingan Sah, Pemberitahuan atau Persetujuan (jika diwajibkan)</li>
            <li><strong>Menyediakan Produk dan Layanan Kami</strong><br />Kami menggunakan informasi Anda untuk:
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>membantu Pencari Kerja mencari dan melamar pekerjaan;</li>
                <li>membantu Penyedia Kerja dalam proses rekrutmen;</li>
                <li>memproses transaksi;</li>
                <li>memverifikasi Pengguna Terdaftar (termasuk dengan teknologi AI dan machine learning).</li>
              </ul>
              <strong>Kategori Data:</strong> Data Umum, Data Kontak, Data Latar Belakang, Data Penggunaan dan Perangkat, Data Lokasi<br /><strong>Dasar Hukum:</strong> Kepentingan Sah, Pemberitahuan atau Persetujuan
            </li>
            <li><strong>Menyesuaikan dan Meningkatkan Produk dan Layanan</strong><br />Kami dapat:
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>menggunakan AI untuk menampilkan &quot;sinyal pendekatan&quot; (Approachability Signal) kepada Penyedia Kerja;</li>
                <li>merekomendasikan pertanyaan seleksi;</li>
                <li>menilai kecocokan lamaran terhadap suatu pekerjaan secara otomatis dan menampilkan hasilnya kepada Penyedia Kerja.</li>
              </ul>
              <strong>Kategori Data:</strong> Data Umum, Data Kontak, Data Penggunaan dan Perangkat, Data Lokasi<br /><strong>Dasar Hukum:</strong> Kepentingan Sah, Kewajiban Hukum, Pemberitahuan atau Persetujuan
            </li>
            <li><strong>Komunikasi dan Dukungan Teknis</strong><br />Kami dapat menghubungi Anda untuk:
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>memberikan informasi terkait akun Anda;</li>
                <li>memberikan dukungan teknis;</li>
                <li>melakukan verifikasi lewat telepon atau SMS;</li>
                <li>merekam panggilan untuk pelatihan dan jaminan kualitas.</li>
              </ul>
            </li>
            <li><strong>Pemasaran dan Promosi</strong><br />Kami menggunakan informasi Anda untuk mengirimkan:
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>materi pemasaran dan promosi langsung;</li>
                <li>informasi produk dan fitur;</li>
                <li>informasi lowongan kerja, buletin, survei, atau undangan acara.</li>
              </ul>
              <strong>Kategori Data:</strong> Data Umum, Data Kontak, Data Penggunaan dan Perangkat, Data Lokasi<br /><strong>Dasar Hukum:</strong> Kepentingan Sah, Pemberitahuan atau Persetujuan
            </li>
            <li><strong>Iklan Bertarget</strong><br />Kami melacak dan menganalisis Data Penggunaan dan Perangkat untuk menampilkan iklan yang sesuai dengan minat Anda (lihat Bagian 11 tentang Cookies).</li>
            <li><strong>Survei dan Riset Pasar</strong><br />Kami dapat menghubungi Anda untuk ikut serta dalam uji coba produk, survei pengguna, atau riset pelanggan.</li>
            <li><strong>Penawaran dari Grup TEMU dan Mitra</strong><br />Kami dapat membagikan informasi seputar layanan dan produk dari entitas dalam Grup TEMU, termasuk informasi pekerjaan dari mitra resmi.</li>
            <li><strong>Riset dan Pengembangan</strong><br />Kami menggunakan data untuk melakukan analisis dan pengembangan produk dalam Grup TEMU, termasuk pengujian sistem AI.</li>
            <li><strong>Verifikasi Identitas dan Keamanan</strong><br />Untuk menjaga keamanan data dan sistem kami, kami menggunakan informasi Anda untuk:
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>verifikasi akun;</li>
                <li>mencegah penipuan, penyalahgunaan, atau aktivitas ilegal;</li>
                <li>menjaga integritas sistem.</li>
              </ul>
            </li>
            <li><strong>Kewajiban Regulasi dan Hukum</strong><br />Kami memproses Informasi Pribadi untuk:
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>memenuhi kewajiban hukum atau perintah pengadilan;</li>
                <li>menjawab permintaan otoritas hukum atau regulator;</li>
                <li>menanggapi permintaan pengguna terkait akses atau penghapusan data.</li>
              </ul>
            </li>
          </ol>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 5: Apa yang Terjadi Jika Anda Tidak Memberikan Informasi Pribadi Anda?</h2>
          <p className="mb-3">Kami perlu memproses Informasi Pribadi Anda agar dapat menyediakan produk dan layanan kami. Jika Anda tidak ingin informasi Anda diproses sesuai tujuan yang dijelaskan dalam Kebijakan Privasi ini, Anda harus menghentikan penggunaan Platform, produk, atau layanan kami.</p>
          <p className="mb-3">Anda dapat memilih untuk tidak membagikan Informasi Pribadi kepada kami. Namun, jika Anda memilih untuk tidak memberikan informasi yang diperlukan, kami mungkin tidak dapat menyediakan sebagian atau seluruh produk dan layanan kami kepada Anda.</p>
          <p className="mb-3">Kami juga memerlukan Informasi Pribadi Anda untuk memenuhi kewajiban hukum. Jika dasar hukum pemrosesan informasi Anda adalah untuk memenuhi kewajiban hukum, kegagalan Anda memberikan informasi tertentu dapat menyebabkan Anda dan/atau kami melanggar ketentuan hukum tersebut.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 6: Kepada Siapa Kami Membagikan Informasi Pribadi Anda?</h2>
          <p className="mb-3">Kami dapat membagikan Informasi Pribadi Anda dengan berbagai pihak, termasuk:</p>
          <h3 className="text-base font-medium mt-4 mb-2">a. Grup TEMU</h3>
          <p className="mb-3">Kami dapat membagikan informasi Anda dengan entitas atau unit bisnis lain dalam Grup TEMU sesuai dengan tujuan dalam Kebijakan Privasi ini.</p>
          <h3 className="text-base font-medium mt-4 mb-2">b. Penyedia Kerja (Advertisers)</h3>
          <p className="mb-3">Jika Anda adalah Pencari Kerja, Anda menyetujui bahwa kami dapat membagikan Informasi Pribadi Anda dengan Penyedia Kerja saat Anda melamar iklan lowongan kerja di Platform kami.</p>
          <p className="mb-3">Informasi Anda dapat disimpan di:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Pusat Penyedia Kerja milik kami atas nama Penyedia Kerja;</li>
            <li>platform karier milik Penyedia Kerja;</li>
            <li>perangkat lunak rekrutmen pilihan Penyedia Kerja.</li>
          </ul>
          <p className="mb-3">Kami tidak bertanggung jawab atas keamanan informasi Anda yang disimpan di luar Platform kami oleh Penyedia Kerja.</p>
          <p className="mb-3">Setiap pertanyaan terkait iklan pekerjaan, lamaran, atau status lamaran harus diarahkan langsung ke Penyedia Kerja.</p>
          <p className="mb-3">Saat melamar, bagian dari Profil Anda juga akan dibagikan ke Penyedia Kerja, termasuk: <strong>Data Umum</strong>, <strong>Data Kontak</strong>, <strong>Data Latar Belakang</strong>, <strong>Data Pihak Ketiga</strong>, dan <strong>Data Lokasi</strong>.</p>
          <p className="mb-3">Beberapa Penyedia Kerja juga mungkin meminta Anda menjawab pertanyaan tertentu. Dengan menjawab pertanyaan tersebut, Anda menyetujui bahwa jawaban Anda akan dibagikan kepada Penyedia Kerja, dan informasi tersebut dapat digunakan untuk memperbarui Profil Anda di fitur TEMU Talent Search.</p>
          <p className="mb-3"><strong>Catatan:</strong> Jika Anda membagikan Profil dengan Penyedia Kerja, informasi ini dapat dengan sengaja atau tidak sengaja dibagikan kembali kepada pihak lain, termasuk perekrut yang mewakili perusahaan lain.</p>
          <p className="mb-3">Kami tidak bertanggung jawab atas tindakan atau sistem keamanan Penyedia Kerja, meskipun kami mewajibkan mereka untuk patuh pada hukum privasi yang berlaku.</p>
          <p className="mb-3">Pencari Kerja disarankan menghubungi Penyedia Kerja secara langsung untuk meminta akses atau penghapusan Informasi Pribadi yang telah diberikan.</p>
          <h3 className="text-base font-medium mt-4 mb-2">c. Pihak Ketiga</h3>
          <h4 className="text-base font-medium mt-4 mb-2">Penyedia Layanan dan Mitra</h4>
          <p className="mb-3">Kami dapat membagikan informasi Anda kepada:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Penyedia Layanan, kontraktor, atau Mitra kami yang membantu kami menyediakan produk dan layanan;</li>
            <li>Pihak ketiga yang menawarkan produk atau layanan kepada Anda melalui integrasi dengan Platform TEMU;</li>
            <li>Mitra survei, riset pasar, dan uji coba produk.</li>
          </ul>
          <h4 className="text-base font-medium mt-4 mb-2">Kewenangan Pemerintah</h4>
          <p className="mb-3">Kami dapat membagikan informasi Anda kepada lembaga pemerintah, penegak hukum, badan pengatur, atau pejabat berwenang yang memiliki dasar hukum untuk meminta informasi tersebut, termasuk untuk mematuhi perintah pengadilan.</p>
          <h4 className="text-base font-medium mt-4 mb-2">Merger, Akuisisi, atau Restrukturisasi</h4>
          <p className="mb-3">Dalam hal terjadi merger, akuisisi, atau restrukturisasi, kami dapat membagikan informasi Anda kepada pihak pembeli atau penerus usaha dari entitas dalam Grup TEMU, termasuk penasihat terkait.</p>
          <h3 className="text-base font-medium mt-4 mb-2">d. Tautan ke Situs Pihak Ketiga</h3>
          <p className="mb-3">Beberapa Platform kami mungkin memiliki tautan ke situs web atau aplikasi yang tidak kami miliki atau kelola (Situs Pihak Ketiga).</p>
          <p className="mb-3">Kami tidak bertanggung jawab atas praktik privasi situs tersebut. Harap baca kebijakan privasi masing-masing Situs Pihak Ketiga sebelum menggunakannya.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 7: Apakah Kami Membagikan Informasi Pribadi Anda ke Luar Negeri?</h2>
          <p className="mb-3">Kami dapat membagikan Informasi Pribadi Anda ke luar domisili Anda dalam kondisi berikut:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Dengan penyedia layanan, mitra, atau pihak ketiga yang berbasis di luar negeri;</li>
            <li>Dengan entitas lain dalam Grup TEMU;</li>
            <li>Dengan Penyedia Kerja yang berbasis di luar negeri, baik melalui lamaran langsung atau pencarian Profil melalui TEMU Talent Search;</li>
            <li>Untuk memenuhi kewajiban hukum atau regulasi lintas negara.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 8: Bagaimana Kami Menjaga Keamanan Informasi Anda?</h2>
          <p className="mb-3">Kami mengambil langkah-langkah yang wajar untuk memastikan keamanan sistem kami dan melindungi Informasi Pribadi Anda dari penyalahgunaan, gangguan, kehilangan, serta akses, modifikasi, atau pengungkapan yang tidak sah. Setiap Informasi Pribadi yang kami simpan disimpan di server yang aman dan di fasilitas yang terkendali.</p>
          <p className="mb-3">Kami mengikuti standar industri yang berlaku untuk melindungi Informasi Pribadi. Namun, tidak ada metode transmisi data melalui internet atau metode penyimpanan elektronik yang benar-benar aman. Pihak ketiga yang menerima Informasi Pribadi Anda dari kami (termasuk Penyedia Kerja) diminta untuk mematuhi seluruh kewajiban hukum terkait perlindungan dan pengungkapan informasi berdasarkan hukum privasi yang berlaku.</p>
          <p className="mb-3">Jika Anda diminta untuk memberikan informasi secara langsung kepada pihak ketiga (misalnya saat melamar melalui platform karier milik Penyedia Kerja), maka penggunaan informasi tersebut diatur oleh kebijakan privasi pihak ketiga tersebut dan berada di luar tanggung jawab kami.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Peran Anda dalam Keamanan Data:</h3>
          <p className="mb-3">Anda juga memiliki peran penting dalam menjaga keamanan Informasi Pribadi, termasuk menjaga kerahasiaan kata sandi dan akun yang digunakan pada Platform kami. Harap segera beri tahu kami jika Anda mengetahui adanya penggunaan tidak sah atau pelanggaran keamanan pada akun Anda.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 9: Bagaimana Kami Menggunakan Cookies dan Data Penggunaan serta Perangkat?</h2>
          <h3 className="text-base font-medium mt-4 mb-2">Alamat IP</h3>
          <p className="mb-3">Server web kami mengumpulkan alamat IP Anda untuk membantu diagnosa masalah atau isu layanan serta memantau penggunaan Platform, termasuk lokasi pengguna.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Cookies dan Teknologi Sejenis</h3>
          <p className="mb-3">Kami menggunakan Cookies untuk memberikan pengalaman berselancar yang lebih baik, termasuk:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>menyimpan preferensi dan riwayat klik;</li>
            <li>pengisian otomatis data login;</li>
            <li>menyimpan kriteria pencarian terakhir.</li>
          </ul>
          <p className="mb-3">Informasi ini digunakan untuk:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>menyesuaikan pengalaman pengguna;</li>
            <li>meningkatkan kinerja situs web;</li>
            <li>mengembangkan dan menguji layanan baru;</li>
            <li>mendukung pembayaran online;</li>
            <li>menyampaikan laporan kinerja kepada mitra bisnis dan pengiklan.</li>
          </ul>
          <p className="mb-3">Informasi ini dapat dibagikan dengan entitas dalam Grup TEMU dan penyedia layanan kami guna meningkatkan produk dan layanan.</p>
          <p className="mb-3">Kami juga menggunakan Cookies dan ID perangkat untuk menyesuaikan iklan yang ditampilkan kepada Anda, baik di Platform kami, situs terkait, atau situs/aplikasi pihak ketiga, berdasarkan:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>tindakan dan perilaku Anda di situs tersebut,</li>
            <li>informasi yang ada dalam Profil Anda,</li>
            <li>aktivitas Anda di Platform kami.</li>
          </ul>
          <p className="mb-3">Kami juga membagikan ID perangkat Anda kepada mitra dan penyedia layanan kami untuk mengenali perangkat Anda di berbagai platform. Mitra kami dapat menempatkan Cookies di halaman yang Anda kunjungi untuk menganalisis minat dan preferensi Anda.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Pengaturan Penggunaan Cookies</h3>
          <p className="mb-3">Anda dapat membatasi penggunaan Cookies melalui pengaturan privasi browser atau sistem operasi di perangkat seluler Anda. Namun, hal ini dapat membatasi akses ke area tertentu dalam Platform dan membatasi beberapa fitur produk kami.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Pengukuran oleh Pihak Ketiga</h3>
          <p className="mb-3">Kami menggunakan penyedia layanan pihak ketiga untuk mengukur lalu lintas di Platform, termasuk:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>jumlah tampilan halaman;</li>
            <li>jumlah pengunjung unik;</li>
            <li>durasi kunjungan;</li>
            <li>titik masuk dan keluar umum dari Platform.</li>
          </ul>
          <p className="mb-3">Untuk Pengguna Tidak Terdaftar, data ini dikumpulkan dan disajikan secara agregat. Untuk Pengguna Terdaftar, informasi ini dihubungkan antar sesi pada berbagai perangkat untuk memberikan penghitungan yang lebih akurat sebelum data diolah menjadi agregat. Data ini juga dapat diakses oleh lembaga media atau riset untuk tujuan perbandingan industri.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 10: Penyimpanan Informasi Pribadi Anda</h2>
          <p className="mb-3">Kami menyimpan Informasi Pribadi Anda selama diperlukan untuk memenuhi tujuan pengumpulan data sebagaimana dijelaskan dalam Kebijakan Privasi ini, atau sampai Anda meminta penghapusan data tersebut. Setelah itu, kami akan mengambil langkah-langkah yang wajar untuk menghapus Informasi Pribadi Anda (jika diwajibkan oleh hukum yang berlaku).</p>
          <p className="mb-3">Jika Anda telah melamar pekerjaan melalui Platform kami dan memberikan Informasi Pribadi kepada Penyedia Kerja, Anda perlu menghubungi langsung Penyedia Kerja tersebut untuk meminta penghapusan data Anda dari sistem mereka.</p>
          <p className="mb-3">Kami dapat menyimpan Informasi Pribadi Anda meskipun Anda telah meminta penghapusan, apabila:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>diperlukan untuk memenuhi kepentingan sah kami,</li>
            <li>diperlukan untuk memenuhi kewajiban hukum atau regulasi,</li>
            <li>untuk menyelesaikan perselisihan antar Pengguna,</li>
            <li>untuk mencegah dan menangani penipuan atau penyalahgunaan,</li>
            <li>untuk kebutuhan pengujian internal (dalam lingkungan tertutup dan aman),</li>
            <li>untuk pemulihan data dari sistem cadangan.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 11: Permintaan atas Informasi Pribadi</h2>
          <h3 className="text-base font-medium mt-4 mb-2">Umum</h3>
          <p className="mb-3">Anda dapat mengajukan permintaan terkait Informasi Pribadi Anda yang kami simpan. Beberapa jenis permintaan hanya berlaku dalam situasi tertentu.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Akses:</h3>
          <p className="mb-3">Anda berhak mengetahui apakah kami menyimpan Informasi Pribadi Anda dan dapat meminta akses ke data tersebut.</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Untuk Pencari Kerja: Anda dapat mengakses informasi Anda melalui akun TEMU pada bagian &quot;Pengaturan&quot; atau halaman &quot;Profil&quot;.</li>
            <li>Untuk Penyedia Kerja: Akses tersedia di bagian &quot;Detail Akun&quot;.</li>
            <li>Semua Pengguna juga dapat menghubungi kami secara langsung untuk mengajukan permintaan akses.</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">Perbaikan/Koreksi Data:</h3>
          <p className="mb-3">Anda berhak memperbaiki informasi yang tidak akurat atau tidak lengkap.</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Pencari Kerja dapat memperbarui Profil mereka melalui akun TEMU.</li>
            <li>Penyedia Kerja dapat memperbarui data melalui akun masing-masing.</li>
            <li>Anda juga dapat meminta perbaikan secara langsung kepada kami.</li>
          </ul>
          <h3 className="text-base font-medium mt-4 mb-2">Penghapusan:</h3>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>Pencari Kerja dapat menghapus Informasi Pribadi mereka melalui bagian &quot;Pengaturan&quot; di akun TEMU.</li>
            <li>Kami berhak menonaktifkan atau menghapus informasi dalam Profil jika ditemukan tidak akurat, menyesatkan, atau disimpan untuk tujuan yang tidak sah.</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 12: Berhenti Berlangganan (Unsubscribe)</h2>
          <p className="mb-3">Anda dapat memilih untuk berhenti menerima notifikasi dari kami, termasuk:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>pembaruan lamaran pekerjaan dan informasi lowongan kerja baru (dapat diatur di bagian &quot;Pengaturan&quot; Platform);</li>
            <li>atau dengan menghubungi kami melalui informasi kontak di Bagian 15.</li>
          </ul>
          <p className="mb-3">Kami akan memproses permintaan berhenti berlangganan sesegera mungkin sesuai hukum privasi yang berlaku.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 13: Profil Kandidat (Candidate Profile)</h2>
          <h3 className="text-base font-medium mt-4 mb-2">Pengaturan Visibilitas</h3>
          <p className="mb-3">Saat mendaftar, semua Pencari Kerja diminta membuat Profil pribadi. Jika belum memiliki Profil, sistem akan memintanya saat pertama kali melamar.</p>
          <p className="mb-3">Profil dapat berisi:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>riwayat kerja dan pendidikan,</li>
            <li>informasi kontak,</li>
            <li>preferensi gaji dan jenis pekerjaan,</li>
            <li>lisensi, sertifikasi, kemampuan, bahasa, lokasi, ringkasan pribadi, dan sinyal pendekatan (Approachability Signal).</li>
          </ul>
          <p className="mb-3">Penyedia Kerja dapat menggunakan fitur <strong>TEMU Talent Search</strong> untuk mencari dan menghubungi Pencari Kerja, termasuk yang berada di luar domisili Anda. Profil Anda hanya akan ditampilkan jika lokasi yang Anda cantumkan sesuai dengan preferensi lokasi Anda.</p>
          <p className="mb-3">Bagian dari Profil Anda akan dibagikan ketika Anda melamar pekerjaan. Anda dapat memperbarui Profil sebelum mengirimkan lamaran.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Menghapus Profil Anda</h3>
          <p className="mb-3">Untuk menghapus Profil, Anda harus menghapus seluruh akun TEMU Anda sesuai prosedur di Bagian 11.</p>
          <h3 className="text-base font-medium mt-4 mb-2">Berbagi Profil Anda</h3>
          <p className="mb-3">Anda dapat membagikan versi ringkas dari Profil Anda melalui tautan (Shared Profile). Isi Shared Profile meliputi:</p>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>nama, ringkasan pribadi, riwayat kerja, pendidikan, keterampilan, bahasa, lisensi, dan sertifikasi.</li>
          </ul>
          <p className="mb-3">Siapa pun yang memiliki tautan ini dapat melihat dan membagikannya kembali. Profil Bersama ini tidak dapat ditemukan secara publik, namun tetap aktif (real-time). Setiap perubahan di Profil akan langsung terlihat di Shared Profile.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 14: Pembaruan terhadap Kebijakan Privasi Ini</h2>
          <p className="mb-3">Kami dapat memperbarui Kebijakan Privasi ini kapan saja. Anda disarankan untuk meninjau kebijakan ini secara berkala agar tetap mengetahui perubahan terbaru. Dalam situasi tertentu, jika diwajibkan oleh hukum privasi yang berlaku, kami akan memberitahukan perubahan tersebut kepada Anda sebelum diberlakukan.</p>
          <p className="mb-3">Dengan terus menggunakan Platform, produk, atau layanan kami, Anda menyetujui modifikasi yang kami lakukan terhadap Kebijakan Privasi ini.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 15: Hubungi Kami</h2>
          <p className="mb-3">Jika Anda memiliki pertanyaan atau keluhan terkait Kebijakan Privasi ini, atau ingin menghubungi kami mengenai penggunaan atau penanganan Informasi Pribadi Anda, silakan hubungi kami melalui email: <a href="mailto:privacy@TEMUcorp.id" className="text-blue-600 hover:underline dark:text-blue-500"><strong>privacy@TEMUcorp.id</strong></a></p>
          <p className="mb-3">Setiap keluhan yang kami terima akan segera diselidiki, dan kami akan memberikan respons secepat mungkin. Jika Anda tidak puas dengan penyelesaian dari kami, Anda dapat mengajukan pengaduan lebih lanjut ke otoritas perlindungan data pribadi di wilayah Anda.</p>

          <h2 className="text-lg font-semibold mt-6 mb-2">Bagian 16: Definisi Istilah</h2>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li><strong>Akun Tertaut (Linked Accounts):</strong> Login melalui Google, Facebook, atau Apple ID.</li>
            <li><strong>Alamat Domisili:</strong> Alamat rumah tempat tinggal</li>
            <li><strong>Alamat Resmi:</strong> Alamat sesuai yang tercantum di Profil atau KTP Anda.</li>
            <li><strong>Alamat Surat-Menyurat:</strong> Alamat yang Anda gunakan untuk menerima korespondensi dan surat-menyurat.</li>
            <li><strong>Cookies:</strong> File data kecil yang disimpan di perangkat Anda untuk membantu mengenali preferensi dan pola penggunaan.</li>
            <li><strong>Data Penggunaan dan Perangkat:</strong> Data teknis dan perilaku penggunaan Platform, seperti dijelaskan di bagian 3(a).</li>
            <li><strong>Data Pribadi:</strong> Sinonim dari Informasi Pribadi.</li>
            <li><strong>Entitas yang Ditunjuk (Designated Entity):</strong> Entitas resmi di bawah Grup TEMU yang bertanggung jawab terhadap pengelolaan data.</li>
            <li><strong>Hukum Privasi:</strong> Semua peraturan yang berlaku mengenai pengumpulan, penggunaan, dan perlindungan Informasi Pribadi.</li>
            <li><strong>Informasi Pribadi:</strong> Informasi yang dapat mengidentifikasi seseorang secara langsung atau tidak langsung.</li>
            <li><strong>Informasi Sensitif:</strong> Data spesifik yang dilindungi secara ketat seperti data kesehatan, keyakinan agama, afiliasi politik, dll.</li>
            <li><strong>Mitra (Partners):</strong> Pihak ketiga yang bekerja sama dengan kami untuk menyediakan layanan tambahan.</li>
            <li><strong>Orang Terkait:</strong> Pihak lain yang terkait dengan Pengguna, seperti referensi kerja atau kontak darurat.</li>
            <li><strong>Pemberitahuan Pekerjaan (Job Notification):</strong> Notifikasi pekerjaan berdasarkan pencarian yang Anda simpan, seperti dari JobStreet atau JobsDB.</li>
            <li><strong>Pemrosesan:</strong> Segala bentuk penggunaan data, termasuk pengumpulan, penyimpanan, pengubahan, penghapusan, atau pembagian.</li>
            <li><strong>Pencari Kerja (Job-Seeker):</strong> Pengguna yang menggunakan Platform untuk mencari dan melamar pekerjaan.</li>
            <li><strong>Pengguna Aplikasi TEMU:</strong> Pengguna (termasuk Pencari Kerja dan Penyedia Kerja) yang menggunakan layanan berbasis aplikasi TEMU.</li>
            <li><strong>Pengguna Muda:</strong> Sesuai hukum Indonesia, pengguna di bawah usia 21 tahun dan belum menikah secara sah.</li>
            <li><strong>Pengguna TEMU:</strong> Semua pengguna yang menggunakan Platform dengan merek TEMU.</li>
            <li><strong>Pengguna Terdaftar:</strong> Pengguna yang mendaftarkan data mereka di Platform untuk mengakses layanan kami.</li>
            <li><strong>Pengguna Tidak Terdaftar:</strong> Individu yang menggunakan Platform tanpa membuat akun.</li>
            <li><strong>Pengguna, Anda, milik Anda:</strong> Semua individu yang menggunakan atau berinteraksi dengan Platform TEMU.</li>
            <li><strong>Penyedia Kerja (Job-Provider):</strong> Individu atau entitas (termasuk pemberi kerja dan perekrut) yang memposting lowongan pekerjaan di Platform kami atau menggunakan produk/layanan untuk mencari Pencari Kerja.</li>
            <li><strong>Penyedia Layanan (Service Providers):</strong> Pihak ketiga yang membantu operasional dan layanan kami.</li>
            <li><strong>Platform Terkait:</strong> Platform lain dalam ekosistem TEMU.</li>
            <li><strong>Platform:</strong> Situs web, aplikasi seluler, layanan dan fitur digital TEMU.</li>
            <li><strong>Profil Bersama (Shared Profile):</strong> Versi ringkasan Profil yang dapat dibagikan lewat tautan.</li>
            <li><strong>Profil:</strong> Profil pribadi yang dibuat oleh Pencari Kerja di Platform kami.</li>
            <li><strong>Situs Web Pihak Ketiga:</strong> Situs atau aplikasi di luar kendali TEMU, seperti dijelaskan dalam bagian 8(d).</li>
            <li><strong>Syarat dan Ketentuan:</strong> Syarat yang berlaku atas penggunaan layanan TEMU.</li>
            <li><strong>Talent Search:</strong> Fitur basis data talenta TEMU yang memungkinkan Penyedia Kerja mencari dan menghubungi kandidat.</li>
            <li><strong>TEMU:</strong> Merek dagang milik PT TEMU Sejahtera Visi Utama.</li>
            <li><strong>Undang-Undang Perlindungan Data Pribadi:</strong> UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi di Indonesia.</li>
          </ul>
        </article>
      </div>
    </div>
  );
} 
