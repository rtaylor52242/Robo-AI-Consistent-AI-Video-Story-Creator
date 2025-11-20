export interface StoryClip {
  id: number;
  imageFile: File | null;
  imageUrl: string | null;
  prompt: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  videoUrl: string | null;
  error?: string;
}

export interface VideoSettings {
  model: 'veo-3.1-generate-preview' | 'veo-3.1-fast-generate-preview'; // We focus on Veo as per Gemini API availability
  durationSeconds: number; // Note: Veo often decides duration, but we keep UI for potential future control
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16' | '1:1';
  consistencyMode: boolean;
}

// Extended window interface for JSZip loaded via CDN
declare global {
  interface Window {
    JSZip: any;
  }

  // Augment the existing AIStudio interface to include the required methods
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}