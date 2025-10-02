import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Orbitron,
  Smooch_Sans,
  Tomorrow,
  VT323,
} from "next/font/google";
import { Providers } from "../components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const smooth_sans = Smooch_Sans({
  variable: "--font-smooth-sans",
  subsets: ["latin"],
});

const tomorrow = Tomorrow({
  variable: "--font-tomorrow",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "EVENTURE - AI Event Manager",
  description: "Intelligent automation for seamless event creation, promotion & engagement",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${tomorrow.variable} ${smooth_sans.variable} ${geistMono.variable} ${vt323.variable} ${orbitron.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
