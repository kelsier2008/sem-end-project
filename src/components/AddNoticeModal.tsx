import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES, type Category, type Notice, type Urgency } from '../types';
import { todayISO, uid } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (n: Notice) => void;
}

interface Form {
  title: string;
  category: Category;
  content: string;
  author: string;
  dueDate: string;
  urgency: Urgency;
}

const EMPTY: Form = { title: '', category: 'General', content: '', author: '', dueDate: '', urgency: 'low' };
const DEADLINE_CATEGORIES: Category[] = ['Exams', 'Assignments', 'Fees'];

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.title.trim().length < 3) e.title = 'Give the notice a title of at least 3 characters.';
  if (f.content.trim().length < 10) e.content = 'Add a few words of detail (10+ characters).';
  if (!f.author.trim()) e.author = 'Who is posting this?';
  if (DEADLINE_CATEGORIES.includes(f.category) && !f.dueDate) e.dueDate = `${f.category} notices need a due date.`;
  else if (f.dueDate && f.dueDate < todayISO()) e.dueDate = 'The due date can’t be in the past.';
  return e;
}

const inputCls =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition duration-200 placeholder:text-neutral-400 focus:ring-4 dark:bg-neutral-950 dark:[color-scheme:dark]';
const okCls = 'border-neutral-200 focus:border-neutral-400 focus:ring-neutral-900/5 dark:border-neutral-800 dark:focus:border-neutral-600 dark:focus:ring-white/5';
const errCls = 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-500/60';

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {optional && <span className="font-normal text-neutral-400">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default function AddNoticeModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const uidBase = useId();
  const id = (k: string) => `${uidBase}-${k}`;

  const errors = validate(form);
  const shown = touched ? errors : {};

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement;
    setForm(EMPTY);
    setTouched(false);
    const t = setTimeout(() => firstRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const els = dialogRef.current.querySelectorAll<HTMLElement>('input, select, textarea, button');
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) {
      const firstBad = Object.keys(errors)[0];
      document.getElementById(id(firstBad))?.focus();
      return;
    }
    onSubmit({
      id: uid(),
      title: form.title.trim(),
      category: form.category,
      content: form.content.trim(),
      author: form.author.trim(),
      date: todayISO(),
      dueDate: form.dueDate || undefined,
      urgency: form.urgency,
      isRead: true,
      isStarred: false,
    });
    onClose();
  };

  const a11y = (k: keyof Form) => ({
    id: id(k),
    'aria-invalid': !!shown[k] || undefined,
    'aria-describedby': shown[k] ? `${id(k)}-err` : undefined,
    className: `${inputCls} ${shown[k] ? errCls : okCls}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-neutral-950/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id('heading')}
        className="relative flex max-h-[92vh] w-full max-w-lg animate-scale-in flex-col rounded-t-2xl border border-neutral-200 bg-white shadow-2xl sm:rounded-2xl dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <h2 id={id('heading')} className="text-base font-semibold tracking-tight">
              New notice
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Share an announcement with the class.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-5 py-5">
            <Field id={id('title')} label="Title" error={shown.title}>
              <input ref={firstRef} {...a11y('title')} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Physics lab report due" maxLength={120} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id={id('category')} label="Category">
                <select {...a11y('category')} value={form.category} onChange={(e) => set('category', e.target.value as Category)}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field id={id('dueDate')} label="Due date" error={shown.dueDate} optional={!DEADLINE_CATEGORIES.includes(form.category)}>
                <input type="date" {...a11y('dueDate')} value={form.dueDate} min={todayISO()} onChange={(e) => set('dueDate', e.target.value)} />
              </Field>
            </div>

            <Field id={id('content')} label="Details" error={shown.content}>
              <textarea {...a11y('content')} rows={4} value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="What do students and parents need to know?" className={`${a11y('content').className} resize-y`} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id={id('author')} label="Posted by" error={shown.author}>
                <input {...a11y('author')} value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="Prof. Sharma or Class Rep (Alex)" />
              </Field>
              <fieldset>
                <legend className="mb-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">Urgency</legend>
                <div className="grid grid-cols-3 rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800">
                  {(['low', 'medium', 'high'] as Urgency[]).map((u) => (
                    <label
                      key={u}
                      className={`cursor-pointer rounded-md py-1.5 text-center text-xs font-medium capitalize transition duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-400 ${
                        form.urgency === u
                          ? u === 'high'
                            ? 'bg-rose-500 text-white'
                            : u === 'medium'
                              ? 'bg-amber-500 text-white'
                              : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                      }`}
                    >
                      <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={() => set('urgency', u)} className="sr-only" />
                      {u}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3.5 dark:border-neutral-800">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-neutral-700 active:scale-[0.98] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
              Post notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
