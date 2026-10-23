// Shared Tailwind class strings so buttons, inputs and cards look the same everywhere.
// Size and colour are kept separate: never add a second height/padding/colour on top of a preset,
// because two conflicting Tailwind classes resolve by stylesheet order, not by the order you write them.

export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition duration-150 disabled:pointer-events-none disabled:opacity-50';

export const btnTone = {
  primary: 'bg-brand-500 text-white shadow-brand hover:bg-brand-600 active:scale-[0.98]',
  secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-raised active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  dangerOutline:
    'border border-red-200 bg-surface text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10',
};

/** Standard 40px buttons. */
export const btn = {
  primary: `${btnBase} h-10 px-4 ${btnTone.primary}`,
  secondary: `${btnBase} h-10 px-4 ${btnTone.secondary}`,
  danger: `${btnBase} h-10 px-4 ${btnTone.danger}`,
  dangerOutline: `${btnBase} h-10 px-4 ${btnTone.dangerOutline}`,
};

export const iconBtnBase = 'inline-grid shrink-0 place-items-center rounded-xl transition duration-150';
export const iconBtn = `${iconBtnBase} h-9 w-9 text-ink-muted hover:bg-raised hover:text-ink`;

/** Input styling without a width, for fields that need a fixed size. */
export const inputBox =
  'rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition duration-150 placeholder:text-ink-muted/70 focus:ring-4';
export const input = `${inputBox} w-full`;

export const inputOk = 'border-line focus:border-brand-400 focus:ring-brand-500/15';
export const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-500/70';

export const card = 'rounded-2xl border border-line bg-surface shadow-card';
