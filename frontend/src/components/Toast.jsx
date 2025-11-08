function Toast({ toasts, setToasts }) {
  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => setToasts(v => v.filter(x => x.id !== t.id)), t.duration || 4000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, setToasts]);

  return ReactDOM.createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm px-4 md:px-0">
      {toasts.map(t => (
        <div key={t.id} className={classNames('p-4 rounded-lg shadow-lg border text-sm flex items-start gap-3 bg-white dark:bg-neutral-900', t.variant==='error'?'border-red-500/50 text-red-600 dark:text-red-400':t.variant==='success'?'border-emerald-500/50 text-emerald-600 dark:text-emerald-400':'border-neutral-200 dark:border-neutral-800')}>
          <div className="flex-1">
            <div className="font-semibold">{t.title}</div>
            <div className="text-neutral-600 dark:text-neutral-400">{t.message}</div>
          </div>
          <button onClick={() => setToasts(v => v.filter(x => x.id !== t.id))} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>
      ))}
    </div>,
    document.body
  );
}
