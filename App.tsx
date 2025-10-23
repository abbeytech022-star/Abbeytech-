
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { Loader } from './components/Loader';
import { Output, MediaType, Style } from './types';
import { generateImage, generateVideo, generateCaption } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

// Extend the Window interface to include aistudio
declare global {
  // FIX: Replaced inline type with a named interface `AIStudio` to resolve declaration conflicts.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [style, setStyle] = useState<Style>('Cinematic Realism');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race conditions, user will be prompted again on failure.
      setApiKeySelected(true); 
    }
  };

  const sendWebhook = useCallback(async (data: Output) => {
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error('Failed to send webhook:', e);
      setError('Media generated, but failed to send webhook. Check the URL and your automation setup.');
    }
  }, [webhookUrl]);

  const handleSubmit = async () => {
    if (!prompt && !uploadedImage) {
      setError('Please enter a prompt or upload an image.');
      return;
    }

    if ((mediaType === 'animated-video' || mediaType === 'cinematic-video') && !apiKeySelected) {
      setError('Please select an API key to generate videos.');
      handleSelectApiKey();
      return;
    }

    setError(null);
    setOutput(null);
    setIsLoading(true);

    try {
      let mediaUrl = '';
      let mediaDescription = '';
      const fullPrompt = `${prompt} - Style: ${style}.`;
      
      if (mediaType === 'image') {
        setLoadingMessage('Crafting your vision into a stunning image...');
        mediaUrl = await generateImage(fullPrompt);
        mediaDescription = `High-quality image generated from prompt: "${prompt}"`;
      } else {
        setLoadingMessage('Preparing the digital canvas for your video...');
        const imageBase64 = uploadedImage ? await fileToBase64(uploadedImage) : null;
        mediaUrl = await generateVideo(fullPrompt, imageBase64, (message) => setLoadingMessage(message));
        
        if (uploadedImage) {
          mediaDescription = `Animated video created from an uploaded image with prompt: "${prompt}"`;
        } else {
          mediaDescription = `Cinematic video generated from prompt: "${prompt}"`;
        }
      }

      setLoadingMessage('Writing a viral caption for your masterpiece...');
      const caption = await generateCaption(prompt);

      const finalOutput: Output = {
        type: mediaType === 'image' ? 'image' : 'video',
        description: mediaDescription,
        caption: caption,
        url: mediaUrl,
      };

      setOutput(finalOutput);
      await sendWebhook(finalOutput);

    } catch (e: any) {
      console.error(e);
      let errorMessage = e.message || 'An unknown error occurred.';
      if (errorMessage.includes('Requested entity was not found')) {
        errorMessage = 'API Key is invalid or not found. Please select a valid API key.';
        setApiKeySelected(false);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ControlPanel
            prompt={prompt}
            setPrompt={setPrompt}
            mediaType={mediaType}
            setMediaType={setMediaType}
            style={style}
            setStyle={setStyle}
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            isGenerating={isLoading}
            onSubmit={handleSubmit}
            apiKeySelected={apiKeySelected}
            onSelectApiKey={handleSelectApiKey}
          />
          <div className="flex flex-col">
            {isLoading && <Loader message={loadingMessage} />}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            {output && !isLoading && <OutputDisplay output={output} />}
            {!isLoading && !output && !error && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center justify-center p-8 h-full text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white">Your creation will appear here</h3>
                <p className="text-gray-400 mt-2">Enter a prompt, choose your settings, and let the magic begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;