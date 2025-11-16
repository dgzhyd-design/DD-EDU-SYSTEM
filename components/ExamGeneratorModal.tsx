
import React, { useState, useRef, useEffect } from 'react';
import type { Question } from '../types';
import { Difficulty } from '../types';
import { generateExamPaper } from '../services/geminiService';
import { DocumentArrowUpIcon, XCircleIcon, SparklesIcon } from './Icons';
import { Spinner } from './Spinner';

interface ExamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (questions: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved'>[]) => void;
}

const NUMBER_OF_QUESTIONS_OPTIONS = [30, 50, 80];
const DIFFICULTY_OPTIONS = Object.values(Difficulty);

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


export const ExamGeneratorModal: React.FC<ExamGeneratorModalProps> = ({ isOpen, onClose, onAddQuestions }) => {
  const [file, setFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(NUMBER_OF_QUESTIONS_OPTIONS[0]);
  const [numberOfMcqs, setNumberOfMcqs] = useState<number>(NUMBER_OF_QUESTIONS_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY_OPTIONS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When total questions changes, update MCQs to not exceed the new total
    setNumberOfMcqs(numberOfQuestions);
  }, [numberOfQuestions]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            setFile(null);
        } else if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
             setError('File size must be less than 5MB.');
             setFile(null);
        } else {
            setFile(selectedFile);
            setError(null);
        }
    }
  };

  const removeFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleGenerate = async () => {
    if (!file) {
      setError('Please upload a PDF file to generate an exam.');
      return;
    }
    if (numberOfMcqs > numberOfQuestions) {
        setError('Number of MCQs cannot exceed the total number of questions.');
        return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const base64Data = await fileToBase64(file);
      const filePayload = { base64: base64Data, mimeType: file.type };
      
      const questions = await generateExamPaper(filePayload, numberOfQuestions, numberOfMcqs, difficulty);

      onAddQuestions(questions);
      // Reset state for next time
      setFile(null);
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Generate Exam Paper</h2>
          <button onClick={onClose} disabled={isGenerating} className="p-1 rounded-full text-gray-400 hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject PDF</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" disabled={isGenerating} />
            {file ? (
              <div className="flex items-center justify-between text-sm p-2 bg-gray-50 border rounded-md">
                  <span className="text-gray-700 truncate pr-2">{file.name}</span>
                  <button type="button" onClick={removeFile} disabled={isGenerating} className="p-1 text-gray-400 hover:text-gray-600">
                      <XCircleIcon className="w-5 h-5" />
                  </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isGenerating} className="w-full inline-flex justify-center items-center py-2 px-4 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50">
                  <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-gray-400"/>
                  Upload PDF (Max 5MB)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="number-of-questions" className="block text-sm font-medium text-gray-700">Total Questions</label>
              <select id="number-of-questions" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(Number(e.target.value))} disabled={isGenerating} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {NUMBER_OF_QUESTIONS_OPTIONS.map(num => <option key={num} value={num}>{num} Questions</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} disabled={isGenerating} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {DIFFICULTY_OPTIONS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          </div>
          
          <div>
              <label htmlFor="number-of-mcqs" className="block text-sm font-medium text-gray-700">Number of MCQs</label>
              <input 
                id="number-of-mcqs" 
                type="number"
                value={numberOfMcqs} 
                onChange={(e) => setNumberOfMcqs(Number(e.target.value))} 
                min="0"
                max={numberOfQuestions}
                disabled={isGenerating} 
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
              />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !file}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2 -ml-1"/>}
              <span>{isGenerating ? 'Generating Exam...' : 'Generate Exam'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
