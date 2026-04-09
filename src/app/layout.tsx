import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "nojom ✦ مولّد محتوى الإنفلونسر",
  description: "توليد محتوى إعلاني مخصص لكل منصة بأسلوب الإنفلونسر",
  icons: {
    icon: "/icons/nojom.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-cairo)] antialiased">
        {children}
      </body>
    </html>
  );
}
