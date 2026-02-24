import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "2Phim — Xem Phim Online Miễn Phí",
  description: "Xem phim, TV show miễn phí chất lượng cao tại 2Phim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.className} bg-gray-950 antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
