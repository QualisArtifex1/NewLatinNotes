import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
import type { AnnotatedWord, ConnectionLine } from '../types';
import { HIGHLIGHT_CLASSES } from '../constants';

interface EditorProps {
  linesOfWords: AnnotatedWord[][];
  lines: ConnectionLine[];
  onConnectWords: (fromWordId: string, toWordId: string) => void;
  onWordClick: (wordId: string) => void;
  selectedWordId: string | null;
}

interface LineCoord {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export const Editor: React.FC<EditorProps> = ({ 
  linesOfWords, 
  lines, 
  onConnectWords, 
  onWordClick, 
  selectedWordId,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<string, HTMLSpanElement | null>>(new Map());
  const [lineCoords, setLineCoords] = useState<LineCoord[]>([]);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);

  const calculateLines = useCallback(() => {
    if (!editorRef.current) return;
    const editorRect = editorRef.current.getBoundingClientRect();
    const newCoords: LineCoord[] = [];
    
    lines.forEach(line => {
      const fromEl = wordRefs.current.get(line.fromWordId);
      const toEl = wordRefs.current.get(line.toWordId);

      if (fromEl && toEl) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        newCoords.push({
            id: line.id,
            x1: fromRect.left + fromRect.width / 2 - editorRect.left,
            y1: fromRect.top - editorRect.top,
            x2: toRect.left + toRect.width / 2 - editorRect.left,
            y2: toRect.top - editorRect.top,
        });
      }
    });
    setLineCoords(newCoords);
  }, [lines]);

  useLayoutEffect(() => {
    calculateLines();
    const resizeObserver = new ResizeObserver(() => calculateLines());
    if (editorRef.current) {
        resizeObserver.observe(editorRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [linesOfWords, lines, calculateLines]);

  const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, wordId: string) => {
    e.dataTransfer.setData('text/plain', wordId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLSpanElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLSpanElement>, targetWordId: string) => {
    e.preventDefault();
    const fromWordId = e.dataTransfer.getData('text/plain');
    onConnectWords(fromWordId, targetWordId);
  };
  
  const hoveredLine = lines.find(line => line.id === hoveredLineId);
  const hoveredWordIds = hoveredLine ? new Set([hoveredLine.fromWordId, hoveredLine.toWordId]) : new Set();

  return (
    <div ref={editorRef} className="relative p-2">
      <div className="text-xl leading-loose font-serif p-6">
        {linesOfWords.map((wordLine, lineIndex) => (
          <p className="pb-2" key={lineIndex}>
            {wordLine.map((word) => {
              if (/\s+/.test(word.text)) {
                return <span key={word.id}>{word.text}</span>;
              }
              const highlightClass = word.highlight ? HIGHLIGHT_CLASSES[word.highlight] : '';
              const underlineClass = word.underline ? 'underline decoration-2 decoration-sky-500' : '';
              const isSelected = word.id === selectedWordId;
              const selectionClass = isSelected ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-800' : '';
              const isPulsating = hoveredWordIds.has(word.id);
              const pulsatingClass = isPulsating ? 'animate-pulse-word' : '';

              return (
                <React.Fragment key={word.id}>
                  {word.startBracket === 'square' && '['}
                  {word.startBracket === 'caret' && '<'}
                  <span
                    ref={el => {
                      if (el) {
                        wordRefs.current.set(word.id, el);
                      } else {
                        wordRefs.current.delete(word.id);
                      }
                    }}
                    data-word-id={word.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, word.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, word.id)}
                    onClick={() => onWordClick(word.id)}
                    className={`cursor-pointer transition-all duration-150 rounded-sm px-0.5 -mx-0.5 ${highlightClass} ${underlineClass} ${selectionClass} ${pulsatingClass}`}
                  >
                    {word.text}
                  </span>
                  {word.endBracket === 'square' && ']'}
                  {word.endBracket === 'caret' && '>'}
                </React.Fragment>
              );
            })}
          </p>
        ))}
      </div>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {lineCoords.map(coord => {
          const { id, x1, y1, x2, y2 } = coord;
          const isHovered = id === hoveredLineId;
          const cx = (x1 + x2) / 2;
          const arcHeight = Math.max(15, Math.abs(x1 - x2) * 0.1);
          const cy = Math.min(y1, y2) - arcHeight;
          const pathData = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;

          return (
            <path
              key={id}
              d={pathData}
              fill="none"
              className={`animate-drawLine transition-all duration-200 pointer-events-auto cursor-pointer ${
                isHovered
                  ? 'stroke-pink-400 dark:stroke-pink-300'
                  : 'stroke-pink-500/70 dark:stroke-pink-400/70'
              }`}
              strokeWidth={isHovered ? 3 : 2}
              pathLength="1"
              onMouseEnter={() => setHoveredLineId(id)}
              onMouseLeave={() => setHoveredLineId(null)}
            />
          );
        })}
      </svg>
    </div>
  );
};