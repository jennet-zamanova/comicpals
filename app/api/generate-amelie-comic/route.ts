import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { OpenAI } from 'openai';


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const MODEL = "sundai-club/flux-jz-amelie:5ff86f220712f23dcbb9c96d1b17c19a9471c4f21c79244cc01d3c5304fcdd82";

const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: GITHUB_TOKEN,
})

interface Panel {
  prompt: string;
  caption: string;
}

export const maxDuration = 60; // Set max duration to 60 seconds (1 minute)
export const dynamic = 'force-dynamic';

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
    1. An image generation prompt that includes 'AM3L13 a woman wearing glasses' and ends with 'cartoonish style, warm colors'
    2. A caption that refers to the college student as 'Amelie'

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
        MODEL,
        {
          input: {
            prompt: panel.prompt,
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

      return {
        image: imageUrl,
        caption: panel.caption
      };
    }));

    // Save images sequentially to maintain order
    for (let i = 0; i < panelsWithImages.length; i++) {
      const panel = panelsWithImages[i];
      try {
        console.log("Saving image with caption: ", panel.caption);
        const saveResponse = await fetch('https://sundai-backend-167199521353.us-east4.run.app/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `COMIC AMELIE: ${panel.caption}`,
            image_url: panel.image
          })
        });

        console.log("Saved image with caption: ", panel.caption);

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          console.error('Failed to save image:', errorText);
        }
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }

    return NextResponse.json({ panels: panelsWithImages });

  } catch (error) {
    console.error('Error generating comic:', error);
    return NextResponse.json(
      { error: "Failed to generate comic: " + (error as Error).message },
      { status: 500 }
    );
  }
}