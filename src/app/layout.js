import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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

export default function RootLayout({ children }) {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${playfair.variable} ${inter.variable}`}>
        <CartProvider>
          <TopBar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
