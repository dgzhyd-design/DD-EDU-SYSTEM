
import React, { useState, useMemo, useEffect } from 'react';
import { QuestionBank } from './components/QuestionBank';
import { Header } from './components/Header';
import { AdvancedExamGeneratorModal } from './components/AdvancedExamGeneratorModal';
import { StudentPortal } from './components/StudentPortal';
import { LoginPage } from './components/LoginPage';
import { AdminPortal } from './components/AdminPortal';
import { LandingPage } from './components/LandingPage';
import { HomePage } from './components/HomePage';
import type { Question, User, QuizResult } from './types';
import { INITIAL_QUESTIONS, USERS } from './constants';

/**
 * A custom hook to manage state that persists in localStorage.
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if nothing is in localStorage.
 * @returns A stateful value, and a function to update it.
 */
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const App: React.FC = () => {
  const [questions, setQuestions] = usePersistentState<Question[]>('app_questions', INITIAL_QUESTIONS);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  
  // --- Authentication and User Management State ---
  const [currentUser, setCurrentUser] = useState<Omit<User, 'password'> | null>(null);
  const [students, setStudents] = usePersistentState<User[]>('app_students', USERS.filter(u => u.role === 'student'));
  const [teachers, setTeachers] = usePersistentState<User[]>('app_teachers', USERS.filter(u => u.role === 'teacher'));
  const [selectedPortal, setSelectedPortal] = useState<User['role'] | null>(null);
  const [showHomePage, setShowHomePage] = useState(true);
  
  const approvedQuestions = useMemo(() => questions.filter(q => q.isApproved), [questions]);

  const addMultipleQuestions = (newQuestions: Omit<Question, 'id' | 'isAiGenerated' | 'isApproved' | 'createdAt'>[]) => {
    const questionsToAdd = newQuestions.map((q, index) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      isAiGenerated: true,
      isApproved: false,
    }));
    setQuestions(prev => [...questionsToAdd, ...prev]);
    setIsGeneratorModalOpen(false); // Close modal on success
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== id));
  };
  
  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  // --- Authentication Handlers ---
  const handleLogin = (username: string, password_input: string): boolean => {
    const allUsers = [...USERS.filter(u => u.role === 'admin'), ...students, ...teachers];
    const user = allUsers.find(u => u.username === username && u.password === password_input);
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userToStore } = user;
      setCurrentUser(userToStore);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedPortal(null);
    setShowHomePage(true);
  };
  
  const handleCreateStudent = (name: string, className: string) => {
    const baseUsername = name.toLowerCase().replace(/\s+/g, '');
    if (!baseUsername) {
        throw new Error("Student name cannot be empty.");
    }

    const allUsers = [...USERS, ...students, ...teachers];
    let finalUsername = baseUsername;
    let counter = 1;

    // Ensure username is unique
    while (allUsers.some(u => u.username === finalUsername)) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
    }

    const newStudent: User = { 
        name,
        username: finalUsername, 
        password: '1234', // Default password
        role: 'student',
        class: className,
        quizResults: [],
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleCreateTeacher = (username: string, password_input: string, subject: string) => {
    const allUsers = [...USERS, ...students, ...teachers];
    if (allUsers.some(u => u.username === username)) {
      throw new Error("Username already exists. Please choose a different one.");
    }
    const newTeacher: User = { username, password: password_input, role: 'teacher', subject };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const handleQuizSubmission = (
    studentUsername: string,
    result: Omit<QuizResult, 'date'>
  ) => {
    setStudents(prev => 
      prev.map(student => {
        if (student.username === studentUsername) {
          const newResult: QuizResult = {
            ...result,
            date: new Date().toISOString(),
          };
          const updatedResults = [...(student.quizResults || []), newResult];
          return { ...student, quizResults: updatedResults };
        }
        return student;
      })
    );
  };

  const handleUpdateUser = (updatedUser: User) => {
    if (updatedUser.role === 'student') {
      setStudents(prev => prev.map(s => s.username === updatedUser.username ? updatedUser : s));
    } else if (updatedUser.role === 'teacher') {
      setTeachers(prev => prev.map(t => t.username === updatedUser.username ? updatedUser : t));
    }
  };

  const handleDeleteUser = (username: string, role: User['role']) => {
    if (role === 'student') {
      if (window.confirm(`Are you sure you want to delete the student "${username}"? This action cannot be undone.`)) {
        setStudents(prev => prev.filter(s => s.username !== username));
      }
    } else if (role === 'teacher') {
      if (window.confirm(`Are you sure you want to delete the teacher "${username}"? This action cannot be undone.`)) {
        setTeachers(prev => prev.filter(t => t.username !== username));
      }
    }
  };

  // --- Render Logic based on Authentication State ---
  if (showHomePage) {
    return <HomePage onEnter={() => setShowHomePage(false)} />;
  }

  if (!currentUser) {
    if (!selectedPortal) {
      return <LandingPage onSelectPortal={setSelectedPortal} />;
    }
    return <LoginPage 
      onLogin={handleLogin} 
      role={selectedPortal}
      onBack={() => setSelectedPortal(null)}
    />;
  }
  
  const renderPortal = () => {
    switch (currentUser.role) {
      case 'admin':
        return <AdminPortal 
                  students={students} 
                  onCreateStudent={handleCreateStudent}
                  teachers={teachers}
                  onCreateTeacher={handleCreateTeacher}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                />;
      case 'teacher':
        return (
          <QuestionBank 
            questions={questions} 
            onDeleteQuestion={deleteQuestion} 
            onUpdateQuestion={updateQuestion}
            onOpenGenerator={() => setIsGeneratorModalOpen(true)}
          />
        );
      case 'student':
        return <StudentPortal 
                questions={approvedQuestions} 
                onQuizSubmit={handleQuizSubmission} 
                currentUser={currentUser}
               />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="w-full">
          {renderPortal()}
        </div>
      </main>
      
      {currentUser.role === 'teacher' && (
        <AdvancedExamGeneratorModal 
          isOpen={isGeneratorModalOpen}
          onClose={() => setIsGeneratorModalOpen(false)}
          onAddQuestions={addMultipleQuestions}
        />
      )}
    </div>
  );
};

export default App;