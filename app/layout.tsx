import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lavishly_Yours, Montserrat } from "next/font/google";
import { AppProviders } from "./providers";
import PwaRegister from "@/components/pwa/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const lavishlyYours = Lavishly_Yours({
  variable: "--font-lavishly",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Alphores Teacher Panel",
  description: "Alphores School teacher and principal staff portal",
  applicationName: "Alphores Teacher Panel",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alphores",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${lavishlyYours.variable} h-full bg-white antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>
          {children}
          <PwaRegister />
        </AppProviders>
      </body>
    </html>
  );
}
