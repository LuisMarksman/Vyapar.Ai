function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">✕</button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto">{children}</div>
        {footer && <div className="p-4 md:p-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50/50 dark:bg-neutral-950/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
