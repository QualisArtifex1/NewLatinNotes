
import React from 'react';
import type { DictionaryEntry } from '../types';
import { BookOpenIcon } from './Icons';

interface DictionaryPanelProps {
  entries: DictionaryEntry[];
}

export const DictionaryPanel: React.FC<DictionaryPanelProps> = ({ entries }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-stone-500 dark:text-stone-400">
        <div className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded-md">
            <BookOpenIcon />
        </div>
        Glossarium
      </h2>
      <div id="dictionary-panel" className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 dark:text-stone-500 p-8 rounded-2xl bg-stone-50/50 dark:bg-stone-900/30 border-2 border-dashed border-stone-200 dark:border-stone-800">
            <p className="font-serif italic text-lg">Empty Scriptorium</p>
            <p className="text-xs mt-2 uppercase tracking-tight">Select a word and click "Look Up" to reveal its secrets.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="p-4 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all group animate-fadeIn">
              <h3 className="font-serif font-bold text-xl text-amber-900 dark:text-amber-500 group-hover:text-amber-600 transition-colors">{entry.word}</h3>
              <div className="h-0.5 w-8 bg-amber-100 dark:bg-amber-900/30 my-2 group-hover:w-full transition-all duration-500" />
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400 whitespace-pre-wrap">{entry.definition}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
