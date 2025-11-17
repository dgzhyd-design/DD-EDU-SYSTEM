
import React, { useState } from 'react';
import type { User } from '../types';
import { EditUserModal } from './EditUserModal';
import { StudentReportModal } from './StudentReportModal';
import { ChartBarIcon, PencilIcon, TrashIcon } from './Icons';

interface AdminPortalProps {
    students: User[];
    onCreateStudent: (name: string, className: string) => void;
    teachers: User[];
    onCreateTeacher: (username: string, password_input: string, subject: string) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (username: string, role: User['role']) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ students, onCreateStudent, teachers, onCreateTeacher, onUpdateUser, onDeleteUser }) => {
    // State for student form
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentClass, setNewStudentClass] = useState('');
    const [studentError, setStudentError] = useState<string | null>(null);
    const [studentSuccess, setStudentSuccess] = useState<string | null>(null);
    
    // State for teacher form
    const [newTeacherUsername, setNewTeacherUsername] = useState('');
    const [newTeacherPassword, setNewTeacherPassword] = useState('');
    const [newTeacherSubject, setNewTeacherSubject] = useState('');
    const [teacherError, setTeacherError] = useState<string | null>(null);
    const [teacherSuccess, setTeacherSuccess] = useState<string | null>(null);

    // State for modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const openReportModal = (student: User) => {
        setSelectedUser(student);
        setIsReportModalOpen(true);
    };

    const closeModal = () => {
        setIsEditModalOpen(false);
        setIsReportModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = (updatedUser: User) => {
        onUpdateUser(updatedUser);
        closeModal();
    };


    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStudentError(null);
        setStudentSuccess(null);
        if (!newStudentName.trim() || !newStudentClass.trim()) {
            setStudentError("Student name and class cannot be empty.");
            return;
        }
        try {
            onCreateStudent(newStudentName, newStudentClass);
            setStudentSuccess(`Successfully created student account for: ${newStudentName}. Default password is "1234".`);
            setNewStudentName('');
            setNewStudentClass('');
        } catch (err) {
            setStudentError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
    };

    const handleTeacherSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTeacherError(null);
        setTeacherSuccess(null);
        if (!newTeacherUsername.trim() || !newTeacherPassword.trim() || !newTeacherSubject.trim()) {
            setTeacherError("Username, password, and subject cannot be empty.");
            return;
        }
        try {
            onCreateTeacher(newTeacherUsername, newTeacherPassword, newTeacherSubject);
            setTeacherSuccess(`Successfully created teacher account for: ${newTeacherUsername}`);
            setNewTeacherUsername('');
            setNewTeacherPassword('');
            setNewTeacherSubject('');
        } catch (err) {
            setTeacherError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="emboss-card p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-slate-200 border-b border-white/10 pb-3 mb-4">Create Teacher Account</h2>
                    <form onSubmit={handleTeacherSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="new-teacher-username" className="block text-sm font-medium text-slate-300">New Username</label>
                            <input
                                id="new-teacher-username" type="text" value={newTeacherUsername}
                                onChange={(e) => setNewTeacherUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 deboss-input"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="new-teacher-password" className="block text-sm font-medium text-slate-300">Password</label>
                            <input
                                id="new-teacher-password" type="password" value={newTeacherPassword}
                                onChange={(e) => setNewTeacherPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 deboss-input"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="new-teacher-subject" className="block text-sm font-medium text-slate-300">Subject</label>
                            <input
                                id="new-teacher-subject" type="text" value={newTeacherSubject}
                                onChange={(e) => setNewTeacherSubject(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 deboss-input"
                                placeholder="e.g., Physics, Mathematics"
                                required
                            />
                        </div>
                        {teacherError && <p className="text-sm text-red-400">{teacherError}</p>}
                        {teacherSuccess && <p className="text-sm text-green-400">{teacherSuccess}</p>}
                        <div>
                            <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border-none shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-br from-purple-500 to-indigo-600 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active">
                                Create Teacher
                            </button>
                        </div>
                    </form>
                </div>

                <div className="emboss-card p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-slate-200 border-b border-white/10 pb-3 mb-4">Create Student Account</h2>
                    <form onSubmit={handleStudentSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="new-student-name" className="block text-sm font-medium text-slate-300">Student Full Name</label>
                            <input
                                id="new-student-name" type="text" value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                placeholder="e.g., John Doe"
                                className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 deboss-input"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="new-student-class" className="block text-sm font-medium text-slate-300">Class / Grade</label>
                            <input
                                id="new-student-class" type="text" value={newStudentClass}
                                onChange={(e) => setNewStudentClass(e.target.value)}
                                placeholder="e.g., 10th Grade"
                                className="mt-1 block w-full px-3 py-2 bg-black/30 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 deboss-input"
                                required
                            />
                             <p className="mt-2 text-xs text-slate-400">
                                A unique username will be generated. Default password is <span className="font-semibold">1234</span>.
                             </p>
                        </div>
                        {studentError && <p className="text-sm text-red-400">{studentError}</p>}
                        {studentSuccess && <p className="text-sm text-green-400">{studentSuccess}</p>}
                        <div className="pt-5">
                            <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border-none shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-br from-purple-500 to-indigo-600 emboss-light hover:from-purple-600 hover:to-indigo-700 active:emboss-light-active">
                                Create Student
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="emboss-card p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-slate-200 border-b border-white/10 pb-3 mb-4">Manage Teachers</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/20">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {teachers.length > 0 ? teachers.map((teacher) => (
                                <tr key={teacher.username} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{teacher.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{teacher.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize">{teacher.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => openEditModal(teacher)} className="p-1 rounded-md hover:bg-purple-500/10"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDeleteUser(teacher.username, 'teacher')} className="p-1 rounded-md hover:bg-red-500/10"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-400">No teachers created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="emboss-card p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-slate-200 border-b border-white/10 pb-3 mb-4">Manage Students</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/20">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Username</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Class</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Exams Taken</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {students.length > 0 ? students.map((student) => (
                                <tr key={student.username} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.class}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.quizResults?.length ?? 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => openReportModal(student)} className="p-1 rounded-md hover:bg-sky-500/10"><ChartBarIcon className="w-5 h-5" /></button>
                                        <button onClick={() => openEditModal(student)} className="p-1 rounded-md hover:bg-purple-500/10"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDeleteUser(student.username, 'student')} className="p-1 rounded-md hover:bg-red-500/10"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-400">No students created yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isEditModalOpen && selectedUser && <EditUserModal isOpen={isEditModalOpen} onClose={closeModal} user={selectedUser} onSave={handleSaveUser} />}
            {isReportModalOpen && selectedUser && selectedUser.role === 'student' && <StudentReportModal isOpen={isReportModalOpen} onClose={closeModal} student={selectedUser} />}
        </div>
    );
};
