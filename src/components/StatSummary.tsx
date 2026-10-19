import { BookOpen, CalendarClock, ClipboardList, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  active: number;
  unread: number;
  pendingAssignments: number;
  upcomingExams: number;
}

function Stat({ icon, label, value, hint }: { icon: ReactNode; label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{hint}</p>
    </div>
  );
}

export default function StatSummary({ active, unread, pendingAssignments, upcomingExams }: Props) {
  return (
    <section aria-label="Summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat icon={<Inbox className="h-3.5 w-3.5" />} label="Active notices" value={active} hint="Not past their deadline" />
      <Stat icon={<BookOpen className="h-3.5 w-3.5" />} label="Unread" value={unread} hint="Waiting for you" />
      <Stat icon={<ClipboardList className="h-3.5 w-3.5" />} label="Pending assignments" value={pendingAssignments} hint="Still open" />
      <Stat icon={<CalendarClock className="h-3.5 w-3.5" />} label="Upcoming exams" value={upcomingExams} hint="On the calendar" />
    </section>
  );
}
