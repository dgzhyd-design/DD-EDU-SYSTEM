
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
        const baseClasses = "flex items-center p-3 rounded-md border text-sm w-full transition-all";

        if (isSubmitted) {
            const isCorrect = optionIndex === question.correctAnswerIndex;
            const isSelected = optionIndex === selectedAnswer;

            if (isCorrect) {
                return `${baseClasses} bg-green-50 border-green-400 text-green-800 font-semibold`;
            }
            if (isSelected && !isCorrect) {
                return `${baseClasses} bg-red-50 border-red-400 text-red-800 font-semibold`;
            }
            return `${baseClasses} bg-gray-50 border-gray-200 text-gray-700`;
        }

        // State before submission
        if (selectedAnswer === optionIndex) {
            return `${baseClasses} bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 text-indigo-900 cursor-pointer`;
        }

        return `${baseClasses} bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer`;
    };
    
    return (
    <div className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start">
            <span className="text-lg font-bold text-gray-800 mr-2">{index + 1}.</span>
            <p className="text-lg font-medium text-gray-800">{question.stem}</p>
        </div>
        <div className="flex-shrink-0 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
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
                            isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            : isSelected ? <XCircleIcon className="w-6 h-6 text-red-500" />
                            : <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                        ) : (
                            <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'}`}>
                                {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                            </div>
                        )}
                    </div>
                    
                    <span id={`option-${question.id}-${idx}`} className="flex-grow">
                        {question.type === QuestionType.MCQ || question.type === QuestionType.FILL ? (
                            <>
                                <span className="font-semibold text-gray-600 mr-2">{String.fromCharCode(65 + idx)}.</span>
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
        <div className="mt-4 pl-8 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Explanation:</p>
            <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
