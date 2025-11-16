
import React, { useState, useEffect, useMemo } from 'react';
import type { Question, User, QuizResult } from '../types';
import { StudentQuestionItem } from './StudentQuestionItem';
import { ArrowPathIcon } from './Icons';

interface StudentPortalProps {
  questions: Question[];
  currentUser: Omit<User, 'password'>;
  onQuizSubmit: (studentUsername: string, result: Omit<QuizResult, 'date'>) => void;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: Question[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const StudentPortal: React.FC<StudentPortalProps> = ({ questions, currentUser, onQuizSubmit }) => {
    const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [quizState, setQuizState] = useState<'taking' | 'submitted'>('taking');
    const [score, setScore] = useState(0);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

    useEffect(() => {
        setShuffledQuestions(shuffleArray(questions));
    }, [questions]);

    const totalMarks = useMemo(() => shuffledQuestions.reduce((acc, q) => acc + q.marks, 0), [shuffledQuestions]);

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex,
        }));
    };

    const handleSubmit = () => {
        let currentScore = 0;
        let correctCount = 0;
        const topicPerformanceMap: Record<string, { correct: number, total: number }> = {};

        shuffledQuestions.forEach(q => {
            if (!topicPerformanceMap[q.topic]) {
                topicPerformanceMap[q.topic] = { correct: 0, total: 0 };
            }
            topicPerformanceMap[q.topic].total += 1;

            if (answers[q.id] === q.correctAnswerIndex) {
                currentScore += q.marks;
                correctCount++;
                topicPerformanceMap[q.topic].correct += 1;
            }
        });

        const topicPerformance = Object.entries(topicPerformanceMap).map(([topic, data]) => ({
            topic,
            ...data
        }));

        onQuizSubmit(currentUser.username, {
            score: currentScore,
            totalMarks: totalMarks,
            topicPerformance,
        });

        setScore(currentScore);
        setCorrectAnswersCount(correctCount);
        setQuizState('submitted');
        window.scrollTo(0, 0); // Scroll to top to see results
    };

    const handleTryAgain = () => {
        setAnswers({});
        setScore(0);
        setCorrectAnswersCount(0);
        setShuffledQuestions(shuffleArray(questions)); // Re-shuffle for a new attempt
        setQuizState('taking');
    };
    
    if (quizState === 'submitted') {
        return (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-indigo-700">Exam Results</h1>
                    <p className="text-2xl font-semibold text-gray-800 mt-4">You Scored: {score} / {totalMarks}</p>
                    <p className="text-md text-gray-500 mt-1">({correctAnswersCount} out of {shuffledQuestions.length} correct)</p>
                    <button
                        onClick={handleTryAgain}
                        className="mt-6 inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowPathIcon className="w-5 h-5 mr-2 -ml-1" />
                        Try Again
                    </button>
                </div>
                <div className="space-y-8">
                    {shuffledQuestions.map((question, index) => (
                        <StudentQuestionItem 
                            key={question.id} 
                            question={question}
                            index={index}
                            isSubmitted={true}
                            selectedAnswer={answers[question.id]}
                            onAnswerChange={() => {}} // No-op when submitted
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <div className="text-center border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">A1 Level Examination</h1>
                <p className="text-md text-gray-500 mt-1">Sample Paper</p>
                <div className="flex justify-center gap-8 mt-4">
                    <p className="text-sm font-medium">
                        <span className="text-gray-500">Total Questions:</span>
                        <span className="text-gray-900 font-bold ml-2">{shuffledQuestions.length}</span>
                    </p>
                    <p className="text-sm font-medium">
                        <span className="text-gray-500">Total Marks:</span>
                        <span className="text-gray-900 font-bold ml-2">{totalMarks}</span>
                    </p>
                </div>
            </div>

            {shuffledQuestions.length > 0 ? (
                <>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div className="space-y-8">
                            {shuffledQuestions.map((question, index) => (
                                <StudentQuestionItem 
                                    key={question.id} 
                                    question={question}
                                    index={index}
                                    isSubmitted={false}
                                    selectedAnswer={answers[question.id]}
                                    onAnswerChange={handleAnswerChange}
                                />
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t">
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Submit Exam
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <div className="text-center py-10 px-6 bg-gray-50 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Exam Paper Available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The teacher has not approved any questions for the exam yet.
                    </p>
                </div>
            )}
        </div>
    );
};
