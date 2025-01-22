'use client'
import { useState } from "react";
import Image from "next/image";
import { Bangers, Chau_Philomene_One } from "next/font/google";

type ComicPanel = {
  image: string;
  caption: string;
};

const bangers = Bangers({ 
  weight: '400',
  subsets: ['latin'],
});

const caption = Chau_Philomene_One({
  weight: '400',
  subsets: ['latin'],
});

export default function CreateComic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-10">
      <main className="w-4/5 mx-auto flex flex-col gap-8 items-center sm:items-start w-full">
      <h1 className={`text-4xl sm:text-5xl font-bold sm:pl-5 tracking-wide uppercase ${bangers.className} text-gray-800`}>
          Create a Comic
        </h1>
        {comicPanels.length === 0 && (
          <div className="w-4/5 mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            {[...Array(3)].map((_, index) => (
              <div key={index} className={`flex flex-col gap-4 ${index > 0 ? 'hidden md:flex' : ''}`}>
                <div className="relative aspect-square w-full">
                  <Image
                    className="dark:invert opacity-50"
                    src="/comic.jpeg"
                    alt="Comic Logo"
                    fill
                    priority
                  />
                </div>
                <p className={`text-center text-lg ${caption.className}`}>Example caption</p>
              </div>
            ))}
          </div>

        )}
      {comicPanels.length > 0 && (
          <div className="w-4/5 mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mt-8">
            {comicPanels.map((panel, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="relative aspect-square w-full">
                  <Image
                    src={panel.image}
                    alt={`Comic panel ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                    unoptimized={true}
                  />
                </div>
                <p className={`text-center text-lg ${caption.className}`}>{panel.caption}</p>
              </div>
            ))}
          </div>
        )}
        
        
        <form 
          className="w-4/5 mx-auto"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            
            const formData = new FormData(e.currentTarget);
            const prompt = formData.get('prompt');
            
            try {
              const response = await fetch('/api/generate-comic', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to generate comic');
              }
              
              const data = await response.json();
              setComicPanels(data.panels);
            } catch (error) {
              console.error('Error:', error);
              setError('Failed to generate comic. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="flex flex-col gap-4">
            <textarea
              name="prompt"
              className="w-full p-4 border rounded-lg resize-none h-32 border-gray-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Describe your comic story... (Press Enter to submit)"
              required
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className={`px-6 py-2 bg-gray-800 text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-600 ${caption.className} text-xl tracking-wide`}
              disabled={loading}
            >
              {loading ? 'Generating Comic...' : 'Generate Comic'}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

      </main>
    </div>
  );
} 