import type { HighlightColor } from './constants';

export interface AnnotatedWord {
  id: string;
  text: string;
  highlight?: HighlightColor;
  underline?: boolean;
  interlinearNote?: string;
}

export interface ConnectionLine {
  id: string;
  fromWordId: string;
  toWordId: string;
}
