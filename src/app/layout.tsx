import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M3TRIC — Multiscale Geospatial Analytics Platform",
  description:
    "Real-time spatio-temporal intelligence. Transform environmental and geospatial data into actionable insights across micro, meso, and macro scales.",
  keywords: ["geospatial", "analytics", "environmental", "IoT", "PostGIS", "real-time"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased noise`}
      >
        {children}
      </body>
    </html>
  );
}
