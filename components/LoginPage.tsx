
import React, { useState } from 'react';
import { EyeSlashIcon, ArrowLeftIcon } from './Icons';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (username: string, password_input: string) => boolean;
  role: User['role'];
  onBack: () => void;
}

const portalTitles = {
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student'
};

const Logo3D = () => (
    <div className="inline-block p-3 mb-4 rounded-xl bg-white/10 emboss-light">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="loginLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: 'rgb(129, 140, 248)', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: 'rgb(192, 132, 252)', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <path d="M12 6.253v11.494m-5.247-8.247l10.494 0M12 21.747c-5.385 0-9.747-4.362-9.747-9.747S6.615 2.253 12 2.253s9.747 4.362 9.747 9.747-4.362 9.747-9.747 9.747z" 
                  stroke="url(#loginLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    </div>
);


export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, role, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
        const success = onLogin(username, password);
        if (!success) {
          setError('Invalid username or password. Please try again.');
        }
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative p-4">
       <button onClick={onBack} className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white font-semibold p-2 rounded-md transition-colors hover:bg-white/10">
            <ArrowLeftIcon className="w-5 h-5" />
            Back
        </button>
      <div className="w-full max-w-md p-8 space-y-8 emboss-card rounded-2xl">
        <div className="text-center">
            <Logo3D />
            <h1 className="text-3xl font-bold text-slate-100">{portalTitles[role]} Sign In</h1>
            <p className="mt-2 text-sm text-slate-400">Please enter your credentials to continue</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="relative block w-full px-4 py-3 bg-black/30 border border-white/10 rounded-md placeholder-slate-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm deboss-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password_input" className="sr-only">Password</label>
              <input
                id="password_input"
                name="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="relative block w-full px-4 py-3 bg-black/30 border border-white/10 rounded-md placeholder-slate-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm deboss-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                  <EyeSlashIcon className="h-5 w-5" />
              </button>
            </div>
          
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border-none text-sm font-medium rounded-md text-white bg-gradient-to-br from-purple-500 to-indigo-600 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active transition-all disabled:from-slate-500 disabled:to-slate-600"
            >
              {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
