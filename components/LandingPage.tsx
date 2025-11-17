
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
        icon: <BookOpenIcon className="w-12 h-12" />,
        color: 'hover:border-purple-400'
    },
    {
        role: 'student',
        title: 'Student Portal',
        description: 'Take practice exams and review your results.',
        icon: <AcademicCapIcon className="w-12 h-12" />,
        color: 'hover:border-green-400'
    },
    {
        role: 'admin',
        title: 'Admin Portal',
        description: 'Manage student accounts and system settings.',
        icon: <BriefcaseIcon className="w-12 h-12" />,
        color: 'hover:border-sky-400'
    }
];

const Logo3D = () => (
    <div className="inline-block p-3 mb-4 rounded-xl bg-white/10 emboss-light">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="landingLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgb(129, 140, 248)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'rgb(192, 132, 252)', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path d="M12 6.253v11.494m-5.247-8.247l10.494 0M12 21.747c-5.385 0-9.747-4.362-9.747-9.747S6.615 2.253 12 2.253s9.747 4.362 9.747 9.747-4.362 9.747-9.747 9.747z" 
                  stroke="url(#landingLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPortal }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
        <div className="text-center mb-10">
            <Logo3D />
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">Welcome to A1 Exam Platform</h1>
            <p className="mt-3 text-lg text-slate-300">Please select your role to sign in.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {portalOptions.map(portal => (
                <button
                    key={portal.role}
                    onClick={() => onSelectPortal(portal.role as User['role'])}
                    className={`emboss-card rounded-lg p-8 text-center border-2 border-transparent transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 ${portal.color}`}
                >
                    <div className="flex items-center justify-center mb-4 bg-black/20 rounded-full w-24 h-24 mx-auto emboss-light">
                        {portal.icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{portal.title}</h2>
                    <p className="mt-2 text-slate-400">{portal.description}</p>
                </button>
            ))}
        </div>
    </div>
  );
};
