const { useEffect, useMemo, useRef, useState } = React;

/** Utilities */
const API_URL = ""; // Not used in demo mode

const classNames = (...xs) => xs.filter(Boolean).join(' ');
const currency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));
const toISODate = (d = new Date()) => new Date(d).toISOString().slice(0, 10);

function useHotkey(key, handler) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === key.toLowerCase() && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler]);
}

/** Helpers for demo dates */
const d = (daysAgo) => toISODate(new Date(Date.now() - daysAgo * 86400000));
