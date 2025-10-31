import React from 'react';
import { HIGHLIGHT_COLORS, HighlightColor } from '../constants';
import { UnderlineIcon, LeftSquareBracketIcon, RightSquareBracketIcon, LeftCaretIcon, RightCaretIcon, BookOpenIcon, DownloadIcon, LoaderIcon, ClearIcon, StartOverIcon } from './Icons';

interface ToolbarProps {
  onHighlight: (color: HighlightColor) => void;
  onUnderline: () => void;
  onBracket: (type: 'square' | 'caret', side: 'start' | 'end') => void;
  onClear: () => void;
  onLookup: () => void;
  onExport: () => void;
  onReset: () => void;
  isLoading: boolean;
  isWordSelected: boolean;
}

const COLOR_ORDER: HighlightColor[] = ['red', 'green', 'orange', 'blue', 'purple', 'yellow'];

export const Toolbar: React.FC<ToolbarProps> = ({ onHighlight, onUnderline, onBracket, onClear, onLookup, onExport, onReset, isLoading, isWordSelected }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-stone-50/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-lg shadow-sm">
      <div className="flex items-center gap-1 border-r border-stone-300 dark:border-stone-600 pr-2">
        {COLOR_ORDER.map((colorName) => (
          <button
            key={colorName}
            onClick={() => onHighlight(colorName)}
            disabled={!isWordSelected}
            className={`w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${HIGHLIGHT_COLORS[colorName]}`}
            title={`Highlight ${colorName}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 border-r border-stone-300 dark:border-stone-600 pr-2">
        <button onClick={onUnderline} disabled={!isWordSelected} className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Underline"><UnderlineIcon /></button>
        <button onClick={() => onBracket('square', 'start')} disabled={!isWordSelected} className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Left Square Bracket"><LeftSquareBracketIcon /></button>
        <button onClick={() => onBracket('square', 'end')} disabled={!isWordSelected} className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Right Square Bracket"><RightSquareBracketIcon /></button>
        <button onClick={() => onBracket('caret', 'start')} disabled={!isWordSelected} className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Left Caret Bracket"><LeftCaretIcon /></button>
        <button onClick={() => onBracket('caret', 'end')} disabled={!isWordSelected} className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Right Caret Bracket"><RightCaretIcon /></button>
        <button onClick={onClear} disabled={!isWordSelected} className="p-2 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Clear Annotations"><ClearIcon /></button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onLookup} disabled={isLoading || !isWordSelected} className="flex items-center gap-2 p-2 px-3 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Look up selected word">
          {isLoading ? <LoaderIcon /> : <BookOpenIcon />}
          Look Up
        </button>
      </div>
      <div className="flex-grow" />
      <div className="flex items-center gap-1">
        <button onClick={onReset} className="flex items-center gap-2 p-2 px-3 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors" title="Start Over">
          <StartOverIcon />
          Start Over
        </button>
        <button onClick={onExport} className="flex items-center gap-2 p-2 px-3 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors" title="Export as PDF">
          <DownloadIcon />
          Export
        </button>
      </div>
    </div>
  );
};
