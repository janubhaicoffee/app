import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://janubhai.com"),
  title: {
    default: "Janu Bhai Coffee | Roz Ki Strong Kahaani",
    template: "%s | Janu Bhai Coffee"
  },
  description: "Experience the science of freshness. Sourced from Chikkamagaluru, processed without chemicals, and preserved via advanced dry vacuum technology.",
  keywords: ["coffee india", "franchise coffee india", "janu bhai coffee", "decentralized coffee", "Chikkamagaluru coffee"],
  authors: [{ name: "Janu Bhai Coffee Co." }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://janubhai.com",
    title: "Janu Bhai Coffee | Roz Ki Strong Kahaani",
    description: "Premium AAA Grade coffee from Chikkamagaluru hills. Processed with science, delivered with heart.",
    siteName: "Janu Bhai Coffee",
    images: [{
      url: "/farm.png",
      width: 1200,
      height: 630,
      alt: "Janu Bhai Coffee Farm"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Janu Bhai Coffee | Roz Ki Strong Kahaani",
    description: "The most robust coffee in the real India.",
    images: ["/farm.png"]
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png' },
    ],
  }
};

import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
