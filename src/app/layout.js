import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";

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
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dot-grid`}
      >
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              var savedTheme = localStorage.getItem('theme');
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              var activeTheme = savedTheme || systemTheme;
              if (activeTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `}
        </Script>
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}