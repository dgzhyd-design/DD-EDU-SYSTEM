
export enum QuestionType {
  MCQ = 'Multiple Choice',
  TF = 'True/False',
  FILL = 'Fill in the Blank',
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export interface QuizResult {
  date: string;
  score: number;
  totalMarks: number;
  topicPerformance: {
    topic: string;
    correct: number;
    total: number;
  }[];
}

export interface Question {
  id: string;
  stem: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  type: QuestionType;
  marks: number;
  difficulty: Difficulty;
  topic: string;
  isAiGenerated: boolean;
  isApproved: boolean;
}

export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student';
  name?: string; // Optional: for student/teacher full name
  subject?: string; // Optional: only for teachers
  class?: string; // Optional: only for students
  quizResults?: QuizResult[]; // Optional: only for students
}
