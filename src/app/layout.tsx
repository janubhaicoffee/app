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
    default: "Janu Bhai | The Smartest Cup in India",
    template: "%s | Janu Bhai Coffee"
  },
  description: "Roz ki strong kahaani. Join India's fastest-growing decentralized coffee movement. AAA Grade Chikkamagaluru beans, dry vacuum processed.",
  keywords: ["coffee india", "franchise coffee india", "janu bhai coffee", "decentralized coffee", "Chikkamagaluru coffee", "poshtik coffee", "gen z coffee india"],
  authors: [{ name: "Janu Bhai Coffee Co." }],
  manifest: "/manifest.json",
  other: {
    "theme-color": "#FFB800",
    "msapplication-TileColor": "#FFB800",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Janu Bhai",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://janubhai.com",
    title: "Janu Bhai | The Smartest Cup in India",
    description: "Roz ki strong kahaani. Join India's fastest-growing decentralized coffee movement.",
    siteName: "Janu Bhai Coffee",
    images: [{
      url: "/farm.png",
      width: 1200,
      height: 630,
      alt: "Janu Bhai Coffee — India's Decentralized Coffee Movement"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Janu Bhai | The Smartest Cup in India",
    description: "Roz ki strong kahaani. Join India's fastest-growing decentralized coffee movement.",
    creator: "@janubhaicoffee",
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
import { InstallAppBanner } from "@/components/ui/InstallAppBanner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

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
          <ServiceWorkerRegistration />
          <InstallAppBanner />
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
