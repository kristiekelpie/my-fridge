import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Caveat, Fredoka } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-magnet" });

export const metadata: Metadata = {
  title: "Our Fridge",
  description: "A shared kitchen, kept in mind.",
  applicationName: "Our Fridge",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png?v=3", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Our Fridge",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#E8E4D7",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} ${caveat.variable} ${fredoka.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
