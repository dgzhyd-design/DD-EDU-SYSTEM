
import React from 'react';
import type { Question } from '../types';
import { SparklesIcon, TrashIcon, CheckCircleIcon, ShieldExclamationIcon, CalendarIcon } from './Icons';

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
    <div className="border border-white/10 rounded-lg p-4 transition-shadow hover:shadow-lg bg-black/20">
      <div className="flex justify-between items-start">
        <p className="text-lg font-medium text-slate-200 pr-4">{question.stem}</p>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button 
            onClick={() => onDelete(question.id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200"
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
                ? 'bg-green-500/10 border-green-500/30 text-green-300 font-semibold'
                : 'bg-black/20 border-white/10 text-slate-300'
            }`}
          >
            {index === question.correctAnswerIndex && <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />}
            <span>{option}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300 bg-black/20 px-2 py-1 rounded">{question.type}</span>
          <span className="font-semibold text-purple-300 bg-purple-500/10 px-2 py-1 rounded">{question.topic}</span>
          <span className="text-slate-300">{question.difficulty}</span>
          <span className="text-slate-300 font-medium">{question.marks} Mark(s)</span>
          {question.isAiGenerated && (
            <span className="flex items-center text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              <SparklesIcon className="w-4 h-4 mr-1" /> AI Generated
            </span>
          )}
          <span className="flex items-center text-slate-400">
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            {new Date(question.createdAt).toLocaleDateString()}
          </span>
        </div>
        <button
            onClick={handleApprovalToggle}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 ${
                question.isApproved 
                ? 'bg-green-500/10 text-green-300 hover:bg-green-500/20' 
                : 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
            }`}
        >
            {question.isApproved ? <CheckCircleIcon className="w-4 h-4 mr-1.5"/> : <ShieldExclamationIcon className="w-4 h-4 mr-1.5"/>}
            {question.isApproved ? 'Approved' : 'Needs Review'}
        </button>
      </div>
    </div>
  );
};