export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface CareerResponse {
  id: string;
  name: string;
  description: string;
  skills_required: string[];
  created_at: string;
}

export interface LearningPlanResponse {
  id: string;
  user_id: string;
  career_goal_id: string;
  title: string;
  plan_data: object;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CheckinResponse {
  id: string;
  user_id: string;
  duration_minutes: number;
  note: string;
  check_in_date: string;
  created_at: string;
}

export interface ExerciseResponse {
  id: string;
  plan_id: string;
  topic: string;
  content: string;
  type: string;
  answer: string;
  options?: string[];
  difficulty: string;
  result?: string;
  student_id: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  teacher_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HomeworkResponse {
  id: string;
  title: string;
  description: string;
  course_id: string;
  deadline: string;
  max_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionResponse {
  id: string;
  homework_id: string;
  student_id: string;
  content: string;
  submitted_at: string;
  score?: number;
  feedback?: string;
  status: string;
}

export interface StudentStatsResponse {
  total_study_time: number;
  total_exercises: number;
  completed_exercises: number;
  total_assignments: number;
  completed_assignments: number;
  average_score: number;
  current_streak: number;
}

export interface TeacherStatsResponse {
  pending_homework: number;
  total_students: number;
  average_score: number;
}
