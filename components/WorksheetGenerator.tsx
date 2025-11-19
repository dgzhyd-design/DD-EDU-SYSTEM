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
  worksheet: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty' | 'createdAt'>[] | null;
  onWorksheetGenerated: (
    questions: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty' | 'createdAt'>[] | null
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
            } else if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                 setError('File size must be less than 10MB.');
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

        type WorksheetQuestion = Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty' | 'createdAt'>;
        
        const questions = worksheet as WorksheetQuestion[];
        
        const questionsByTopic = questions.reduce((acc, q) => {
            (acc[q.topic] = acc[q.topic] || []).push(q);
            return acc;
        }, {} as Record<string, WorksheetQuestion[]>);

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = margin;
        const maxWidth = pageWidth - margin * 2;

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('VARAHI EDU SOLUTION', pageWidth / 2, y, { align: 'center' });
        y += 8;
        doc.setFontSize(14);
        doc.text('Student Worksheet', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        let questionCounter = 1;

        Object.entries(questionsByTopic).forEach(([topic, questionsInTopic]) => {
            const topicMarks = questionsInTopic.reduce((sum, q) => sum + q.marks, 0);

            if (y + 20 > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            
            // Topic Header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(topic, pageWidth / 2, y, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Marks: ${topicMarks}`, pageWidth - margin, y, { align: 'right' });
            y += 7;
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            questionsInTopic.forEach((q) => {
                const questionNumber = `${questionCounter++}. `;
                const questionText = `${q.stem}`;

                doc.setFontSize(12);
                const questionTextLines = doc.splitTextToSize(questionNumber + questionText, maxWidth - 10);
                let optionsHeight = 5;
                if (q.options.length > 0) {
                     doc.setFont('helvetica', 'normal');
                     q.options.forEach(opt => {
                        optionsHeight += (doc.splitTextToSize(opt, maxWidth - 20).length * 5);
                    });
                }
                const totalBlockHeight = (questionTextLines.length * 5) + optionsHeight + 5;

                if (y + totalBlockHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }

                doc.setFont('helvetica', 'bold');
                doc.text(questionNumber, margin, y, { align: 'left' });
                
                doc.setFont('helvetica', 'normal');
                doc.text(doc.splitTextToSize(questionText, maxWidth - 10), margin + 8, y);
                y += (doc.splitTextToSize(questionText, maxWidth - 10).length * 5);
                
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
        });

        doc.save('student-worksheet.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border border-white/10 rounded-md space-y-4 bg-black/20">
                <h3 className="text-lg font-bold text-slate-200">AI Worksheet Generator</h3>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Source PDF</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" disabled={isGenerating} />
                    {file ? (
                    <div className="flex items-center justify-between text-sm p-2 bg-black/30 border border-white/10 rounded-md">
                        <span className="text-slate-300 truncate pr-2">{file.name}</span>
                        <button type="button" onClick={removeFile} disabled={isGenerating} className="p-1 text-slate-400 hover:text-slate-200">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                    ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isGenerating} className="w-full inline-flex justify-center items-center py-2 px-4 border border-dashed border-slate-500 text-sm font-medium rounded-md text-slate-300 hover:bg-white/5">
                        <DocumentArrowUpIcon className="w-5 h-5 mr-2"/>
                        Upload PDF (Max 10MB)
                    </button>
                    )}
                </div>
                <div>
                    <label htmlFor="ws-questions" className="block text-sm font-medium text-slate-300">Number of Questions</label>
                    <input 
                        id="ws-questions" 
                        type="number"
                        value={numberOfQuestions} 
                        onChange={(e) => setNumberOfQuestions(Number(e.target.value))} 
                        min="1"
                        max="50"
                        disabled={isGenerating} 
                        className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md shadow-sm deboss-input"
                    />
                </div>
                 {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !file}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border-none text-base font-medium rounded-md text-white bg-gradient-to-br from-purple-500 to-indigo-600 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active transition-all disabled:from-slate-500 disabled:to-slate-600"
                >
                    {isGenerating ? <Spinner /> : <SparklesIcon className="w-5 h-5 mr-2 -ml-1"/>}
                    <span>{isGenerating ? 'Generating...' : 'Generate Worksheet'}</span>
                </button>
            </div>
            
            {isGenerating && (
                <div className="text-center p-6 bg-black/20 rounded-md">
                    <p className="text-slate-300">AI is generating your worksheet, please wait...</p>
                </div>
            )}

            {worksheet && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-slate-200">Generated Worksheet Preview</h3>
                       <button
                          onClick={handleDownloadPdf}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-slate-200 bg-white/10 emboss-light hover:bg-white/20 active:emboss-light-active transition-all"
                      >
                          <DocumentArrowDownIcon className="w-5 h-5 mr-2 -ml-1"/>
                          Download PDF
                      </button>
                    </div>
                    <div className="space-y-4 p-4 border rounded-md bg-black/20">
                        {worksheet.map((q, index) => (
                             <div key={index} className="p-3 border-b border-white/10 last:border-b-0">
                                <p className="font-semibold text-slate-200">{index + 1}. {q.stem}</p>
                                <div className="mt-2 space-y-1 pl-4">
                                    {q.options.map((opt, i) => (
                                        <p key={i} className={`text-sm ${i === q.correctAnswerIndex ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                                            {q.type === 'Multiple Choice' ? String.fromCharCode(65 + i) + '.' : '-'} {opt}
                                        </p>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-slate-400 pl-4"><span className="font-semibold">Topic:</span> {q.topic}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};