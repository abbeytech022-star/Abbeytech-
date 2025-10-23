
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center justify-center p-8 h-full text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      <h3 className="text-xl font-semibold text-white mt-6">Creating Magic...</h3>
      <p className="text-gray-400 mt-2">{message}</p>
    </div>
  );
};
