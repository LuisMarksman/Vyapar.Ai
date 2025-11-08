/* UI Primitives */
function Badge({ children, className }) {
  return <span className={classNames('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border', className)}>{children}</span>;
}

function Card({ children, className }) {
  return <div className={classNames('bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-sm p-4 md:p-5', className)}>{children}</div>;
}

function Button({ children, className, onClick, type = 'button', disabled, ariaLabel, variant = 'primary' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100',
    outline: 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
  };
  return (
    <button type={type} aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={classNames(base, variants[variant] || variants.outline, className)}>
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return <input {...props} className={classNames('w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all', className)} />;
}

function Select({ className, children, ...props }) {
  return <select {...props} className={classNames('w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all', className)}>{children}</select>;
}

function Empty({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 p-12 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl">
      <div className="text-4xl mb-2">📭</div>
      <div className="text-base font-semibold">{title}</div>
      <div className="text-sm text-neutral-500 max-w-xs">{hint}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
