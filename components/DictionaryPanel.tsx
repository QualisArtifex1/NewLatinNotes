import React from 'react';
import type { DictionaryEntry } from '../types';
import { BookOpenIcon } from './Icons';

interface DictionaryPanelProps {
  entries: DictionaryEntry[];
}

export const DictionaryPanel: React.FC<DictionaryPanelProps> = ({ entries }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-stone-700 dark:text-stone-200">
        <BookOpenIcon />
        Dictionary Entries
      </h2>
      <div id="dictionary-panel" className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-500 dark:text-stone-400 p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50">
            <p>Looked-up words will appear here.</p>
            <p className="text-sm mt-1">Select a word and click "Look Up".</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 animate-fadeIn">
              <h3 className="font-bold text-amber-700 dark:text-amber-500">{entry.word}</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap">{entry.definition}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};