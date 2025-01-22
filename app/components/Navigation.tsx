'use client'
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Bangers, Chau_Philomene_One } from "next/font/google";

const bangers = Bangers({
  weight: '400',
  subsets: ["latin"],
});

const comic = Chau_Philomene_One({ 
  weight: '400',
  subsets: ['latin'],
});

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-0">
        <Link 
          href="/create-comic" 
          className={`hover:text-yellow-500 transition-colors ${bangers.className} text-2xl sm:text-3xl text-yellow-400`}
        >
          ComicPals
        </Link>
        <div className="flex gap-8 sm:gap-20">
          <Link 
            href="/create-image" 
            className={`transition-colors ${comic.className} text-lg sm:text-xl ${
              pathname === '/create-image' ? 'text-yellow-400 hover:text-yellow-500' : 'text-white hover:text-gray-300'
            }`}
          >
            Image
          </Link>
          <Link 
            href="/create-comic" 
            className={`transition-colors ${comic.className} text-lg sm:text-xl ${
              pathname === '/create-comic' ? 'text-yellow-400 hover:text-yellow-500' : 'text-white hover:text-gray-300'
            }`}
          >
            Comic
          </Link>
        </div>
      </div>
    </nav>
  );
} 