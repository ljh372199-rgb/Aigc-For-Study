export interface CareerAdviceContent {
  summary: string;
  skills: string[];
  learning_path: LearningPhase[];
  timeline: Milestone[];
  ability_assessment: AbilityAssessment;
  resources: Resource[];
}

export interface LearningPhase {
  phase: string;
  duration: string;
  content: string;
}

export interface Milestone {
  milestone: string;
  week: number;
  deliverable: string;
}

export interface AbilityAssessment {
  current: {
    technical: string[];
    soft: string[];
  };
  gap: {
    critical: string[];
    important: string[];
    nice_to_have: string[];
  };
}

export interface Resource {
  type: 'video' | 'document' | 'course' | 'book';
  title: string;
  url: string;
  description?: string;
}

export interface CareerAdvice {
  id: string;
  teacher_id: string;
  career_direction: string;
  content: CareerAdviceContent;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface StudentAdvice {
  id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  class_name?: string;
  is_read: boolean;
  read_at?: string;
  feedback?: string;
  created_at: string;
}

export interface GenerateCareerAdviceParams {
  career_direction: string;
  student_level: 'beginner' | 'intermediate' | 'advanced';
  time_period: '3个月' | '6个月' | '1年';
  include_resources?: boolean;
}

export interface AssignCareerAdviceParams {
  advice_id: string;
  student_ids: string[];
  class_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Student {
  id: string;
  username: string;
  email?: string;
  class_id?: string;
  class_name?: string;
}

export interface Class {
  id: string;
  name: string;
  student_count?: number;
}
