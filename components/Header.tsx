
import React from 'react';
import { User } from '../types';
import { UserCircleIcon } from './Icons';

interface HeaderProps {
  user: Omit<User, 'password'>;
  onLogout: () => void;
}

const getRoleDisplayName = (role: User['role']) => {
  switch (role) {
    case 'admin': return 'Admin Portal';
    case 'teacher': return 'Teacher Portal';
    case 'student': return 'Student Portal';
  }
}

const Logo3D = () => (
    <div className="p-2 rounded-lg bg-white/10 emboss-light">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgb(129, 140, 248)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'rgb(192, 132, 252)', stopOpacity: 1}} />
                </linearGradient>
                <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                    <feOffset dx="1" dy="1" result="offsetblur"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                    </feComponentTransfer>
                    <feMerge> 
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                </filter>
            </defs>
            <path d="M12 6.253v11.494m-5.247-8.247l10.494 0M12 21.747c-5.385 0-9.747-4.362-9.747-9.747S6.615 2.253 12 2.253s9.747 4.362 9.747 9.747-4.362 9.747-9.747 9.747z" 
                  stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#logoShadow)"
            />
        </svg>
    </div>
);


export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <Logo3D />
            <div className='flex items-baseline gap-3'>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100">A1 Exam Platform</h1>
                <span className="text-sm font-semibold text-purple-400">{getRoleDisplayName(user.role)}</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-8 h-8 text-slate-300" />
              <div className="text-sm">
                <p className="font-semibold text-slate-200">{user.username}</p>
                <p className="text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active"
            >
                Logout
            </button>
        </div>
      </div>
    </header>
  );
};
