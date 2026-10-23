/** Graduation cap with broadcast waves: campus + announcements. */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="11" fill="#7B39FC" />
      <path d="M27 9a4 4 0 0 1 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M27 4.5a8.5 8.5 0 0 1 8.5 8.5" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M5 20 17 14.5 29 20 17 25.5Z" fill="#fff" />
      <path d="M10.5 23v4.6c0 1.9 2.9 3.6 6.5 3.6s6.5-1.7 6.5-3.6V23L17 26Z" fill="#fff" fillOpacity="0.78" />
      <path d="M27 21v5.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="27" cy="28" r="1.7" fill="#fff" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[17px] font-bold tracking-tight text-ink ${className}`}>
      Campus<span className="text-brand-500">Board</span>
    </span>
  );
}
