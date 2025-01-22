import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { OpenAI } from 'openai';


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;


const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: GITHUB_TOKEN,
})

interface Panel {
  prompt: string;
  caption: string;
}

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

  const concatenated = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
  let position = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, position);
    position += chunk.length;
  }

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

    const system_prompt = `
    Create a 3-panel comic story about a college student's adventure described in the prompt. For each panel, provide:
    1. An image generation prompt that includes 'NURK1 a woman wearing glasses' and ends with 'cartoonish style, warm colors'
    2. A caption that refers to the college student as 'Nurki'

    Format the output as JSON with this structure:
    {
        "comics": [
            {
                "prompt": "Image generation prompt here",
                "caption": "Caption text here"
            }
        ]
    }
    `;

    // First, generate the story breakdown into 3 panels
    const storyResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {role: "system", "content": system_prompt},
        {
        role: "user",
        content: prompt
      }],
        response_format: { type: "json_object" }
      });

    const storyData = storyResponse.choices[0].message.content;
    const panels = JSON.parse(storyData || "{}").comics;

    // Generate images for each panel
    const panelsWithImages = await Promise.all(panels.map(async (panel: Panel) => {
      const output = await replicate.run(
        "sundai-club/flux-jz-nurki:62682deb2a03f989c2ee9ef086f874ea48774605232e58b0f5e574609df20d97",
        {
          input: {
            prompt: panel.prompt,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
          },
        }
      );

      let imageUrl;
      if (output && Array.isArray(output) && output[0] instanceof ReadableStream) {
        imageUrl = await streamToBase64(output[0]);
      }

      return {
        image: imageUrl,
        caption: panel.caption
      };
    }));

    return NextResponse.json({ panels: panelsWithImages });

  } catch (error) {
    console.error('Error generating comic:', error);
    return NextResponse.json(
      { error: "Failed to generate comic: " + (error as Error).message },
      { status: 500 }
    );
  }
}