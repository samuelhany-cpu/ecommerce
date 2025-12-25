import { Outfit, Cormorant_Garamond } from "next/font/google"; // Premium fonts
import Navbar from "@/components/Navbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  display: 'swap',
});

export const metadata = {
  title: "LuxeLeather | Organic Premium Bags",
  description: "Handcrafted organic leather bags for women and men.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${cormorant.variable} antialiased bg-cream dark:bg-charcoal text-primary dark:text-cream min-h-screen flex flex-col`}
      >
        <CartProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <footer className="py-8 text-center text-sm opacity-60">
            &copy; {new Date().getFullYear()} LuxeLeather. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
