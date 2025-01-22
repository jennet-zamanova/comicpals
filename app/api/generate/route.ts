import { NextResponse } from 'next/server';
import Replicate from 'replicate';


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

async function streamToBase64(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  // Concatenate chunks into a single Uint8Array
  const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let position = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, position);
    position += chunk.length;
  }

  // Convert to base64
  const base64 = Buffer.from(concatenated).toString('base64');
  return `data:image/webp;base64,${base64}`;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log('Starting image generation with prompt:', prompt);

    const output = await replicate.run(
      "sundai-club/flux-jz-nurki:62682deb2a03f989c2ee9ef086f874ea48774605232e58b0f5e574609df20d97",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        },
      }
    );

    // console.log("Image saved as output.png", output);
    // // Convert the stream to actual image URLs
    // const imageUrls = Array.isArray(output) ? output : [output];
    // // await writeFile("./output.png", imageUrls[0]);
    // Handle different possible output formats
    let imageUrl;
    if (output && Array.isArray(output) && output[0] instanceof ReadableStream) {
      imageUrl = await streamToBase64(output[0]);
    } else if (typeof output === 'string') {
      imageUrl = output;
    }

    if (!imageUrl) {
      throw new Error('No image data in the response');
    }

    console.log('Processed image data URL length:', imageUrl.length);

    return NextResponse.json({ images: [imageUrl] });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: "Failed to generate image: " + (error as Error).message },
      { status: 500 }
    );
  }
}
