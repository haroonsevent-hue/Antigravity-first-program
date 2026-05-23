import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ADMIN_URL = 'http://localhost:3001/admin';

/**
 * Floating shield button — opens the backend-served Admin Panel.
 * All upload / gallery / hero logic now lives exclusively in the
 * Express backend at GET /admin (index.js).
 *
 * Keyboard shortcut: Ctrl + Shift + H
 */
export default function AdminPanel() {
  const [hover, setHover] = useState(false);

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

  return (
    <motion.a
      id="admin-trigger-btn"
      href={ADMIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      animate={{ opacity: hover ? 1 : 0.28 }}
      transition={{ duration: 0.3 }}
      title="Admin Panel (Ctrl+Shift+H)"
      style={{
        position: 'fixed', bottom: 32, left: 32, zIndex: 8001,
        width: 44, height: 44, borderRadius: '50%',
        background: hover ? 'rgba(197,160,89,0.18)' : 'rgba(197,160,89,0.06)',
        border: '1px solid rgba(197,160,89,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        transform: hover ? 'translateY(-3px)' : 'none',
        textDecoration: 'none',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={hover ? '#C5A059' : 'rgba(197,160,89,0.7)'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </motion.a>
  );
}
