
import { Question, QuestionType, Difficulty, User } from './types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    createdAt: new Date('2023-10-26T10:00:00Z').toISOString(),
    stem: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswerIndex: 2,
    explanation: 'Paris is the capital and most populous city of France.',
    type: QuestionType.MCQ,
    difficulty: Difficulty.EASY,
    marks: 1,
    topic: 'World Geography',
    isAiGenerated: false,
    isApproved: true,
  },
  {
    id: 'q-2',
    createdAt: new Date('2023-10-26T10:05:00Z').toISOString(),
    stem: 'The sun rises in the west.',
    options: ['True', 'False'],
    correctAnswerIndex: 1,
    explanation: 'The sun rises in the east due to the Earth\'s rotation.',
    type: QuestionType.TF,
    difficulty: Difficulty.EASY,
    marks: 1,
    topic: 'Basic Science',
    isAiGenerated: false,
    isApproved: true,
  },
];

export const USERS: User[] = [
  { username: 'dgzhyd', password: '9700653332', role: 'admin' },
  { username: 'teacher', password: 'password', role: 'teacher', subject: 'Physics', name: 'Default Teacher' },
  { username: 'student1', password: 'password', role: 'student', name: 'Initial Student', class: '10th Grade', quizResults: [] },
];