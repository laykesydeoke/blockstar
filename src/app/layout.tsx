import type { Metadata } from "next";
import { Montserrat, League_Spartan, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

export const dynamic = 'force-dynamic';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlockStar - I have knowledge of Blockchain and Stacks",
  description: "Master blockchain concepts through interactive quizzes and earn Bitcoin rewards. Educational platform built on Stacks. Built for Let Africa Build.",
  keywords: ["blockstar", "stacks", "blockchain", "education", "bitcoin", "learn", "quiz", "STX", "africa"],
  authors: [{ name: "Lekan (Laykesydeoke)" }],
  openGraph: {
    title: "BlockStar - I have knowledge of Blockchain and Stacks",
    description: "Master blockchain concepts and earn Bitcoin rewards through interactive learning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.variable} ${leagueSpartan.variable} ${jetbrainsMono.variable} font-sans bg-background text-white antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
