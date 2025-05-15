// Basic type definitions for the ValvX platform
// This file defines common TypeScript interfaces used throughout the application

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_pic?: string;
  phone_number?: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
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

// Role types
export enum UserRole {
  PROJECT_LEADER = 'project_leader',
  MEMBER = 'member',
  GUEST = 'guest',
}

export interface RoleAccess {
  id: number;
  user: number;
  project: number;
  role: UserRole;
}

// Task types
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

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

// File types
export interface Directory {
  id: number;
  name: string;
  project: number;
  parent?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
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

// Wiki types
export interface WikiArticle {
  id: number;
  title: string;
  content: string;
  project: number;
  created_by: number;
  last_edited_by: number;
  created_at: string;
  updated_at: string;
  parent?: number;
  order: number;
}

// Time reporting types
export interface TimeReport {
  id: number;
  task: number;
  user: number;
  hours: number;
  date: string;
  description: string;
  created_at: string;
}

// Notification types
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_COMPLETED = 'task_completed',
  COMMENT_ADDED = 'comment_added',
  FILE_UPLOADED = 'file_uploaded',
  MEETING_SCHEDULED = 'meeting_scheduled',
  DUE_DATE_REMINDER = 'due_date_reminder',
  CUSTOM = 'custom',
}

export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  type: NotificationType;
  project?: number;
  task?: number;
  is_read: boolean;
  created_at: string;
}

// Meeting types
export interface Meeting {
  id: number;
  title: string;
  description: string;
  project: number;
  organizer: number;
  attendees: number[];
  start_time: string;
  end_time: string;
  location: string;
  is_virtual: boolean;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

export interface ApiError {
  detail?: string;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}
