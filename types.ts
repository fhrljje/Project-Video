export enum GenerationStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  STORYBOARDING = 'STORYBOARDING',
  RENDERING = 'RENDERING',
  COMPLETE = 'COMPLETE',
}

// Augmented Global Window for AI Studio environment
declare global {
  // We extend the AIStudio interface which is expected by the existing Window.aistudio declaration
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

export interface NLPAnalysis {
  productName: string;
  features: string[];
  targetAudience: string;
  cta: string;
  marketingMood: string;
  suggestedAudioRatio: string; // e.g., "TTS: 100%, Music: 30%, SFX: 10%"
}

export interface StoryboardScene {
  id: number;
  type: 'HOOK' | 'SOLUTION' | 'BENEFIT' | 'CTA';
  duration: number;
  narrative: string;
  visualPrompt: string;
  cameraAngle: string;
  previewImageUrl?: string;
}

export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface VideoState {
  isGenerating: boolean;
  progress: number;
  videoUrl?: string;
  error?: string;
}