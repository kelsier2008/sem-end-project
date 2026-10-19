export type Category = 'Exams' | 'Assignments' | 'Events' | 'Fees' | 'General';
export type Urgency = 'low' | 'medium' | 'high';

export interface Notice {
  id: string;
  title: string;
  category: Category;
  content: string;
  /** ISO date (YYYY-MM-DD) the notice was posted. */
  date: string;
  /** Optional deadline for assignments, exams or fees. */
  dueDate?: string;
  author: string;
  isStarred?: boolean;
  isRead?: boolean;
  urgency?: Urgency;
}

export const CATEGORIES: Category[] = ['Exams', 'Assignments', 'Events', 'Fees', 'General'];

export type QuickFilter = 'All' | 'Starred' | 'Unread';
export type SortOrder = 'newest' | 'deadline';
