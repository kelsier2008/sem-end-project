import { useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { HardDrive, Zap } from 'lucide-react';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { btn, input, inputBox, inputError, inputOk } from '../styles';
import { CATEGORIES, PRIORITIES, type Category, type Notice, type NoticeInput, type Priority } from '../types';
import { fromLocalInputs, safeUrl, toDateInput, toTimeInput } from '../utils';
import Modal, { ModalHeader } from './Modal';

interface Form {
  title: string;
  description: string;
  content: string;
  category: Category;
  department: string;
  author: string;
  publishedDate: string;
  deadlineDate: string;
  deadlineTime: string;
  priority: Priority;
  linkLabel: string;
  linkUrl: string;
}

type Errors = Partial<Record<keyof Form, string>>;

/** Order used to focus the first invalid field after a failed submit. */
const FIELD_ORDER: (keyof Form)[] = [
  'title',
  'description',
  'content',
  'category',
  'priority',
  'department',
  'author',
  'publishedDate',
  'deadlineDate',
  'linkLabel',
  'linkUrl',
];

const LIMITS = { title: 120, description: 200, content: 5000, department: 60, author: 60, linkLabel: 60, linkUrl: 500 };

function toForm(n?: Notice | null): Form {
  const deadline = n?.deadline ? new Date(n.deadline) : null;
  return {
    title: n?.title ?? '',
    description: n?.description ?? '',
    content: n?.content ?? '',
    category: n?.category ?? 'Assignments',
    department: n?.department ?? '',
    author: n?.author ?? '',
    publishedDate: toDateInput(n ? new Date(n.publishedAt) : new Date()),
    deadlineDate: deadline ? toDateInput(deadline) : '',
    deadlineTime: deadline ? toTimeInput(deadline) : '',
    priority: n?.priority ?? 'Normal',
    linkLabel: n?.actionLink?.label ?? '',
    linkUrl: n?.actionLink?.url ?? '',
  };
}

/** Keeps the original timestamp when the date is unchanged; otherwise uses now (today) or 9 AM (past days). */
function buildPublishedAt(form: Form, original: Notice | null | undefined, now: Date): string | null {
  if (original && toDateInput(new Date(original.publishedAt)) === form.publishedDate) return original.publishedAt;
  const time = form.publishedDate === toDateInput(now) ? toTimeInput(now) : '09:00';
  return fromLocalInputs(form.publishedDate, time);
}

function validate(form: Form, original: Notice | null | undefined, now: Date): { errors: Errors; input?: NoticeInput } {
  const e: Errors = {};
  const title = form.title.trim();
  const description = form.description.trim();
  const content = form.content.trim();
  const department = form.department.trim();
  const author = form.author.trim();

  if (title.length < 3) e.title = 'Enter a title of at least 3 characters.';
  if (description.length < 10) e.description = 'Write a short summary of at least 10 characters.';
  if (content.length < 20) e.content = 'Add the full notice text (at least 20 characters).';
  if (!CATEGORIES.includes(form.category)) e.category = 'Choose a category.';
  if (!PRIORITIES.includes(form.priority)) e.priority = 'Choose a priority.';
  if (!department) e.department = 'Enter the department or office posting this.';
  if (!author) e.author = 'Enter who is posting this notice.';

  const publishedAt = form.publishedDate ? buildPublishedAt(form, original, now) : null;
  if (!form.publishedDate) e.publishedDate = 'Choose the publishing date.';
  else if (!publishedAt) e.publishedDate = 'Enter a valid date.';
  else if (form.publishedDate > toDateInput(now)) e.publishedDate = 'The publishing date can’t be in the future.';

  let deadline: string | null = null;
  if (form.deadlineDate) {
    deadline = fromLocalInputs(form.deadlineDate, form.deadlineTime || '23:59');
    const unchanged = !!original?.deadline && deadline === new Date(original.deadline).toISOString();
    if (!deadline) e.deadlineDate = 'Enter a valid deadline date and time.';
    else if (form.publishedDate && form.deadlineDate < form.publishedDate)
      e.deadlineDate = 'The deadline can’t be before the publishing date.';
    else if (!unchanged && new Date(deadline).getTime() < now.getTime())
      e.deadlineDate = 'This deadline has already passed. Choose a later date or time.';
  } else if (form.deadlineTime) {
    e.deadlineDate = 'Choose a date for this deadline, or clear the time.';
  }

  const linkLabel = form.linkLabel.trim();
  const linkUrl = form.linkUrl.trim();
  if (linkUrl && !safeUrl(linkUrl)) e.linkUrl = 'Enter a full web address starting with https://';
  else if (linkLabel && !linkUrl) e.linkUrl = 'Add the link address, or clear the label.';
  if (linkUrl && !linkLabel) e.linkLabel = 'Add a label for the link, e.g. “Submission form”.';

  if (Object.keys(e).length) return { errors: e };

  return {
    errors: e,
    input: {
      title,
      description,
      content,
      category: form.category,
      department,
      author,
      publishedAt: publishedAt!,
      deadline,
      priority: form.priority,
      // Set explicitly (even to undefined) so removing a link while editing actually removes it.
      actionLink: linkLabel && linkUrl ? { label: linkLabel, url: safeUrl(linkUrl)! } : undefined,
    },
  };
}

function Field({
  id,
  label,
  error,
  hint,
  optional,
  counter,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {optional && <span className="ml-1.5 text-xs font-normal text-ink-muted">Optional</span>}
        </label>
        {counter && (
          <span className="text-xs tabular-nums text-ink-muted" aria-hidden>
            {counter}
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  /** Pass a notice to edit it; leave empty to create a new one. */
  notice?: Notice | null;
  onClose: () => void;
}

/** Add or edit a notice. Mounted only while open, so the form always starts fresh. */
export default function AddNoticeModal({ notice, onClose }: Props) {
  const { now, addNotice, updateNotice } = useNotices();
  const { notify } = useUI();
  const [form, setForm] = useState<Form>(() => toForm(notice));
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const base = useId();
  const id = (k: string) => `${base}-${k}`;
  const editing = !!notice;

  const { errors } = validate(form, notice, now);
  const shown: Errors = submitted ? errors : {};
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const fieldProps = (k: keyof Form, hint?: boolean) => ({
    id: id(k),
    'aria-invalid': shown[k] ? true : undefined,
    'aria-describedby': shown[k] ? `${id(k)}-error` : hint ? `${id(k)}-hint` : undefined,
    className: `${input} ${shown[k] ? inputError : inputOk}`,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = validate(form, notice, new Date());
    if (!result.input) {
      const first = FIELD_ORDER.find((k) => result.errors[k]);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    if (notice) {
      updateNotice(notice.id, result.input);
      notify('Changes saved');
    } else {
      addNotice(result.input);
      notify('Notice published');
    }
    onClose();
  };

  // Pressing Enter in a single-line field shouldn't submit a half-finished notice.
  const blockEnterSubmit = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && target instanceof HTMLInputElement && target.type !== 'submit') e.preventDefault();
  };

  const errorCount = Object.keys(shown).length;

  return (
    <Modal open onClose={onClose} labelledBy={id('heading')} size="lg" closeOnBackdrop={false} initialFocus={titleRef}>
      <ModalHeader
        titleId={id('heading')}
        title={editing ? 'Edit notice' : 'Add a notice'}
        subtitle={editing ? 'Update the details of a notice you added.' : 'Share an announcement or deadline with your class.'}
        onClose={onClose}
      />

      <form onSubmit={submit} onKeyDown={blockEnterSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {errorCount > 0 && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              Please fix {errorCount === 1 ? '1 field' : `${errorCount} fields`} below.
            </p>
          )}

          <Field id={id('title')} label="Title" error={shown.title} counter={`${form.title.length}/${LIMITS.title}`}>
            <input
              ref={titleRef}
              {...fieldProps('title')}
              value={form.title}
              maxLength={LIMITS.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Physics lab report submission"
              autoComplete="off"
            />
          </Field>

          <Field
            id={id('description')}
            label="Short summary"
            error={shown.description}
            hint="Shown on the notice card."
            counter={`${form.description.length}/${LIMITS.description}`}
          >
            <textarea
              {...fieldProps('description', true)}
              rows={2}
              value={form.description}
              maxLength={LIMITS.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="One or two sentences students should see first."
            />
          </Field>

          <Field id={id('content')} label="Full notice" error={shown.content} counter={`${form.content.length}/${LIMITS.content}`}>
            <textarea
              {...fieldProps('content')}
              rows={6}
              value={form.content}
              maxLength={LIMITS.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder="All the details: what, where, requirements, contact…"
              className={`${fieldProps('content').className} resize-y`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id={id('category')} label="Category" error={shown.category}>
              <select {...fieldProps('category')} value={form.category} onChange={(e) => set('category', e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">Priority</legend>
              <div className="grid h-[42px] grid-cols-2 rounded-xl border border-line bg-raised p-1">
                {PRIORITIES.map((p) => (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-[9px] text-sm font-medium transition duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                      form.priority === p
                        ? p === 'High'
                          ? 'bg-red-600 text-white shadow-card'
                          : 'bg-surface text-ink shadow-card'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      name={id('priority')}
                      id={p === 'Normal' ? id('priority') : undefined}
                      value={p}
                      checked={form.priority === p}
                      onChange={() => set('priority', p)}
                      className="sr-only"
                    />
                    {p === 'High' && <Zap className="h-3.5 w-3.5" aria-hidden />}
                    {p === 'High' ? 'High (urgent)' : 'Normal'}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id={id('department')} label="Department" error={shown.department}>
              <input
                {...fieldProps('department')}
                value={form.department}
                maxLength={LIMITS.department}
                onChange={(e) => set('department', e.target.value)}
                placeholder="e.g. Computer Engineering"
              />
            </Field>
            <Field id={id('author')} label="Posted by" error={shown.author}>
              <input
                {...fieldProps('author')}
                value={form.author}
                maxLength={LIMITS.author}
                onChange={(e) => set('author', e.target.value)}
                placeholder="e.g. Class Representative"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id={id('publishedDate')} label="Publishing date" error={shown.publishedDate}>
              <input
                type="date"
                {...fieldProps('publishedDate')}
                value={form.publishedDate}
                max={toDateInput(now)}
                onChange={(e) => set('publishedDate', e.target.value)}
              />
            </Field>
            <div>
              <Field
                id={id('deadlineDate')}
                label={form.category === 'Events' ? 'Event date & time' : 'Deadline'}
                error={shown.deadlineDate}
                hint="Time defaults to 11:59 PM if left empty."
                optional
              >
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="date"
                    {...fieldProps('deadlineDate', true)}
                    value={form.deadlineDate}
                    min={form.publishedDate || undefined}
                    onChange={(e) => set('deadlineDate', e.target.value)}
                  />
                  <input
                    type="time"
                    aria-label="Deadline time"
                    value={form.deadlineTime}
                    onChange={(e) => set('deadlineTime', e.target.value)}
                    className={`${inputBox} ${shown.deadlineDate ? inputError : inputOk} w-[7.5rem]`}
                  />
                </div>
              </Field>
              {(form.deadlineDate || form.deadlineTime) && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, deadlineDate: '', deadlineTime: '' }))}
                  className="mt-1 text-xs font-medium text-accent-text hover:underline"
                >
                  Remove deadline
                </button>
              )}
            </div>
          </div>

          <fieldset className="rounded-2xl border border-line p-4">
            <legend className="px-1.5 text-sm font-medium text-ink">
              Action link <span className="text-xs font-normal text-ink-muted">Optional</span>
            </legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_3fr]">
              <Field id={id('linkLabel')} label="Button label" error={shown.linkLabel}>
                <input
                  {...fieldProps('linkLabel')}
                  value={form.linkLabel}
                  maxLength={LIMITS.linkLabel}
                  onChange={(e) => set('linkLabel', e.target.value)}
                  placeholder="e.g. Submission form"
                />
              </Field>
              <Field id={id('linkUrl')} label="Link address" error={shown.linkUrl}>
                <input
                  type="url"
                  inputMode="url"
                  {...fieldProps('linkUrl')}
                  value={form.linkUrl}
                  maxLength={LIMITS.linkUrl}
                  onChange={(e) => set('linkUrl', e.target.value)}
                  placeholder="https://"
                  autoComplete="url"
                />
              </Field>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <HardDrive className="h-3.5 w-3.5" aria-hidden />
            Saved only in this browser
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={`${btn.secondary} flex-1 sm:flex-none`}>
              Cancel
            </button>
            <button type="submit" className={`${btn.primary} flex-1 sm:flex-none`}>
              {editing ? 'Save changes' : 'Publish notice'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
