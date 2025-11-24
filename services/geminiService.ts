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
  
  // ARCHITECT NOTE: PART 1 - NLP LOGIC
  // Logic to extract 4 Key Entities: Product, Features, Target, CTA
  // Logic to determine Marketing Mood and strict Audio Ratio
  const prompt = `
    Act as a Senior Marketing AI Architect. Parse the following promotional text into a structured MVP technical plan.
    Input Text: "${text}"
    
    Extraction Rules:
    1. PRODUCT: Identify the main item/service.
    2. FEATURES: Extract specific attributes (e.g., "rasa coklat").
    3. TARGET_SITUATION: Identify the context/audience (e.g., "sarapan cepat").
    4. CTA_INCENTIVE: Identify the action and deal (e.g., "beli sekarang diskon 20%").
    
    Analysis Rules:
    - Determine 'marketingMood' based on keywords (e.g., 'Promo' -> 'Urgent', 'Health' -> 'Calm').
    - Set 'suggestedAudioRatio' STRICTLY to "TTS: 100%, Music: 30%, SFX: 10%" as per technical standard.

    Return JSON.
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

  // ARCHITECT NOTE: PART 2 - STORYBOARD LOGIC
  // Fixed 25s duration, 4 scenes, specific visual instruction injection.
  const prompt = `
    Create a strict 4-scene storyboard for a 25-second promotional video (MVP Standard).
    
    Context:
    - Product: ${analysis.productName}
    - Features: ${analysis.features.join(', ')}
    - Target: ${analysis.targetAudience}
    - Mood: ${analysis.marketingMood}
    - Brand Color: ${brandColor}

    Structure (Must sum to approx 25s):
    1. HOOK (Approx 5s): Visualizing the problem/need (${analysis.targetAudience}).
    2. SOLUTION (Approx 7s): Introducing ${analysis.productName} clearly.
    3. BENEFIT (Approx 8s): Visual proof of features (${analysis.features}).
    4. CTA (Approx 5s): Final driver for '${analysis.cta}'.

    Visual Instruction Logic (Automated Rules):
    - IF text implies "Discount", "Sale", "Promo" -> Visual Prompt MUST include "flashing red overlay" or "dynamic pop-up text".
    - IF mood is "Calm" -> Visual Prompt MUST include "soft lighting, slow cinematic pan".
    - IF mood is "Urgent" -> Visual Prompt MUST include "fast cuts, bright saturation".
    - ALWAYS mention the Brand Color (${brandColor}) in the visual elements (e.g., props, background, or lighting).

    Return JSON Array.
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

  // ARCHITECT NOTE: PART 1 - VISUAL CORE
  // Using Veo (Diffusion) as recommended for superior consistency over GANs.
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