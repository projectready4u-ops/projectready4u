import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Marketplace - Buy Academic Projects",
  description: "Get final year projects with full source code, reports, PPT, and more",
  openGraph: {
    title: "Project Marketplace",
    description: "Browse and purchase academic projects ready to submit",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-[#0a0a0a] text-white`}>
        {children}
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}
