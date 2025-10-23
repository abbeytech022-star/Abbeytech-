
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
        VisionCrafter <span className="text-purple-400">AI</span>
      </h1>
      <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
        Your all-in-one AI media suite. Generate stunning images and videos, complete with viral captions for your social media.
      </p>
    </header>
  );
};
