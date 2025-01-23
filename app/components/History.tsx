'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Chau_Philomene_One } from 'next/font/google';

interface HistoryItem {
  prompt: string;
  image_url: string;
  created_at: string;
}

const caption = Chau_Philomene_One({
    weight: '400',
    subsets: ['latin'],
  });

export default function History(props: {type: string}) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://sundai-backend-167199521353.us-east4.run.app/history');
        const data = await response.json();
        // Sort data by created_at in descending order (newest first)
        const sortedData = data.sort((a: HistoryItem, b: HistoryItem) => 
           new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const filteredData = sortedData.filter((item: HistoryItem) => item.prompt.startsWith(props.type)).map((item: HistoryItem) => ({
          ...item,
          prompt: item.prompt.replace(props.type, '')
        }));
        console.log("Data:", filteredData);
        setHistory(filteredData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-12 w-full mx-auto mt-8 mb-16">
        {loading ? (
          <p>Loading...</p>
        ) : history.length > 0 ? (
          Array.from({ length: Math.ceil(history.length / 3) }).map((_, rowIndex) => (
            <div key={rowIndex}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {history.slice(rowIndex * 3, (rowIndex + 1) * 3).map((item, index) => (
                  <div key={index} className="flex flex-col gap-4">
                    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                      <Image
                        src={item.image_url}
                        alt={item.prompt}
                        fill
                        className="rounded-lg object-cover"
                        unoptimized={true}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{item.prompt}</p>
                  </div>
                ))}
              </div>
              {rowIndex < Math.ceil(history.length / 3) - 1 && (
                <hr className="w-5/6 mx-auto border-gray-300 my-12" />
              )}
            </div>
          ))
        ) : (
          <p>No history available</p>
        )}
      </div>
    </>
  );
} 