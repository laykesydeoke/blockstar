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

const siteUrl = "https://blockchainstar.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BlockStar - I have knowledge of Blockchain and Stacks",
    template: "%s | BlockStar",
  },
  description: "Real-time multiplayer quiz games on Stacks blockchain. Create games, stake STX, and compete for prizes. Built for Let Africa Build.",
  keywords: ["blockstar", "stacks", "blockchain", "quiz", "bitcoin", "STX", "multiplayer", "web3", "africa", "kahoot"],
  authors: [{ name: "Lekan (Laykesydeoke)" }],
  creator: "Lekan (Laykesydeoke)",
  publisher: "BlockStar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "BlockStar - I have knowledge of Blockchain and Stacks",
    description: "Real-time multiplayer quiz games on Stacks blockchain. Create games, stake STX, and compete for prizes.",
    url: siteUrl,
    siteName: "BlockStar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BlockStar - Real-Time Quiz Games on Stacks Blockchain",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlockStar - I have knowledge of Blockchain and Stacks",
    description: "Real-time multiplayer quiz games on Stacks blockchain. Stake STX and compete for prizes.",
    images: ["/twitter-image.png"],
  },
  other: {
    "theme-color": "#6366F1",
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
