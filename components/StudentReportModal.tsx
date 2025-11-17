
import React, { useMemo } from 'react';
import type { User } from '../types';

interface StudentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: User | null;
}

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    const bgColor = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="w-full bg-black/30 rounded-full h-2.5">
            <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

export const StudentReportModal: React.FC<StudentReportModalProps> = ({ isOpen, onClose, student }) => {
    
    const reportData = useMemo(() => {
        if (!student || !student.quizResults) return null;

        const totalExams = student.quizResults.length;
        const totalScored = student.quizResults.reduce((acc, r) => acc + r.score, 0);
        const totalPossible = student.quizResults.reduce((acc, r) => acc + r.totalMarks, 0);
        const averageScore = totalExams > 0 ? (totalScored / totalPossible) * 100 : 0;

        const topicStats: Record<string, { correct: number, total: number }> = {};

        student.quizResults.forEach(result => {
            result.topicPerformance.forEach(tp => {
                if (!topicStats[tp.topic]) {
                    topicStats[tp.topic] = { correct: 0, total: 0 };
                }
                topicStats[tp.topic].correct += tp.correct;
                topicStats[tp.topic].total += tp.total;
            });
        });

        const topics = Object.entries(topicStats).map(([topic, data]) => ({
            topic,
            percentage: (data.correct / data.total) * 100
        })).sort((a,b) => b.percentage - a.percentage);

        const strengths = topics.filter(t => t.percentage >= 75);
        const weaknesses = topics.filter(t => t.percentage < 50);

        return {
            totalExams,
            averageScore,
            strengths,
            weaknesses,
            topics
        };

    }, [student]);


    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="emboss-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 sticky top-0 bg-slate-800/50 backdrop-blur-sm z-10 -m-6 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Performance Report</h2>
                        <p className="text-sm text-slate-400">{student.name} ({student.class})</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {!reportData || reportData.totalExams === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400">No exam data available for this student yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6 pt-4">
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                                <div className="text-3xl font-bold text-purple-400">{reportData.totalExams}</div>
                                <div className="text-sm font-medium text-slate-400">Exams Attended</div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                                <div className="text-3xl font-bold text-purple-400">{reportData.averageScore.toFixed(1)}%</div>
                                <div className="text-sm font-medium text-slate-400">Average Score</div>
                            </div>
                        </div>

                        {/* Strength & Weakness */}
                        <div>
                             <h3 className="text-lg font-semibold text-slate-200 mb-2">Topic Performance</h3>
                             <div className="space-y-3">
                                {reportData.topics.map(({topic, percentage}) => (
                                    <div key={topic}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-slate-300">{topic}</span>
                                            <span className="text-sm font-bold text-slate-100">{percentage.toFixed(0)}%</span>
                                        </div>
                                        <ProgressBar percentage={percentage} />
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Exam History */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-200 mb-2">Exam History</h3>
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-white/10">
                                    <thead className="bg-black/20">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Score</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {student.quizResults?.map((result, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{new Date(result.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 font-semibold">{result.score} / {result.totalMarks}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-100 font-semibold">{((result.score / result.totalMarks) * 100).toFixed(1)}%</td>
                                            </tr>
                                        )).reverse()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
