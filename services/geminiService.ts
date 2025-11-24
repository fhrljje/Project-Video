import { GoogleGenAI, Type } from "@google/genai";
import { NLPAnalysis, StoryboardScene } from "../types";

// Helper to get client with current key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const analyzeMarketingText = async (text: string): Promise<NLPAnalysis> => {
  const ai = getClient();
  
  const prompt = `
    You are a Senior Marketing AI Analyst. Parse the following promotional text into structured entities.
    Text: "${text}"
    
    Return JSON with:
    - productName
    - features (array of strings)
    - targetAudience
    - cta (Call to Action)
    - marketingMood (one word adjective)
    - suggestedAudioRatio (e.g., "TTS: 100%, Music: 30%, SFX: 10%")
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING },
          cta: { type: Type.STRING },
          marketingMood: { type: Type.STRING },
          suggestedAudioRatio: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) throw new Error("No analysis generated");
  return JSON.parse(response.text) as NLPAnalysis;
};

export const generateStoryboard = async (analysis: NLPAnalysis, brandColor: string): Promise<StoryboardScene[]> => {
  const ai = getClient();

  const prompt = `
    Create a strictly structured 4-scene video storyboard for a 25-second promotional video.
    Product: ${analysis.productName}
    Features: ${analysis.features.join(', ')}
    Target: ${analysis.targetAudience}
    Brand Color Hex: ${brandColor}

    Structure:
    1. HOOK (Capture attention, problem statement)
    2. SOLUTION (Introduce product)
    3. BENEFIT (Key advantages)
    4. CTA (Call to action)

    Visual Rules:
    - If text implies "Discount" or "Sale", visually suggest a "Red Flash overlay" or dynamic text.
    - Ensure visual descriptions are highly detailed for video generation models.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            type: { type: Type.STRING, enum: ['HOOK', 'SOLUTION', 'BENEFIT', 'CTA'] },
            duration: { type: Type.NUMBER },
            narrative: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            cameraAngle: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("No storyboard generated");
  return JSON.parse(response.text) as StoryboardScene[];
};

export const generateScenePreview = async (scenePrompt: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: scenePrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e) {
    console.error("Image gen failed", e);
    return 'https://picsum.photos/800/450?grayscale'; // Fallback
  }
};

export const generateVeoVideo = async (prompt: string): Promise<string> => {
  const ai = getClient();

  // Using Veo fast for MVP speed
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video generation failed to return a URI");

  // Fetch with API key appended
  const videoRes = await fetch(`${uri}&key=${process.env.API_KEY}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};