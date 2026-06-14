'use client';
import { useEffect } from 'react';

const ADMIN_URL = 'http://localhost:3001/admin';

/**
 * Invisible admin access — no UI rendered.
 * Admin only: press Ctrl + Shift + H to open the Admin Panel in a new tab.
 */
export default function AdminPanel() {
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        window.open(ADMIN_URL, '_blank', 'noopener,noreferrer');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return null; // nothing rendered — admin accesses via Ctrl+Shift+H
}
