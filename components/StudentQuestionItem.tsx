
import React from 'react';
import type { Question } from '../types';
import { QuestionType } from '../types';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface StudentQuestionItemProps {
  question: Question;
  index: number;
  isSubmitted: boolean;
  selectedAnswer?: number;
  onAnswerChange: (questionId: string, answerIndex: number) => void;
}

export const StudentQuestionItem: React.FC<StudentQuestionItemProps> = ({ question, index, isSubmitted, selectedAnswer, onAnswerChange }) => {
    
    const getOptionClasses = (optionIndex: number) => {
        const baseClasses = "flex items-center p-3 rounded-md border text-sm w-full transition-all duration-200";

        if (isSubmitted) {
            const isCorrect = optionIndex === question.correctAnswerIndex;
            const isSelected = optionIndex === selectedAnswer;

            if (isCorrect) {
                return `${baseClasses} bg-green-500/10 border-green-500/30 text-green-300 font-semibold`;
            }
            if (isSelected && !isCorrect) {
                return `${baseClasses} bg-red-500/10 border-red-500/30 text-red-300 font-semibold`;
            }
            return `${baseClasses} bg-black/20 border-white/10 text-slate-300`;
        }

        // State before submission
        if (selectedAnswer === optionIndex) {
            return `${baseClasses} bg-purple-500/20 border-purple-400 text-slate-100 cursor-pointer emboss-light-active`;
        }

        return `${baseClasses} bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 cursor-pointer`;
    };
    
    return (
    <div className="border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start">
            <span className="text-lg font-bold text-slate-200 mr-2">{index + 1}.</span>
            <p className="text-lg font-medium text-slate-200">{question.stem}</p>
        </div>
        <div className="flex-shrink-0 bg-black/20 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            {question.marks} Mark{question.marks > 1 ? 's' : ''}
        </div>
      </div>
      <fieldset className="mt-4 pl-8 space-y-3">
        <legend className="sr-only">Options for question {index + 1}</legend>
        {question.options.map((option, idx) => {
            const isCorrect = idx === question.correctAnswerIndex;
            const isSelected = idx === selectedAnswer;

            return (
                <label key={idx} className={getOptionClasses(idx)}>
                    <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={idx}
                        checked={selectedAnswer === idx}
                        onChange={() => onAnswerChange(question.id, idx)}
                        disabled={isSubmitted}
                        className="sr-only" // Hide the actual radio button
                        aria-labelledby={`option-${question.id}-${idx}`}
                    />
                    
                    <div className="flex-shrink-0 mr-3">
                        {isSubmitted ? (
                            isCorrect ? <CheckCircleIcon className="w-6 h-6" />
                            : isSelected ? <XCircleIcon className="w-6 h-6" />
                            : <div className="w-6 h-6 border-2 border-slate-600 rounded-full"></div>
                        ) : (
                            <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all ${isSelected ? 'border-purple-400 bg-purple-500/50' : 'border-slate-500'}`}>
                                {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                            </div>
                        )}
                    </div>
                    
                    <span id={`option-${question.id}-${idx}`} className="flex-grow">
                        {question.type === QuestionType.MCQ || question.type === QuestionType.FILL ? (
                            <>
                                <span className="font-semibold text-slate-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                <span>{option}</span>
                            </>
                        ) : ( // True/False
                            <span>{option}</span>
                        )}
                    </span>
                </label>
            )
        })}
      </fieldset>
      {isSubmitted && question.explanation && (
        <div className="mt-4 pl-8 p-3 bg-black/20 rounded-md border border-white/10">
            <p className="text-sm font-semibold text-slate-200">Explanation:</p>
            <p className="text-sm text-slate-300 mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
