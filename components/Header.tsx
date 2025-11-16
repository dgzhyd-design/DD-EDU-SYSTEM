
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

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white rounded-md p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.247-8.247l10.494 0M12 21.747c-5.385 0-9.747-4.362-9.747-9.747S6.615 2.253 12 2.253s9.747 4.362 9.747 9.747-4.362 9.747-9.747 9.747z" />
                </svg>
            </div>
            <div className='flex items-baseline gap-3'>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">A1 Exam Platform</h1>
                <span className="text-sm font-semibold text-indigo-600">{getRoleDisplayName(user.role)}</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-8 h-8 text-gray-500" />
              <div className="text-sm">
                <p className="font-semibold text-gray-700">{user.username}</p>
                <p className="text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
            >
                Logout
            </button>
        </div>
      </div>
    </header>
  );
};
