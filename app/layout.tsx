import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Bangers, Comic_Neue, Fredoka, Passion_One } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ subsets: ["latin"] });

const bangers = Bangers({ 
  weight: '400',
  subsets: ['latin'],
});

const comic = Fredoka({ 
  weight: '300',
  subsets: ['latin'],
});

const passionOne = Passion_One({
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "AI Comic Generator",
  description: "Generate comics and images using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
