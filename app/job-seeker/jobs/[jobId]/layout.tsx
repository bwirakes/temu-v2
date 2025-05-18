import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detail Lowongan | Informasi Pekerjaan',
  description: 'Lihat informasi detail tentang lowongan pekerjaan dan persyaratan',
};

export default function JobDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {children}
    </div>
  );
} 