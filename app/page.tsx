'use client'
import Image from "next/image";
import { useState } from "react";

export default function Home() {
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        {!generatedImage && <Image
          className="dark:invert"
          src="/comic.jpeg"
          alt="Comic Logo"
          width={180}
          height={180}
          priority
        />}

        {generatedImage && (
          <div className="mt-8">
            <Image
              src={generatedImage}
              alt="Generated image"
              width={240}
              height={240}
              className="rounded-lg"
            />
          </div>
        )}

        {/* <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div> */}

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
              console.log(data.images);
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
              className="w-full p-4 border rounded-lg resize-none h-32 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Enter your prompt here... (Press Enter to submit)"
              required
              disabled={loading}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate'}
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
