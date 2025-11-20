import { GoogleGenAI } from "@google/genai";
import { VideoSettings } from "../types";

// Initialize Gemini Client
// We create a function to get the client to ensure we pick up the key *after* selection
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key first.");
  }
  return new GoogleGenAI({ apiKey });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const checkApiKey = async (): Promise<boolean> => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        return await window.aistudio.hasSelectedApiKey();
    }
    return false;
};

export const requestApiKey = async (): Promise<void> => {
    if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
    } else {
        console.warn("AI Studio Key Selection not available in this environment.");
    }
};

export const generateStoryClip = async (
  file: File,
  prompt: string,
  settings: VideoSettings
): Promise<string> => {
  const ai = getAiClient();
  const base64Image = await fileToBase64(file);
  const mimeType = file.type;

  // Veo generation
  // Note: Veo 3.1 preview supports image-to-video
  
  let operation;
  
  try {
      operation = await ai.models.generateVideos({
        model: settings.model,
        prompt: prompt, 
        image: {
            imageBytes: base64Image,
            mimeType: mimeType
        },
        config: {
          numberOfVideos: 1,
          resolution: settings.resolution,
          aspectRatio: settings.aspectRatio,
          // Duration control is not fully exposed in all preview models yet, 
          // but we pass it if the API evolves or ignores it gracefully.
        }
      });
  } catch (e) {
      console.error("Initial generation request failed", e);
      throw e;
  }

  // Polling
  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (e) {
        console.error("Polling failed", e);
        throw new Error("Failed to check video status.");
    }
  }

  // Check for success
  if (operation.response && operation.response.generatedVideos && operation.response.generatedVideos.length > 0) {
      const videoUri = operation.response.generatedVideos[0].video?.uri;
      if (!videoUri) throw new Error("No video URI returned.");
      
      // We need to fetch the actual video blob because the URI requires the API key appended 
      // and usually expires or needs specific headers.
      // The guide says: fetch(`${downloadLink}&key=${process.env.API_KEY}`)
      
      const downloadUrl = `${videoUri}&key=${process.env.API_KEY}`;
      return downloadUrl;
  } else {
      throw new Error("Video generation completed but returned no data.");
  }
};