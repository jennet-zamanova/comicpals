import { NextResponse } from 'next/server';
import Replicate from 'replicate';


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});


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

    const imageUrl = String(output);

    if (!imageUrl) {
        throw new Error('No image data in the response');
      }

    const response = await fetch('https://sundai-backend-167199521353.us-east4.run.app/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: "IMAGE: " + prompt,
            image_url: imageUrl
        })
        });

    console.log('Processed image data URL length:', imageUrl);

    return NextResponse.json({ images: [imageUrl] });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: "Failed to generate image: " + (error as Error).message },
      { status: 500 }
    );
  }
}
