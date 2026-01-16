import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zenith AI Academy - Master Automation Engineering & Entrepreneurship",
  description: "Master automation engineering and entrepreneurship with our comprehensive learning platform. Two paths, one destination: AI Arbitrage Success.",
  keywords: ["LMS", "learning", "engineering", "entrepreneurship", "AI", "automation", "online business"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
