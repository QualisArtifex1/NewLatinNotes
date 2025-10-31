import React, { useState } from 'react';
import { PRELOADED_TEXTS } from '../data/texts';

interface TextSelectionProps {
  onStartAnnotating: (text: string) => void;
}

export const TextSelection: React.FC<TextSelectionProps> = ({ onStartAnnotating }) => {
  const [text, setText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPreset(value);
    if (value) {
      const [author, title] = value.split('||');
      setText(PRELOADED_TEXTS[author][title]);
    } else {
      setText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartAnnotating(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center p-6 text-center text-stone-500 dark:text-stone-400">
        <h1 className="font-serif text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-300 dark:to-amber-500 text-transparent bg-clip-text mb-2">
            Qualis Artifex
        </h1>
        <h2 className="text-2xl font-semibold text-stone-700 dark:text-stone-300">Digital Scriptorium</h2>
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          Choose a pre-loaded text or paste your own to begin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col p-4 pt-0">
        <div className="mb-4">
          <select 
            value={selectedPreset}
            onChange={handlePresetChange}
            className="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-md bg-stone-50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">-- Select a Pre-loaded Text --</option>
            {Object.keys(PRELOADED_TEXTS).map(author => (
              <optgroup label={author} key={author}>
                {Object.keys(PRELOADED_TEXTS[author]).map(title => (
                  <option key={`${author}||${title}`} value={`${author}||${title}`}>
                    {title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <textarea
          className="flex-grow w-full p-3 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-serif"
          placeholder="Or paste your Latin text here..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSelectedPreset(''); // Deselect preset if user types
          }}
        />

        <div className="mt-4 text-center">
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 disabled:bg-stone-400 disabled:cursor-not-allowed"
          >
            Start Annotating
          </button>
        </div>
      </form>
    </div>
  );
};
