
import React, { useState } from 'react';
import type { Output } from '../types';
import { CopyIcon } from './icons';

interface OutputDisplayProps {
  output: Output;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="aspect-w-16 aspect-h-9 bg-gray-900">
        {output.type === 'image' ? (
          <img src={output.url} alt={output.description} className="w-full h-full object-contain" />
        ) : (
          <video src={output.url} controls autoPlay loop className="w-full h-full object-contain" />
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-600">
          <p className="text-white font-medium">✨ Caption</p>
          <p className="text-gray-300 mt-1">{output.caption}</p>
        </div>
        <div className="mt-4 flex-grow">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">
              JSON Output for Automation
            </label>
            <button onClick={handleCopy} className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center">
              <CopyIcon className="w-4 h-4 mr-1"/>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-900 text-sm text-cyan-300 p-3 rounded-md overflow-x-auto h-48 border border-gray-700">
            <code>{JSON.stringify(output, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
