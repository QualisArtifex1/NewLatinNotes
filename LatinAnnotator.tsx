
import React, { useState } from 'react';
import { QuillIcon } from './components/Icons';
import { TextSelection } from './components/TextSelection';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { DictionaryPanel } from './components/DictionaryPanel';
import type { AnnotatedWord, ConnectionLine, DictionaryEntry } from './types';
import type { HighlightColor } from './constants';
import { lookupWord } from './services/geminiService';
import { exportToPdf } from './services/pdfService';
import { TranslationInput } from './components/TranslationInput';

interface LatinAnnotatorProps {
  onResetRequest: () => void;
}

const LatinAnnotator: React.FC<LatinAnnotatorProps> = ({ onResetRequest }) => {
    const [view, setView] = useState<'selection' | 'annotating'>('selection');

    // Annotation State
    const [linesOfWords, setLinesOfWords] = useState<AnnotatedWord[][]>([]);
    const [lines, setLines] = useState<ConnectionLine[]>([]);
    const [dictionaryEntries, setDictionaryEntries] = useState<DictionaryEntry[]>([]);
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
    const [translation, setTranslation] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const initializeAnnotationState = (text: string) => {
        const processedLines = text
            .split('\n')
            .map(line =>
                line.split(/(\s+)/)
                  .filter(w => w.length > 0)
                  .map(w => ({
                      id: crypto.randomUUID(),
                      text: w,
                  }))
            );
        setLinesOfWords(processedLines);
        setLines([]);
        setDictionaryEntries([]);
        setSelectedWordId(null);
        setTranslation('');
        setNotes('');
        setIsLoading(false);
    };

    const handleStartAnnotating = (text: string) => {
        if (text.trim()) {
            initializeAnnotationState(text);
            setView('annotating');
        }
    };

    const handleWordClick = (wordId: string) => {
        setSelectedWordId(prevId => (prevId === wordId ? null : wordId));
    };

    const updateWordInLines = (updateFn: (word: AnnotatedWord) => AnnotatedWord) => {
        if (!selectedWordId) return;
        setLinesOfWords(prevLines => 
            prevLines.map(line =>
                line.map(word =>
                    word.id === selectedWordId ? updateFn(word) : word
                )
            )
        );
    };

    const handleApplyHighlight = (color: HighlightColor) => {
        updateWordInLines(word => ({ ...word, highlight: word.highlight === color ? undefined : color }));
    };

    const handleApplyUnderline = () => {
        updateWordInLines(word => ({ ...word, underline: !word.underline }));
    };

    const handleApplyBracket = (type: 'square' | 'caret', side: 'start' | 'end') => {
        updateWordInLines(word => {
            const newWord = { ...word };
            const key = side === 'start' ? 'startBracket' : 'endBracket';
            newWord[key] = newWord[key] === type ? undefined : type;
            return newWord;
        });
    };

    const handleClearAnnotations = () => {
        if (!selectedWordId) return;
        
        updateWordInLines(word => ({
            ...word,
            highlight: undefined,
            underline: undefined,
            startBracket: undefined,
            endBracket: undefined,
        }));
        
        setLines(prevLines => prevLines.filter(line => 
            // FIX: Corrected property access from 'toId' to 'toWordId' to match the ConnectionLine type definition.
            line.fromWordId !== selectedWordId && line.toWordId !== selectedWordId
        ));
    };

    const handleConnectWords = (fromWordId: string, toWordId: string) => {
        if (fromWordId === toWordId) return;
        const newLine: ConnectionLine = {
            id: crypto.randomUUID(),
            fromWordId,
            toWordId,
        };
        setLines(prev => [...prev, newLine]);
    };

    const handleLookup = async () => {
        if (!selectedWordId) return;
        
        const wordToLookUp = linesOfWords.flat().find(w => w.id === selectedWordId);
        if (!wordToLookUp) return;

        const selectedText = wordToLookUp.text.trim();
        if (!selectedText) return;

        setIsLoading(true);
        try {
            const definition = await lookupWord(selectedText);
            const newEntry: DictionaryEntry = {
                id: crypto.randomUUID(),
                word: selectedText,
                definition,
            };
            setDictionaryEntries(prev => [newEntry, ...prev]);
        } catch (error) {
            console.error("Failed to look up word:", error);
            alert("There was an error looking up the word. Please check the console.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        exportToPdf('editor-container', dictionaryEntries, translation, notes);
    };

    return (
        <div className="flex flex-col h-screen text-gray-800 dark:text-gray-200 bg-stone-100 dark:bg-stone-950">
            <header className="flex items-center justify-between p-3 border-b border-stone-200 dark:border-stone-800 shadow-sm bg-stone-50 dark:bg-stone-900">
                <div className="flex items-center gap-3">
                    <QuillIcon />
                    <h1 className="text-xl font-bold text-stone-700 dark:text-stone-200">Latin Annotator</h1>
                </div>
            </header>
            
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                {view === 'selection' ? (
                    <div className="flex-grow flex flex-col p-4 overflow-hidden">
                        <div className="flex-grow rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 shadow-inner overflow-hidden animate-fadeInUp">
                            <TextSelection onStartAnnotating={handleStartAnnotating} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-grow flex flex-col p-4 overflow-hidden animate-fadeInUp">
                            <div style={{ animationDelay: '100ms', opacity: 0 }} className="animate-fadeInUp">
                                <Toolbar 
                                    onHighlight={handleApplyHighlight}
                                    onUnderline={handleApplyUnderline}
                                    onBracket={handleApplyBracket}
                                    onClear={handleClearAnnotations}
                                    onLookup={handleLookup}
                                    onExport={handleExport}
                                    onReset={onResetRequest}
                                    isLoading={isLoading}
                                    isWordSelected={!!selectedWordId}
                                />
                            </div>
                            <div 
                                style={{ animationDelay: '200ms', opacity: 0 }}
                                className="flex-grow flex flex-col mt-4 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 shadow-inner overflow-hidden animate-fadeInUp"
                            >
                                <div id="editor-container" className="flex-grow overflow-auto">
                                    <Editor
                                        linesOfWords={linesOfWords}
                                        lines={lines}
                                        onConnectWords={handleConnectWords}
                                        onWordClick={handleWordClick}
                                        selectedWordId={selectedWordId}
                                    />
                                </div>
                                <div className="flex-shrink-0 grid md:grid-cols-2 gap-4 p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-100/50 dark:bg-stone-900/30">
                                    <div>
                                        <label className="block text-sm font-semibold font-sans text-stone-600 dark:text-stone-400 mb-1 px-2">Translation</label>
                                        <TranslationInput 
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value)}
                                            placeholder="Enter your clean translation here..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold font-sans text-stone-600 dark:text-stone-400 mb-1 px-2">Notes</label>
                                        <TranslationInput 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Enter grammatical or literary notes here..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <aside 
                            style={{ animationDelay: '300ms', opacity: 0 }}
                            className="w-full md:w-1/3 xl:w-1/4 h-1/2 md:h-auto flex flex-col p-4 border-l-0 md:border-l border-t md:border-t-0 border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 animate-fadeInUp"
                        >
                            <div id="dictionary-panel-container" className="flex flex-col h-full">
                                <DictionaryPanel entries={dictionaryEntries} />
                            </div>
                        </aside>
                    </>
                )}
            </main>
        </div>
    );
};

export default LatinAnnotator;
