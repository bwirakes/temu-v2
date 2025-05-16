import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV Builder | TEMU",
  description: "Create and download your professional CV",
};

export default function CVBuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="flex flex-col min-h-screen">
      {children}
    </section>
  );
} 