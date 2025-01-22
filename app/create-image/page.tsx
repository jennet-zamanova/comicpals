'use client'
import Image from "next/image";
import { useState } from "react";
import { Bangers, Chau_Philomene_One } from "next/font/google";


const bangers = Bangers({
    weight: '400',
    subsets: ['latin'],
  });

const passionOne = Chau_Philomene_One({
weight: '400',
subsets: ['latin'],
});

export default function CreateImage() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <main className="w-4/5 mx-auto flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
      <h1 className={`text-4xl sm:text-5xl font-bold sm:pl-5 uppercase ${bangers.className} text-gray-800`}>
          Create an Image
        </h1>
        {!generatedImage && (
          <div className="w-3/5 mx-auto flex justify-center h-full">
            <Image
              className="dark:invert"
              src="/comic.jpeg"
              alt="Comic Logo"
              width={240}
              height={240}
              priority
            />
          </div>
        )}

        {generatedImage && (
          <div className="mt-8 w-3/5 mx-auto flex justify-center">
            <Image
              src={generatedImage}
              alt="Generated image"
              width={240}
              height={240}
              className="rounded-lg h-auto"
            />
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
              const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to generate image');
              }
              
              const data = await response.json();
              setGeneratedImage(data.images[0]); 
            } catch (error) {
              console.error('Error:', error);
              setError('Failed to generate image. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="flex flex-col gap-4">
            <textarea
              name="prompt"
              className="w-full p-4 border rounded-lg resize-none h-32 border-gray-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter your prompt here... (Press Enter to submit)"
              required
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className={`px-6 py-2 bg-gray-800 text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-600 ${passionOne.className} text-lg tracking-wide`}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Image'}
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