export enum GenerationStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  STORYBOARDING = 'STORYBOARDING',
  RENDERING = 'RENDERING',
  COMPLETE = 'COMPLETE',
}

export interface NLPAnalysis {
  productName: string;
  features: string[];
  targetAudience: string;
  cta: string;
  marketingMood: string;
  suggestedAudioRatio: string;
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