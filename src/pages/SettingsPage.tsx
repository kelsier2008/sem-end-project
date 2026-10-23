import type { ReactNode } from 'react';
import { CircleCheck, Keyboard, Moon, Palette, RotateCcw, ShieldAlert, Sun, TriangleAlert, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { STORAGE_KEY } from '../state/storage';
import { useNotices } from '../state/useNotices';
import { useUI } from '../state/ui';
import { btn, card } from '../styles';
import { plural } from '../utils';

function Panel({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className={`${card} p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text">{icon}</span>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SettingsPage({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const { notices, storageAvailable, storageWarning, resetToDemo } = useNotices();
  const { confirm, notify } = useUI();
  const mine = notices.filter((n) => n.isUserCreated).length;
  const starred = notices.filter((n) => n.isStarred).length;

  const reset = () =>
    confirm({
      title: 'Reset to demo data?',
      message: `This replaces every notice with the original sample set.${
        mine ? ` The ${plural(mine, 'notice')} you added will be deleted.` : ''
      } Your read and star choices will also be cleared. This can’t be undone.`,
      confirmLabel: 'Reset data',
      onConfirm: () => {
        resetToDemo();
        notify('Demo data restored');
      },
    });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" subtitle="Appearance, your saved data, and how this prototype works." />

      <Panel icon={<Palette className="h-[18px] w-[18px]" aria-hidden />} title="Appearance" description="Choose how CampusBoard looks on this device.">
        <div role="group" aria-label="Theme" className="inline-flex rounded-xl border border-line bg-raised p-1">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={theme === t}
              onClick={() => theme !== t && onToggleTheme()}
              className={`inline-flex h-9 items-center gap-2 rounded-[10px] px-4 text-sm font-medium capitalize transition duration-150 ${
                theme === t ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {t === 'light' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
              {t}
            </button>
          ))}
        </div>
      </Panel>

      <Panel
        icon={<RotateCcw className="h-[18px] w-[18px]" aria-hidden />}
        title="Your data"
        description="Where your notices, read status and stars are kept."
      >
        <div className="space-y-4">
          {storageAvailable ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <CircleCheck className="h-4 w-4" aria-hidden />
              Changes are saved automatically in this browser.
            </p>
          ) : (
            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              This browser is blocking storage, so changes last only until you close or reload this tab.
            </p>
          )}
          {storageWarning && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {storageWarning}
            </p>
          )}

          <p className="text-sm leading-relaxed text-ink-soft">
            CampusBoard stores everything with your browser’s <code className="rounded bg-raised px-1.5 py-0.5 text-[13px]">localStorage</code> under
            the key <code className="rounded bg-raised px-1.5 py-0.5 text-[13px]">{STORAGE_KEY}</code>. That data belongs to this browser on this
            device only. It isn’t shared with classmates, other browsers or other devices, and clearing your browsing data removes it.
          </p>

          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-center">
            {[
              ['Notices', notices.length],
              ['Added by you', mine],
              ['Starred', starred],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col-reverse bg-surface px-3 py-3">
                <dt className="text-xs text-ink-muted">{label}</dt>
                <dd className="text-xl font-bold tabular-nums text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-3 rounded-xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Reset to demo data</p>
              <p className="mt-0.5 text-sm text-ink-muted">Restore the original sample notices and clear your changes.</p>
            </div>
            <button type="button" onClick={reset} className={`${btn.dangerOutline} shrink-0`}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset data
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        icon={<Users className="h-[18px] w-[18px]" aria-hidden />}
        title="About this prototype"
        description="What CampusBoard does and doesn’t do yet."
      >
        <ul className="space-y-3 text-sm leading-relaxed text-ink-soft">
          <li className="flex gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <span>
              <strong className="font-semibold text-ink">No accounts or roles.</strong> Anyone using this browser can add notices. You can edit
              and delete only the notices added here; the sample notices are read-only.
            </span>
          </li>
          <li className="flex gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <span>
              <strong className="font-semibold text-ink">Not real-time.</strong> Notices you add are not sent to other students. Each person sees
              only what is saved in their own browser.
            </span>
          </li>
          <li className="flex gap-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
            <span>
              <strong className="font-semibold text-ink">Sample content is fictional.</strong> Departments and roles are examples, and links in
              sample notices point to placeholder pages on example.com, not real portals.
            </span>
          </li>
        </ul>
      </Panel>

      <Panel icon={<Keyboard className="h-[18px] w-[18px]" aria-hidden />} title="Keyboard shortcuts" description="Move faster without the mouse.">
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          {[
            ['/', 'Search notices'],
            ['N', 'Add a notice'],
            ['Esc', 'Close a dialog or menu'],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
              <dt>
                <kbd className="inline-grid min-w-8 place-items-center rounded-md border border-line-strong bg-raised px-1.5 py-0.5 text-xs font-semibold text-ink">
                  {key}
                </kbd>
              </dt>
              <dd className="text-ink-soft">{label}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
