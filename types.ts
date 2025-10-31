
import type { HighlightColor } from './constants';

export interface AnnotatedWord {
  id: string;
  text: string;
  highlight?: HighlightColor;
  underline?: boolean;
  startBracket?: 'square' | 'caret';
  endBracket?: 'square' | 'caret';
}

export interface ConnectionLine {
  id: string;
  fromWordId: string;
  toWordId: string;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  definition: string;
}
