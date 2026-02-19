import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { Preloader } from "@/components/Preloader";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DetailPro — Платформа для индустрии детейлинга",
  description: "Социальная платформа для автомоек и детейлинга. Вакансии, специалисты, поставщики, коллективные закупки и профессиональное сообщество.",
  metadataBase: new URL("https://detailpro.ru"),
  openGraph: {
    title: "DetailPro — Платформа для индустрии детейлинга",
    description: "Вакансии, специалисты, поставщики и профессиональное сообщество.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <link rel="preload" href="/logo.png" as="image" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Preloader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
