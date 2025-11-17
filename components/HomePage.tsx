
import React from 'react';

interface HomePageProps {
  onEnter: () => void;
}

const Logo3D = () => (
    <div className="inline-block p-4 mb-6 rounded-xl bg-white/10 emboss-light">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="homeLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgb(129, 140, 248)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'rgb(244, 114, 182)', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path d="M12 6.253v11.494m-5.247-8.247l10.494 0M12 21.747c-5.385 0-9.747-4.362-9.747-9.747S6.615 2.253 12 2.253s9.747 4.362 9.747 9.747-4.362 9.747-9.747 9.747z" 
                  stroke="url(#homeLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    </div>
);

export const HomePage: React.FC<HomePageProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900 text-white p-4">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-0 -right-10 w-80 h-80 bg-yellow-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-12 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 w-full max-w-2xl text-center emboss-card rounded-2xl p-8 md:p-12" style={{ perspective: '1000px' }}>
         <div className="transform-gpu" style={{ transform: 'translateZ(50px)' }}>
            <Logo3D />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
                VARAHI EDU SOLUTION
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto">
                Revolutionizing Education with AI-Powered Assessment Tools. Create, manage, and deliver exams with unparalleled efficiency and security.
            </p>
            <button 
                onClick={onEnter}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 emboss-light active:emboss-light-active"
            >
                Enter Platform
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};
