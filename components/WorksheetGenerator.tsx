
import React, { useState, useRef } from 'react';
import type { Question } from '../types';
import { generateWorksheet } from '../services/geminiService';
import { DocumentArrowUpIcon, XCircleIcon, SparklesIcon, DocumentArrowDownIcon } from './Icons';
import { Spinner } from './Spinner';
import jsPDF from 'jspdf';

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

interface WorksheetGeneratorProps {
  worksheet: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty'>[] | null;
  onWorksheetGenerated: (
    questions: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty'>[] | null
  ) => void;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({ worksheet, onWorksheetGenerated }) => {
    const [file, setFile] = useState<File | null>(null);
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        onWorksheetGenerated(null); // Clear worksheet when file is removed
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleGenerate = async () => {
        if (!file) {
            setError('Please upload a PDF file to generate a worksheet.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        onWorksheetGenerated(null);

        try {
            const base64Data = await fileToBase64(file);
            const filePayload = { base64: base64Data, mimeType: file.type };
            const questions = await generateWorksheet(filePayload, numberOfQuestions);
            onWorksheetGenerated(questions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!worksheet || worksheet.length === 0) return;

        const doc = new jsPDF();
        const margin = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = margin;
        const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Worksheet', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 15;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        worksheet.forEach((q, index) => {
            const questionNumber = `${index + 1}. `;
            const questionText = `${q.stem}`;
            const marksText = `(${q.marks} Mark${q.marks > 1 ? 's' : ''})`;
            
            const questionTextLines = doc.splitTextToSize(questionNumber + questionText, maxWidth - 15);
            let optionsHeight = 5;
            if (q.options.length > 0) {
                q.options.forEach(opt => {
                    optionsHeight += (doc.splitTextToSize(opt, maxWidth - 20).length * 5);
                });
            }
            const totalBlockHeight = (questionTextLines.length * 5) + optionsHeight + 10;

            if (y + totalBlockHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }

            const questionYStart = y;
            doc.setFont('helvetica', 'bold');
            doc.text(questionNumber, margin, y, { align: 'left' });
            doc.text(doc.splitTextToSize(questionText, maxWidth - 10), margin + 8, y);
            y += (doc.splitTextToSize(questionText, maxWidth - 10).length * 5);
            
            doc.setFont('helvetica', 'normal');
            doc.text(marksText, maxWidth + margin, questionYStart, { align: 'right' });

            if (q.options.length > 0) {
                y += 5;
                doc.setFont('helvetica', 'normal');
                q.options.forEach((option, optIndex) => {
                    const optionLabel = q.type === 'Multiple Choice' ? `${String.fromCharCode(65 + optIndex)}) ` : '- ';
                    const optionLines = doc.splitTextToSize(option, maxWidth - 20);
                    doc.text(optionLabel, margin + 5, y);
                    doc.text(optionLines, margin + 12, y);
                    y += optionLines.length * 5;
                });
            }
            y += 10;
        });

        doc.save('student-worksheet.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border border-dashed rounded-md space-y-4">
                <h3 className="text-lg font-bold text-gray-700">AI Worksheet Generator</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source PDF</label>
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
                <div>
                    <label htmlFor="ws-questions" className="block text-sm font-medium text-gray-700">Number of Questions</label>
                    <input 
                        id="ws-questions" 
                        type="number"
                        value={numberOfQuestions} 
                        onChange={(e) => setNumberOfQuestions(Number(e.target.value))} 
                        min="1"
                        max="50"
                        disabled={isGenerating} 
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                 {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !file}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2 -ml-1"/>}
                    <span>{isGenerating ? 'Generating...' : 'Generate Worksheet'}</span>
                </button>
            </div>
            
            {isGenerating && (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-gray-600">AI is generating your worksheet, please wait...</p>
                </div>
            )}

            {worksheet && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-700">Generated Worksheet Preview</h3>
                       <button
                          onClick={handleDownloadPdf}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                      >
                          <DocumentArrowDownIcon className="w-5 h-5 mr-2 -ml-1"/>
                          Download PDF
                      </button>
                    </div>
                    <div className="space-y-4 p-4 border rounded-md bg-white">
                        {worksheet.map((q, index) => (
                             <div key={index} className="p-3 border-b last:border-b-0">
                                <p className="font-semibold text-gray-800">{index + 1}. {q.stem}</p>
                                <div className="mt-2 space-y-1 pl-4">
                                    {q.options.map((opt, i) => (
                                        <p key={i} className={`text-sm ${i === q.correctAnswerIndex ? 'text-green-700 font-bold' : 'text-gray-600'}`}>
                                            {q.type === 'Multiple Choice' ? String.fromCharCode(65 + i) + '.' : '-'} {opt}
                                        </p>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-gray-500 pl-4"><span className="font-semibold">Topic:</span> {q.topic}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
