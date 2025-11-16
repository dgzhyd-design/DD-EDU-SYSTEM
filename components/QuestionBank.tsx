
import React, { useMemo, useState } from 'react';
import type { Question } from '../types';
import { QuestionType } from '../types';
import { QuestionItem } from './QuestionItem';
import { WorksheetGenerator } from './WorksheetGenerator';
import { DocumentPlusIcon, DocumentArrowDownIcon, ListBulletIcon, ClipboardDocumentListIcon, KeyIcon, TagIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import jsPDF from 'jspdf';

interface QuestionBankProps {
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestion: (question: Question) => void;
  onOpenGenerator: () => void;
}

const tabs = [
    { name: 'Question Bank', key: 'bank', icon: ListBulletIcon },
    { name: 'Topic Overview', key: 'topics', icon: TagIcon },
    { name: 'Worksheets', key: 'worksheets', icon: ClipboardDocumentListIcon },
    { name: 'Solutions', key: 'solutions', icon: KeyIcon },
];

const filterOptions: (QuestionType | 'All')[] = ['All', ...Object.values(QuestionType)];

const TopicAccordion: React.FC<{ topic: string, questions: Question[] }> = ({ topic, questions }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-md">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
            >
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">{topic}</span>
                    <span className="text-xs font-medium text-white bg-indigo-500 px-2 py-0.5 rounded-full">{questions.length}</span>
                </div>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="space-y-3">
                        {questions.map((q, index) => (
                            <div key={q.id} className="p-2 border-l-4 border-indigo-200">
                                <p className="font-medium text-gray-800">{index + 1}. {q.stem}</p>
                                <p className="text-sm text-green-700 mt-1 ml-4">
                                    <span className="font-semibold">Answer:</span> {q.options[q.correctAnswerIndex]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ questions, onDeleteQuestion, onUpdateQuestion, onOpenGenerator }) => {
  const [activeTab, setActiveTab] = useState<'bank' | 'worksheets' | 'solutions' | 'topics'>('bank');
  const [filterType, setFilterType] = useState<QuestionType | 'All'>('All');
  const [worksheet, setWorksheet] = useState<Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'difficulty'>[] | null>(null);

  const approvedQuestions = useMemo(() => questions.filter(q => q.isApproved), [questions]);
  
  const filteredQuestions = useMemo(() => {
    if (filterType === 'All') {
      return questions;
    }
    return questions.filter(q => q.type === filterType);
  }, [questions, filterType]);

  const questionsByTopic = useMemo(() => {
    return approvedQuestions.reduce((acc, q) => {
        (acc[q.topic] = acc[q.topic] || []).push(q);
        return acc;
    }, {} as Record<string, Question[]>);
  }, [approvedQuestions]);

  const handleDownloadPdf = () => {
    if (approvedQuestions.length === 0) return;

    const doc = new jsPDF();
    const margin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('A1 Level Examination', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    approvedQuestions.forEach((q, index) => {
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

    doc.save('a1-exam-paper.pdf');
  };

  const renderContent = () => {
    switch (activeTab) {
        case 'bank':
            return (
                <div>
                    <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium text-gray-600">Filter by type:</span>
                        {filterOptions.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                    filterType === type 
                                    ? 'bg-indigo-600 text-white shadow' 
                                    : 'bg-white text-gray-600 hover:bg-gray-200 border'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {filteredQuestions.length > 0 ? (
                        <div className="space-y-4">
                        {filteredQuestions.map(question => (
                            <QuestionItem 
                            key={question.id} 
                            question={question} 
                            onDelete={onDeleteQuestion} 
                            onUpdate={onUpdateQuestion}
                            />
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-gray-50 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No questions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try a different filter or generate a new exam paper.
                            </p>
                        </div>
                    )}
                </div>
            );
        case 'topics':
            return (
                <div>
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Approved Questions by Topic</h3>
                    {Object.keys(questionsByTopic).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(questionsByTopic).map(([topic, qs]) => (
                               <TopicAccordion key={topic} topic={topic} questions={qs} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 px-6 bg-gray-50 rounded-md">
                            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Topics Found</h3>
                             <p className="mt-1 text-sm text-gray-500">
                               Approve some questions in the Question Bank to see them organized by topic here.
                            </p>
                        </div>
                    )}
                </div>
            );
        case 'worksheets':
            return <WorksheetGenerator onWorksheetGenerated={setWorksheet} worksheet={worksheet} />;
        case 'solutions':
            return (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-700">Approved Question Solutions</h3>
                    {approvedQuestions.length > 0 ? (
                        <div className="space-y-4">
                            {approvedQuestions.map((q, index) => (
                                <div key={q.id} className="p-4 border rounded-md bg-gray-50 transition-shadow hover:shadow-sm">
                                    <p className="font-semibold text-gray-800">{index + 1}. {q.stem}</p>
                                    <p className="mt-2 text-sm text-green-700">
                                        <span className="font-bold">Answer:</span> {q.options[q.correctAnswerIndex]}
                                    </p>
                                    {q.explanation && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            <span className="font-bold">Explanation:</span> {q.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-gray-50 rounded-md">
                            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Solutions Available</h3>
                             <p className="mt-1 text-sm text-gray-500">
                               Approve some questions in the Question Bank to see their solutions here.
                            </p>
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-700">Teacher Dashboard</h2>
        <div className="flex items-center gap-2">
            <button 
              onClick={onOpenGenerator}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentPlusIcon className="w-5 h-5 mr-2 -ml-1"/>
              Generate Exam Paper
            </button>
            <button 
              onClick={handleDownloadPdf}
              disabled={approvedQuestions.length === 0}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2 -ml-1"/>
              Download PDF
            </button>
        </div>
      </div>

      <div>
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`inline-flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-semibold transition-colors ${
                            activeTab === tab.key
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.key ? 'text-indigo-500' : 'text-gray-400'}`} />
                        <span>{tab.name}</span>
                    </button>
                ))}
            </nav>
        </div>
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};
