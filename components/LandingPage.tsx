
import React from 'react';
import { AcademicCapIcon, BookOpenIcon, BriefcaseIcon } from './Icons';
import type { User } from '../types';

interface LandingPageProps {
  onSelectPortal: (role: User['role']) => void;
}

const portalOptions = [
    {
        role: 'teacher',
        title: 'Teacher Portal',
        description: 'Create and manage exam papers.',
        icon: <BookOpenIcon className="w-10 h-10 text-indigo-500" />,
        color: 'hover:border-indigo-500'
    },
    {
        role: 'student',
        title: 'Student Portal',
        description: 'Take practice exams and review your results.',
        icon: <AcademicCapIcon className="w-10 h-10 text-green-500" />,
        color: 'hover:border-green-500'
    },
    {
        role: 'admin',
        title: 'Admin Portal',
        description: 'Manage student accounts and system settings.',
        icon: <BriefcaseIcon className="w-10 h-10 text-sky-500" />,
        color: 'hover:border-sky-500'
    }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPortal }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center mb-10">
             <div className="inline-block bg-indigo-600 text-white rounded-lg p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.247-8.247l10.494 0M12 21.747c-5.385 0-9.747-4.362-9.747-9.747S6.615 2.253 12 2.253s9.747 4.362 9.747 9.747-4.362 9.747-9.747 9.747z" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Welcome to A1 Exam Platform</h1>
            <p className="mt-3 text-lg text-gray-600">Please select your role to sign in.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {portalOptions.map(portal => (
                <button
                    key={portal.role}
                    onClick={() => onSelectPortal(portal.role as User['role'])}
                    className={`bg-white rounded-lg shadow-md p-8 text-center border-2 border-transparent transition-all duration-300 transform hover:-translate-y-2 ${portal.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                    <div className="flex items-center justify-center mb-4 bg-gray-100 rounded-full w-20 h-20 mx-auto">
                        {portal.icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{portal.title}</h2>
                    <p className="mt-2 text-gray-500">{portal.description}</p>
                </button>
            ))}
        </div>
    </div>
  );
};
