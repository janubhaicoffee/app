import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import InterceptorModal from "@/components/InterceptorModal";
import RegisterSW from "@/components/RegisterSW";
import { headers } from "next/headers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1a1a1a",
};

export const metadata = {
  title: {
    default: "Janu Bhai Coffee | Premium Chikmagalur Coffee Delivered PAN India",
    template: "%s | Janu Bhai Coffee"
  },
  description: "Authentic, small-batch roasted coffee from the hills of Chikmagaluru. Available for retail and commercial wholesale. Delhi-based brand delivering fresh coffee PAN India.",
  keywords: [
    "buy coffee online India", 
    "Chikmagalur coffee", 
    "wholesale coffee beans Delhi", 
    "B2B coffee suppliers India", 
    "premium instant coffee", 
    "South Indian filter coffee blend", 
    "Janu Bhai Coffee", 
    "fresh roasted coffee PAN India"
  ],
  authors: [{ name: "Janu Bhai Coffee" }],
  creator: "Janu Bhai Coffee",
  metadataBase: new URL("https://janubhaicoffee.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "Janu Bhai Coffee | Premium Chikmagalur Coffee",
    description: "Authentic, small-batch roasted coffee from Chikmagaluru. Retail and commercial wholesale, delivered PAN India.",
    siteName: "Janu Bhai Coffee",
    images: [{
      url: "/arsalanazad.png",
      width: 1200,
      height: 630,
      alt: "Janu Bhai Coffee - Born in the hills. Brewed for you."
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Janu Bhai Coffee",
    description: "Authentic, small-batch roasted Chikmagalur coffee. Retail & wholesale.",
    images: ["/arsalanazad.png"],
  },
  alternates: {
    canonical: "/",
  }
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isSubdomain = host.startsWith("admin.") || host.startsWith("outlet.") || host.startsWith("pos.");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Janu Bhai Coffee",
    "url": "https://janubhaicoffee.com",
    "logo": "https://janubhaicoffee.com/icon.png",
    "description": "Authentic, small-batch roasted coffee from the hills of Chikmagaluru. Available for retail and commercial wholesale.",
    "sameAs": [
      "https://www.instagram.com/janubhaicoffee",
      "https://twitter.com/janubhaicoffee"
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="JBC POS" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${playfair.variable} ${inter.variable}`}>
        <RegisterSW />
        <Toaster position="top-center" />
        <AuthProvider>
          <CartProvider>
            {!isSubdomain && <TopBar />}
            <InterceptorModal />
            {children}
            {!isSubdomain && <Footer />}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
