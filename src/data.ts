import type { Notice } from './types';

/** Dates are generated relative to today so the demo deadlines always look live. */
function offset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export const seedNotices: Notice[] = [
  {
    id: 'n1',
    title: 'Mid-term Mathematics Examination',
    category: 'Exams',
    content:
      'The mid-term exam for Mathematics will cover Units 1–4: Algebra, Trigonometry, Coordinate Geometry and Probability. Bring your own calculator (non-programmable) and arrive 15 minutes early. Seating arrangements will be posted outside Room 204 the day before. Students with special accommodations should contact the exam office by Friday.',
    date: offset(-2),
    dueDate: offset(5),
    author: 'Prof. Sharma',
    urgency: 'high',
  },
  {
    id: 'n2',
    title: 'Physics Lab Report — Pendulum Experiment',
    category: 'Assignments',
    content:
      'Submit your lab report on the simple pendulum experiment. Include your raw data table, a graph of T² vs L, error analysis and a short conclusion. Upload as a single PDF on the class portal. Late submissions lose 10% per day.',
    date: offset(-4),
    dueDate: offset(2),
    author: 'Dr. Mehta',
    urgency: 'medium',
  },
  {
    id: 'n3',
    title: 'Annual Sports Day Registrations Open',
    category: 'Events',
    content:
      'Registrations for Annual Sports Day are now open. Events include 100m, 400m relay, long jump, chess and tug-of-war. Each student may register for up to three events. Sign up with your class rep before the deadline.',
    date: offset(-1),
    dueDate: offset(9),
    author: 'Class Rep (Alex)',
    urgency: 'low',
  },
  {
    id: 'n4',
    title: 'Term 2 Tuition Fee Reminder',
    category: 'Fees',
    content:
      'This is a reminder that Term 2 tuition fees are due. Payments can be made online through the parent portal or at the accounts office between 9 AM and 1 PM. A late fee applies after the due date. Parents who have already paid can ignore this notice.',
    date: offset(-6),
    dueDate: offset(1),
    author: 'Accounts Office',
    urgency: 'high',
  },
  {
    id: 'n5',
    title: 'Library Hours Extended During Exams',
    category: 'General',
    content:
      'The central library will remain open until 9 PM on weekdays for the next three weeks to support exam preparation. Quiet zones on the second floor are reserved for individual study.',
    date: offset(0),
    author: 'Librarian (Ms. Iyer)',
    urgency: 'low',
  },
  {
    id: 'n6',
    title: 'English Essay: "Technology and Society"',
    category: 'Assignments',
    content:
      'Write a 1,200-word argumentative essay on the impact of technology on society. Cite at least three sources using MLA format. Peer-review drafts will be exchanged in class next Tuesday.',
    date: offset(-3),
    dueDate: offset(7),
    author: 'Ms. Kapoor',
    urgency: 'medium',
  },
  {
    id: 'n7',
    title: 'Chemistry Practical Exam Schedule',
    category: 'Exams',
    content:
      'Practical exams will be held in batches. Batch A: morning slot, Batch B: afternoon slot. Lab coats and record books are mandatory. Check the batch list pinned in the chemistry lab.',
    date: offset(-1),
    dueDate: offset(12),
    author: 'Dr. Rao',
    urgency: 'medium',
  },
  {
    id: 'n8',
    title: 'Parent–Teacher Meeting',
    category: 'Events',
    content:
      'The quarterly parent–teacher meeting will be held in the main auditorium. Parents can book a 10-minute slot with each subject teacher through the portal.',
    date: offset(-8),
    dueDate: offset(-1),
    author: 'Principal’s Office',
    urgency: 'low',
  },
];
