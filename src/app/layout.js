import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
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
  title: "Janu Bhai Coffee",
  description: "Desi, clean, and premium coffee from the hills of Chikmagaluru.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`}>
        <CartProvider>
          <TopBar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
