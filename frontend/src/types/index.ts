export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goals: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface Task {
  id: string;
  planId: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface Exercise {
  id: string;
  userId: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  content: string;
  answer: string;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  score?: number;
  status: 'pending' | 'submitted' | 'graded';
}

export interface Assignment {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  maxScore: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  gradedAt?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'submitted' | 'graded';
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string;
  hoursStudied: number;
  tasksCompleted: number;
  notes?: string;
  createdAt: string;
}

export interface Progress {
  userId: string;
  totalHours: number;
  tasksCompleted: number;
  streak: number;
  lastCheckinDate: string;
}
