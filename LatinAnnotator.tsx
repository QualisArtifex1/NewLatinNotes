import React, { useState, useEffect } from 'react';
import { QuillIcon, XIcon, CheckIcon, SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon } from './components/Icons';
import { TextSelection } from './components/TextSelection';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import type { AnnotatedWord, ConnectionLine } from './types';
import type { HighlightColor } from './constants';
import { exportToPdf } from './services/pdfService';
import { TranslationInput } from './components/TranslationInput';

interface LatinAnnotatorProps {
  onResetRequest: () => void;
}

const LatinAnnotator: React.FC<LatinAnnotatorProps> = ({ onResetRequest }) => {
    const [view, setView] = useState<'selection' | 'annotating'>('selection');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // Annotation State
    const [linesOfWords, setLinesOfWords] = useState<AnnotatedWord[][]>([]);
    const [lines, setLines] = useState<ConnectionLine[]>([]);
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
    const [translation, setTranslation] = useState('');
    const [notes, setNotes] = useState('');
    const [isTranslationCollapsed, setIsTranslationCollapsed] = useState(false);
    const [isNotesCollapsed, setIsNotesCollapsed] = useState(false);

    // Note Modal State
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState('');

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
        setSelectedWordId(null);
        setTranslation('');
        setNotes('');
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
        if (!selectedWordId) return;
        const char = type === 'square' ? (side === 'start' ? '[' : ']') : (side === 'start' ? '<' : '>');
        
        setLinesOfWords(prevLines => 
            prevLines.map(line => {
                const index = line.findIndex(w => w.id === selectedWordId);
                if (index === -1) return line;
                
                const newBracketWord: AnnotatedWord = {
                    id: crypto.randomUUID(),
                    text: char,
                };
                
                const newLine = [...line];
                if (side === 'start') {
                    newLine.splice(index, 0, newBracketWord);
                } else {
                    newLine.splice(index + 1, 0, newBracketWord);
                }
                return newLine;
            })
        );
    };

    const handleOpenNoteModal = () => {
        if (!selectedWordId) return;
        const word = linesOfWords.flat().find(w => w.id === selectedWordId);
        setEditingNote(word?.interlinearNote || '');
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = () => {
        updateWordInLines(w => ({ ...w, interlinearNote: editingNote.trim() || undefined }));
        setIsNoteModalOpen(false);
    };

    const handleClearAnnotations = () => {
        if (!selectedWordId) return;
        
        const word = linesOfWords.flat().find(w => w.id === selectedWordId);
        const isStructural = word && /^[\[\]<>]$/.test(word.text);

        if (isStructural) {
            setLinesOfWords(prevLines => 
                prevLines.map(line => line.filter(w => w.id !== selectedWordId))
            );
            setSelectedWordId(null);
        } else {
            updateWordInLines(word => ({
                ...word,
                highlight: undefined,
                underline: undefined,
                interlinearNote: undefined,
            }));
        }
        
        setLines(prevLines => prevLines.filter(line => 
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

    const handleExport = () => {
        exportToPdf('editor-container', translation, notes);
    };

    return (
        <div className="flex flex-col h-screen text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-950 transition-colors duration-500">
            <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900/80 backdrop-blur-md z-30 transition-colors duration-500">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl shadow-inner transition-colors duration-500">
                        <QuillIcon />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold tracking-tight text-amber-900 dark:text-amber-400">Qualis Artifex</h1>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400 font-bold opacity-80">Digital Scriptorium</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {view === 'annotating' && (
                      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-tighter">Activus</p>
                      </div>
                    )}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all text-stone-600 dark:text-amber-400 shadow-sm border border-stone-200 dark:border-stone-700"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <SunIcon /> : <MoonIcon />}
                    </button>
                </div>
            </header>
            
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
                {view === 'selection' ? (
                    <div className="flex-grow flex flex-col p-8 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-50 via-stone-100 to-stone-200 dark:from-stone-900 dark:via-stone-950 dark:to-black">
                        <div className="max-w-4xl w-full mx-auto flex-grow rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-fadeInUp">
                            <TextSelection onStartAnnotating={handleStartAnnotating} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col p-4 md:p-6 overflow-hidden animate-fadeIn">
                        <div className="animate-fadeInUp" style={{ animationDelay: '50ms' }}>
                            <div className="mb-3 flex items-center gap-2 px-1">
                                <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                                <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                    To connect words, simply drag one word and drop it onto another.
                                </p>
                            </div>
                            <Toolbar 
                                onHighlight={handleApplyHighlight}
                                onUnderline={handleApplyUnderline}
                                onBracket={handleApplyBracket}
                                onClear={handleClearAnnotations}
                                onExport={handleExport}
                                onReset={onResetRequest}
                                onAddNote={handleOpenNoteModal}
                                isWordSelected={!!selectedWordId}
                            />
                        </div>
                        <div 
                            className="flex-grow flex flex-col mt-4 md:mt-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden animate-fadeInUp relative"
                            style={{ animationDelay: '150ms' }}
                        >
                            <div id="editor-container" className="flex-grow overflow-auto relative bg-white dark:bg-stone-700 transition-colors duration-500">
                                <Editor
                                    linesOfWords={linesOfWords}
                                    lines={lines}
                                    onConnectWords={handleConnectWords}
                                    onWordClick={handleWordClick}
                                    selectedWordId={selectedWordId}
                                />
                            </div>
                            <div className="flex-shrink-0 grid md:grid-cols-2 gap-4 p-4 md:p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/80 backdrop-blur-md transition-colors duration-500">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Translation</label>
                                        <button 
                                            onClick={() => setIsTranslationCollapsed(!isTranslationCollapsed)}
                                            className="p-1 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 transition-colors"
                                        >
                                            {isTranslationCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </button>
                                    </div>
                                    {!isTranslationCollapsed && (
                                        <TranslationInput 
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value)}
                                            placeholder="A faithful rendering of the Latin text..."
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Scholarly Notes</label>
                                        <button 
                                            onClick={() => setIsNotesCollapsed(!isNotesCollapsed)}
                                            className="p-1 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 transition-colors"
                                        >
                                            {isNotesCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </button>
                                    </div>
                                    {!isNotesCollapsed && (
                                        <TranslationInput 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Grammatical, historical, or literary commentary..."
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Note Modal Overlay */}
                {isNoteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-md bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden transform animate-fadeInUp transition-colors duration-500">
                            <div className="p-6 bg-amber-50 dark:bg-amber-900/40 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between transition-colors duration-500">
                                <h3 className="font-serif font-bold text-xl text-amber-900 dark:text-amber-400">Add Interlinear Note</h3>
                                <button onClick={() => setIsNoteModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                                    <XIcon />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-stone-500 dark:text-stone-400 italic">This note will appear directly above the selected word in the editor.</p>
                                <textarea
                                    autoFocus
                                    value={editingNote}
                                    onChange={(e) => setEditingNote(e.target.value)}
                                    placeholder="Enter your note here..."
                                    className="w-full h-24 p-4 font-serif bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none dark:text-stone-100 shadow-inner"
                                />
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={handleSaveNote}
                                        className="flex-grow flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                                    >
                                        <CheckIcon />
                                        Save Note
                                    </button>
                                    <button 
                                        onClick={() => setIsNoteModalOpen(false)}
                                        className="px-6 py-2.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-200 rounded-xl font-bold hover:bg-stone-200 dark:hover:bg-stone-600 transition-all shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LatinAnnotator;
