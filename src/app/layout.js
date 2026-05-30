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

export const metadata = {
  title: "CampusPulseAI — Intelligent Campus Event Platform",
  description:
    "Discover, register, and engage with campus events powered by AI recommendations. CampusPulseAI brings your campus community together.",
  keywords: "campus events, AI recommendations, student events, hackathon, workshops",
  openGraph: {
    title: "CampusPulseAI",
    description: "AI-powered campus event management and recommendation platform",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0F1E] text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
