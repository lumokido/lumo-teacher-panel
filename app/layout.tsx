import type { Metadata } from "next";
import { Geist, Geist_Mono, Lavishly_Yours, Montserrat } from "next/font/google";
import { AppProviders } from "./providers";
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
  title: "Lumo Teacher Panel",
  description: "Lumo Teacher Panel",
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
