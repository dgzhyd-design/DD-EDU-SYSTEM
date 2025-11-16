
import React from 'react';
import type { Question } from '../types';
import { SparklesIcon, TrashIcon, CheckCircleIcon, ShieldExclamationIcon } from './Icons';

interface QuestionItemProps {
  question: Question;
  onDelete: (id: string) => void;
  onUpdate: (question: Question) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question, onDelete, onUpdate }) => {
    const handleApprovalToggle = () => {
        onUpdate({ ...question, isApproved: !question.isApproved });
    };

    return (
    <div className="border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md bg-white">
      <div className="flex justify-between items-start">
        <p className="text-lg font-medium text-gray-800 pr-4">{question.stem}</p>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button 
            onClick={() => onDelete(question.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
            aria-label="Delete question"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`flex items-center p-2 rounded-md border text-sm ${
              index === question.correctAnswerIndex
                ? 'bg-green-50 border-green-300 text-green-800 font-semibold'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {index === question.correctAnswerIndex && <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />}
            <span>{option}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{question.type}</span>
          <span className="font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">{question.topic}</span>
          <span className="text-gray-600">{question.difficulty}</span>
          <span className="text-gray-600 font-medium">{question.marks} Mark(s)</span>
          {question.isAiGenerated && (
            <span className="flex items-center text-amber-600 bg-amber-100 px-2 py-1 rounded">
              <SparklesIcon className="w-4 h-4 mr-1" /> AI Generated
            </span>
          )}
        </div>
        <button
            onClick={handleApprovalToggle}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${
                question.isApproved 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
        >
            {question.isApproved ? <CheckCircleIcon className="w-4 h-4 mr-1.5"/> : <ShieldExclamationIcon className="w-4 h-4 mr-1.5"/>}
            {question.isApproved ? 'Approved' : 'Needs Review'}
        </button>
      </div>
    </div>
  );
};
