
import React from 'react';
import type { MediaType, Style } from '../types';
import { KeyIcon, LinkIcon, PhotoIcon, PlayIcon, SparklesIcon } from './icons';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  mediaType: MediaType;
  setMediaType: (type: MediaType) => void;
  style: Style;
  setStyle: (style: Style) => void;
  uploadedImage: File | null;
  setUploadedImage: (file: File | null) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isGenerating: boolean;
  onSubmit: () => void;
  apiKeySelected: boolean;
  onSelectApiKey: () => void;
}

const mediaOptions: { id: MediaType; label: string }[] = [
  { id: 'image', label: 'Image' },
  { id: 'animated-video', label: 'Animated Video' },
  { id: 'cinematic-video', label: 'Cinematic Video' },
];

const styleOptions: Style[] = ['Cinematic Realism', 'Anime', 'Photorealistic', 'Fantasy Art', 'Cyberpunk'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt, setPrompt, mediaType, setMediaType, style, setStyle, uploadedImage, setUploadedImage,
  webhookUrl, setWebhookUrl, isGenerating, onSubmit, apiKeySelected, onSelectApiKey
}) => {
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
      if(mediaType === 'image') setMediaType('animated-video');
    }
  };
  
  const isVideo = mediaType === 'animated-video' || mediaType === 'cinematic-video';

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          1. Enter Your Prompt
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          placeholder="e.g., A lonely robot walking in a neon-lit rainy city"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          2. Choose Media Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {mediaOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMediaType(option.id)}
              disabled={isGenerating}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                mediaType === option.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-2">
            3. Select Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value as Style)}
            disabled={isGenerating}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          >
            {styleOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            4. Upload Image (Optional)
          </label>
           <label htmlFor="file-upload" className={`relative cursor-pointer bg-gray-900 rounded-md p-3 border border-gray-600 hover:border-purple-500 transition flex items-center justify-center text-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <PhotoIcon className="w-5 h-5 mr-2 text-gray-400" />
             <span className="text-gray-400 truncate">{uploadedImage ? uploadedImage.name : 'Animate from image'}</span>
             <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} disabled={isGenerating} accept="image/*"/>
           </label>
        </div>
      </div>
      
       <div>
        <label htmlFor="webhook" className="block text-sm font-medium text-gray-300 mb-2">
          5. Zapier/IFTTT Webhook (Optional)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
             <LinkIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="webhook"
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            placeholder="https://hooks.zapier.com/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      </div>

      {isVideo && (
        <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded-lg text-yellow-300 text-sm">
         <p className="font-semibold">Video Generation Requires API Key</p>
         <p className="mt-1">
           Video generation is an experimental feature. You must select a valid API key with access to the Veo model. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">Billing info</a>.
         </p>
         <button 
           onClick={onSelectApiKey}
           disabled={isGenerating}
           className={`mt-2 flex items-center justify-center w-full px-4 py-2 border rounded-md text-sm font-medium transition ${apiKeySelected ? 'bg-green-600/20 border-green-500 text-green-300' : 'bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/40'}`}
         >
           <KeyIcon className="w-5 h-5 mr-2" />
           {apiKeySelected ? 'API Key Selected' : 'Select API Key'}
         </button>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isGenerating || (!prompt && !uploadedImage)}
        className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
      >
        <SparklesIcon className="w-5 h-5 mr-2"/>
        {isGenerating ? 'Creating...' : 'Generate'}
      </button>
    </div>
  );
};
