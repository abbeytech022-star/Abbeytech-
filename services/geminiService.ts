
import { GoogleGenAI } from "@google/genai";

const POLLING_INTERVAL = 10000; // 10 seconds

const videoGenerationMessages = [
    "Summoning digital artists...",
    "Mixing colors on a virtual palette...",
    "Rendering the first few frames...",
    "Applying cinematic lighting effects...",
    "This is taking a bit longer than usual, but greatness is worth the wait.",
    "Compositing scenes together...",
    "Adding the final touches of magic...",
    "Almost there! Polishing your masterpiece."
];

export const generateImage = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
            outputMimeType: 'image/png',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const generateVideo = async (
    prompt: string, 
    imageBase64: string | null,
    updateLoadingMessage: (message: string) => void
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    // Create a new instance right before the call to use the latest key from the dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        ...(imageBase64 && { image: { imageBytes: imageBase64, mimeType: 'image/png' } }),
        config: {
            numberOfVideos: 1,
            resolution: '1080p',
            aspectRatio: '16:9'
        }
    });

    let messageIndex = 0;
    while (!operation.done) {
        updateLoadingMessage(videoGenerationMessages[messageIndex % videoGenerationMessages.length]);
        messageIndex++;
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error("Video generation completed, but no video URI was returned.");
    }

    const downloadLink = operation.response.generatedVideos[0].video.uri;
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if(!videoResponse.ok) {
        throw new Error(`Failed to download video. Status: ${videoResponse.statusText}`);
    }
    
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateCaption = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this prompt: "${prompt}", write a short viral caption for social media (like Instagram/TikTok). The caption should be a maximum of 15 words, include 3 relevant hashtags, and one emoji.`,
        config: {
            systemInstruction: "You are a witty social media expert, skilled at crafting short, engaging, and viral captions.",
        },
    });
    
    return response.text.trim();
};
