export const CATEGORIES = ['Exams', 'Assignments', 'Events', 'Fees'] as const;
export type Category = (typeof CATEGORIES)[number];

export const PRIORITIES = ['High', 'Normal'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface ActionLink {
  label: string;
  url: string;
}

/** One announcement. Field names follow the CampusBoard schema exactly. */
export interface Notice {
  id: string;
  title: string;
  /** Short summary shown on cards. */
  description: string;
  /** Full text shown in the detail view. Always rendered as plain text, never as HTML. */
  content: string;
  category: Category;
  department: string;
  author: string;
  /** ISO 8601 timestamp. */
  publishedAt: string;
  /** ISO 8601 timestamp, or null when the notice has no deadline. */
  deadline?: string | null;
  priority: Priority;
  isRead: boolean;
  isStarred: boolean;
  isUserCreated: boolean;
  actionLink?: ActionLink;
}

/** The fields a person fills in on the notice form. */
export type NoticeInput = Omit<Notice, 'id' | 'isRead' | 'isStarred' | 'isUserCreated'>;

export type StatusFilter = 'All' | 'Unread' | 'Read';
export type SortOrder = 'newest' | 'oldest' | 'deadline';

export interface FilterState {
  category: Category | 'All';
  status: StatusFilter;
  importantOnly: boolean;
  highPriorityOnly: boolean;
  sort: SortOrder;
}
