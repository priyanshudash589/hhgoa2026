import type { Metadata } from "next";
import { Imbue, Victor_Mono } from "next/font/google";
import "./globals.css";
import "../components/ui/LogoLoop.css";

const victorMono = Victor_Mono({
  variable: "--font-victor-mono",
  subsets: ["latin"],
  display: "swap",
});

const imbue = Imbue({
  variable: "--font-imbue",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "HH GOA | Hacker House Goa 2026",
  description: "4 days. one rhythm. everything intentional. Join us for an experimental hackathon experience in Goa, India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${victorMono.variable} ${imbue.variable}`}>
      <body className="min-h-full flex flex-col antialiased scroll-smooth">
        {children}
      </body>
    </html>
  );
}
