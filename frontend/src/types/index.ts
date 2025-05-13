// Auth types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_pic?: string;
  phone_number?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  project: number;
  assignee?: number;
  created_by: number;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  created_at: string;
  updated_at: string;
}

// TimeReport types
export interface TimeReport {
  id: number;
  task: number;
  user: number;
  hours: number;
  date: string;
  description: string;
  created_at: string;
}

// File types
export interface Directory {
  id: number;
  name: string;
  project: number;
  parent?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  subdirectories?: Directory[];
  files?: File[];
}

export interface File {
  id: number;
  name: string;
  directory?: number;
  project: number;
  file: string;
  content_type: string;
  size: number;
  version: number;
  previous_version?: number;
  is_latest: boolean;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
}

// Calendar/Event types
export type EventType = 'meeting' | 'task' | 'deadline';

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: EventType;
  projectName?: string;
  location?: string;
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
}

// Message types
export interface Message {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  projectName?: string;
  category?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  attachments?: Array<{
    id: number;
    name: string;
    type: string;
    size: number;
  }>;
  comments?: Array<{
    id: number;
    author: {
      id: number;
      name: string;
      avatar?: string;
    };
    content: string;
    createdAt: Date;
  }>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}