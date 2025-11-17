
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (user: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as User);
    };

    const isStudent = user.role === 'student';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="emboss-card rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-slate-100">Edit {isStudent ? 'Student' : 'Teacher'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isStudent ? (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
                                <input
                                    id="name" name="name" type="text" value={formData.name || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md deboss-input" required
                                />
                            </div>
                             <div>
                                <label htmlFor="class" className="block text-sm font-medium text-slate-300">Class</label>
                                <input
                                    id="class" name="class" type="text" value={formData.class || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md deboss-input" required
                                />
                            </div>
                        </>
                    ) : (
                         <>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-300">Username</label>
                                <input
                                    id="username" name="username" type="text" value={formData.username || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md deboss-input" required
                                />
                            </div>
                             <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-300">Subject</label>
                                <input
                                    id="subject" name="subject" type="text" value={formData.subject || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md deboss-input" required
                                />
                            </div>
                        </>
                    )}
                     <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md text-slate-200 bg-white/10 emboss-light hover:bg-white/20 active:emboss-light-active">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-br from-purple-500 to-indigo-600 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
