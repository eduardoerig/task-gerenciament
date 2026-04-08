export type Priority = 'LIGHT' | 'MODERATE' | 'IMPORTANT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  dueDate: string;
  estimatedMins: number;
  completed: boolean;
}

export interface Suggestion {
  focusCategory: string;
  suggestions: string[];
}
