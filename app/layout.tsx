import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KU Seerath Competition",
  description: "A competition for KU students as well staffs in exploring the life of Prophet Muhammad (PBUH).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#064e3b', // emerald-900
              color: '#fff',
              borderRadius: '1rem',
              padding: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              fontFamily: 'inherit',
            },
            success: {
              iconTheme: {
                primary: '#fbbf24', // amber-400
                secondary: '#064e3b',
              },
            },
            error: {
              style: {
                background: '#7f1d1d', // red-900
              },
              iconTheme: {
                primary: '#fecaca', // red-200
                secondary: '#7f1d1d',
              },
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
