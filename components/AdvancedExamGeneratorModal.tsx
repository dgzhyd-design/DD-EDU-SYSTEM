
import React, { useState, useRef } from 'react';
import type { Question } from '../types';
import { Difficulty } from '../types';
import { generateQuestionsForSubject, extractQuestionsFromPdf } from '../services/geminiService';
import { DocumentArrowUpIcon, XCircleIcon, SparklesIcon } from './Icons';
import { Spinner } from './Spinner';

interface AdvancedExamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (questions: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'createdAt'>[]) => void;
}

interface SubjectConfig {
    name: string;
    file: File | null;
    totalQuestions: number;
    mcqs: number;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });

const validateFile = (file: File | null): string | null => {
    if (!file) return null;
    if (file.type !== 'application/pdf') return 'Please upload a valid PDF file.';
    if (file.size > 10 * 1024 * 1024) return 'File size must be less than 10MB.';
    return null;
}

const DIFFICULTY_OPTIONS = Object.values(Difficulty);

export const AdvancedExamGeneratorModal: React.FC<AdvancedExamGeneratorModalProps> = ({ isOpen, onClose, onAddQuestions }) => {
  const [generationMode, setGenerationMode] = useState<'generate' | 'extract'>('generate');
  
  // State for 'generate' mode
  const [subjects, setSubjects] = useState<SubjectConfig[]>([
    { name: 'Physics', file: null, totalQuestions: 30, mcqs: 20 },
    { name: 'Chemistry', file: null, totalQuestions: 30, mcqs: 20 },
    { name: 'Mathematics', file: null, totalQuestions: 30, mcqs: 20 },
  ]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY_OPTIONS[1]);
  const subjectFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State for 'extract' mode
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const extractFileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;
  
  const handleSubjectFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const validationError = validateFile(file);
    if (validationError) {
        setError(validationError);
        return;
    }
    setError(null);
    const newSubjects = [...subjects];
    newSubjects[index].file = file;
    setSubjects(newSubjects);
  };
  
  const handleSubjectConfigChange = (index: number, field: keyof SubjectConfig, value: string | number) => {
    const newSubjects = [...subjects];
    const subjectToUpdate = { ...newSubjects[index] };
    
    if (field === 'totalQuestions' || field === 'mcqs') {
        (subjectToUpdate[field] as number) = Number(value);
    }

    // Ensure MCQs are not more than total questions
    if (field === 'totalQuestions' && subjectToUpdate.mcqs > Number(value)) {
        subjectToUpdate.mcqs = Number(value);
    }
    if (field === 'mcqs' && Number(value) > subjectToUpdate.totalQuestions) {
        subjectToUpdate.mcqs = subjectToUpdate.totalQuestions;
    }

    newSubjects[index] = subjectToUpdate;
    setSubjects(newSubjects);
  };

  const removeSubjectFile = (index: number) => {
      const newSubjects = [...subjects];
      newSubjects[index].file = null;
      setSubjects(newSubjects);
      if (subjectFileInputRefs.current[index]) {
          subjectFileInputRefs.current[index]!.value = '';
      }
  }

  const handleExtractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      const validationError = validateFile(file);
       if (validationError) {
        setError(validationError);
        setExtractFile(null);
        return;
      }
      setError(null);
      setExtractFile(file);
  }
  
  const removeExtractFile = () => {
    setExtractFile(null);
    if (extractFileInputRef.current) {
        extractFileInputRef.current.value = '';
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        let questions: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'createdAt'>[] = [];
        if (generationMode === 'generate') {
            const subjectsWithFiles = subjects.filter(s => s.file);
            if (subjectsWithFiles.length === 0) {
                throw new Error('Please upload at least one subject PDF to generate questions.');
            }

            const generationPromises = subjectsWithFiles.map(subject => {
                const filePayload = fileToBase64(subject.file!).then(base64 => ({ base64, mimeType: subject.file!.type }));
                return filePayload.then(payload => 
                    generateQuestionsForSubject(subject.name, payload, subject.totalQuestions, subject.mcqs, difficulty)
                );
            });
            const questionArrays = await Promise.all(generationPromises);
            questions = questionArrays.flat();

        } else { // Extract mode
            if (!extractFile) {
                throw new Error('Please upload a PDF to extract questions from.');
            }
            const base64 = await fileToBase64(extractFile);
            const payload = { base64, mimeType: extractFile.type };
            questions = await extractQuestionsFromPdf(payload);
        }

        if (questions.length === 0) {
            throw new Error("The AI didn't return any questions. The PDF might be empty, unreadable, or not contain relevant information.");
        }
        onAddQuestions(questions);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="emboss-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <h2 className="text-xl font-bold text-slate-100">Advanced Exam Generator</h2>
          <button onClick={onClose} disabled={isGenerating} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="border-b border-white/10 mb-4">
            <nav className="flex space-x-4" aria-label="Tabs">
                <button onClick={() => setGenerationMode('generate')} className={`px-3 py-2 font-medium text-sm rounded-md ${generationMode === 'generate' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}>
                    Generate from Syllabus
                </button>
                 <button onClick={() => setGenerationMode('extract')} className={`px-3 py-2 font-medium text-sm rounded-md ${generationMode === 'extract' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}>
                    Extract from PDF
                </button>
            </nav>
        </div>

        {generationMode === 'generate' && (
            <div className="space-y-4">
                {subjects.map((subject, index) => (
                    <div key={subject.name} className="p-4 border border-white/10 rounded-lg bg-black/20">
                        <h3 className="font-bold text-lg text-slate-200 mb-2">{subject.name}</h3>
                         <input type="file" ref={el => subjectFileInputRefs.current[index] = el} onChange={(e) => handleSubjectFileChange(index, e)} accept="application/pdf" className="hidden" disabled={isGenerating} />
                        {subject.file ? (
                            <div className="flex items-center justify-between text-sm p-2 bg-black/30 border border-white/10 rounded-md">
                                <span className="text-slate-300 truncate pr-2">{subject.file.name}</span>
                                <button type="button" onClick={() => removeSubjectFile(index)} disabled={isGenerating} className="p-1 text-slate-400 hover:text-slate-200">
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                             <button type="button" onClick={() => subjectFileInputRefs.current[index]?.click()} disabled={isGenerating} className="w-full inline-flex justify-center items-center py-2 px-4 border border-dashed border-slate-500 text-sm font-medium rounded-md text-slate-300 hover:bg-white/5">
                                <DocumentArrowUpIcon className="w-5 h-5 mr-2"/>
                                Upload {subject.name} PDF (Max 10MB)
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                                <label htmlFor={`total-q-${index}`} className="block text-sm font-medium text-slate-300">Total Questions</label>
                                <input id={`total-q-${index}`} type="number" value={subject.totalQuestions} onChange={e => handleSubjectConfigChange(index, 'totalQuestions', e.target.value)} disabled={isGenerating} min="1" max="100" className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md deboss-input"/>
                            </div>
                            <div>
                                <label htmlFor={`mcqs-${index}`} className="block text-sm font-medium text-slate-300">MCQs</label>
                                <input id={`mcqs-${index}`} type="number" value={subject.mcqs} onChange={e => handleSubjectConfigChange(index, 'mcqs', e.target.value)} disabled={isGenerating} min="0" max={subject.totalQuestions} className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md deboss-input"/>
                            </div>
                        </div>
                    </div>
                ))}
                 <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300">Overall Difficulty</label>
                    <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} disabled={isGenerating} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-black/30 border-white/10 rounded-md deboss-input">
                        {DIFFICULTY_OPTIONS.map(level => <option key={level} value={level} className="bg-slate-800">{level}</option>)}
                    </select>
                </div>
            </div>
        )}

        {generationMode === 'extract' && (
            <div className="space-y-4">
                <div className="p-4 border rounded-lg border-white/10 bg-black/20">
                    <h3 className="font-bold text-lg text-slate-200 mb-2">Upload Question Paper PDF</h3>
                    <p className="text-sm text-slate-400 mb-3">Upload a PDF that already contains questions. The AI will attempt to extract them into the question bank.</p>
                     <input type="file" ref={extractFileInputRef} onChange={handleExtractFileChange} accept="application/pdf" className="hidden" disabled={isGenerating} />
                    {extractFile ? (
                        <div className="flex items-center justify-between text-sm p-2 bg-black/30 border border-white/10 rounded-md">
                            <span className="text-slate-300 truncate pr-2">{extractFile.name}</span>
                            <button type="button" onClick={removeExtractFile} disabled={isGenerating} className="p-1 text-slate-400 hover:text-slate-200">
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button type="button" onClick={() => extractFileInputRef.current?.click()} disabled={isGenerating} className="w-full inline-flex justify-center items-center py-2 px-4 border border-dashed border-slate-500 text-sm font-medium rounded-md text-slate-300 hover:bg-white/5">
                            <DocumentArrowUpIcon className="w-5 h-5 mr-2"/>
                            Upload Question Paper PDF (Max 10MB)
                        </button>
                    )}
                </div>
                 <div className="bg-yellow-500/10 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-200">This feature is experimental. Please review extracted questions carefully for accuracy.</p>
                </div>
            </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          
        <div className="pt-4 mt-4 border-t border-white/10">
        <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (generationMode === 'generate' && subjects.every(s => !s.file)) || (generationMode === 'extract' && !extractFile)}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border-none text-base font-medium rounded-md text-white bg-gradient-to-br from-purple-500 to-indigo-600 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active transition-all disabled:from-slate-500 disabled:to-slate-600"
        >
            {isGenerating ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2 -ml-1"/>}
            <span>{isGenerating ? 'Generating...' : (generationMode === 'generate' ? 'Generate Exam' : 'Extract Questions')}</span>
        </button>
        </div>
      </div>
    </div>
  );
};