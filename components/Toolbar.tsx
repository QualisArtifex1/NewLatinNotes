
import React from 'react';
import { HIGHLIGHT_COLORS, HighlightColor } from '../constants';
import { UnderlineIcon, LeftSquareBracketIcon, RightSquareBracketIcon, LeftCaretIcon, RightCaretIcon, DownloadIcon, ClearIcon, StartOverIcon, PencilIcon, SaveIcon, UploadIcon } from './Icons';

interface ToolbarProps {
  onHighlight: (color: HighlightColor) => void;
  onUnderline: () => void;
  onBracket: (type: 'square' | 'caret', side: 'start' | 'end') => void;
  onClear: () => void;
  onExport: () => void;
  onReset: () => void;
  onAddNote: () => void;
  onSave: () => void;
  onLoad: () => void;
  isWordSelected: boolean;
  hasSavedSession: boolean;
}

const COLOR_ORDER: HighlightColor[] = ['red', 'green', 'orange', 'blue', 'purple', 'yellow'];

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onHighlight, onUnderline, onBracket, onClear, onExport, onReset, onAddNote, onSave, onLoad, isWordSelected, hasSavedSession 
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg">
      <div className="flex items-center gap-1.5 border-r border-stone-200 dark:border-stone-800 pr-3">
        {COLOR_ORDER.map((colorName) => (
          <button
            key={colorName}
            onClick={() => onHighlight(colorName)}
            disabled={!isWordSelected}
            className={`w-6 h-6 rounded-full transition-all hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-900 focus:ring-amber-500 disabled:opacity-20 disabled:grayscale disabled:scale-100 shadow-sm ${HIGHLIGHT_COLORS[colorName]}`}
            title={`Highlight ${colorName}`}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-1 border-r border-stone-200 dark:border-stone-800 pr-3">
        <button onClick={onUnderline} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-30" title="Underline"><UnderlineIcon /></button>
        <button onClick={() => onBracket('square', 'start')} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-30 font-bold" title="Add Left Square Bracket">[</button>
        <button onClick={() => onBracket('square', 'end')} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-30 font-bold" title="Add Right Square Bracket">]</button>
        <button onClick={() => onBracket('caret', 'start')} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-30 font-bold" title="Add Left Caret Bracket">&lt;</button>
        <button onClick={() => onBracket('caret', 'end')} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-30 font-bold" title="Add Right Caret Bracket">&gt;</button>
        <button onClick={onAddNote} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-700 dark:text-amber-500 disabled:opacity-30" title="Add Interlinear Note"><PencilIcon /></button>
        <button onClick={onClear} disabled={!isWordSelected} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors disabled:opacity-30" title="Reset Word Annotations"><ClearIcon /></button>
      </div>

      <div className="flex items-center gap-1 border-r border-stone-200 dark:border-stone-800 pr-3">
        <button onClick={onSave} className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400" title="Save Session"><SaveIcon /></button>
        <button 
          onClick={onLoad} 
          disabled={!hasSavedSession} 
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-400 disabled:opacity-20" 
          title="Load Session"
        >
          <UploadIcon />
        </button>
      </div>

      <div className="flex-grow min-w-[20px]" />
      
      <div className="flex items-center gap-2">
        <button onClick={onReset} className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm font-semibold">
          <StartOverIcon />
          Reset
        </button>
        <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 dark:bg-amber-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-md">
          <DownloadIcon />
          Export PDF
        </button>
      </div>
    </div>
  );
};
