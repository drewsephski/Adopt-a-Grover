import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pitch In List | Gift Donations for Families",
  description:
    "Help local families in Fox River Grove by claiming gifts for the holiday season. A community-driven donation coordination platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ThemeProvider>
        <html lang="en" className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
          <body
            className="antialiased min-h-screen flex flex-col"
            suppressHydrationWarning
          >
            <AppWrapper>{children}</AppWrapper>
            <Toaster position="top-center" />
          </body>
        </html>
      </ThemeProvider>
    </ClerkProvider>
  );
}
