'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Social links data ─────────────────────────────────────────── */
const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/haroons_weddings/?hl=en',
    color: '#E1306C',
    glow: 'rgba(225,48,108,0.35)',
    icon: 'instagram',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/p/Haroons-weddings-events-100063703044091/',
    color: '#1877F2',
    glow: 'rgba(24,119,242,0.35)',
    icon: 'facebook',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UC5XX2UPV5JB6wIaPxrPlMbg',
    color: '#FF0000',
    glow: 'rgba(255,0,0,0.35)',
    icon: 'youtube',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/919037874001',
    color: '#25D366',
    glow: 'rgba(37,211,102,0.35)',
    icon: 'whatsapp',
  },
];

function IconSvg({ name }) {
  if (name === 'instagram') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
  if (name === 'facebook') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
  if (name === 'youtube') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
  if (name === 'whatsapp') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
  return null;
}

/* ─── Single social icon button ─────────────────────────────────── */
function SocialButton({ social, index }) {
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 400);
  };

  return (
    <motion.div
      className="social-panel-item"
      initial={{ opacity: 0, x: 60, scale: 0.6 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.6 }}
      transition={{
        delay: index * 0.07,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
    >
      {/* Label tooltip - only desktop */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="social-panel-tooltip"
            initial={{ opacity: 0, x: 8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              right: 'calc(100% + 12px)',
              whiteSpace: 'nowrap',
              fontSize: 10,
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: social.color,
              background: 'rgba(8,15,11,0.92)',
              border: '1px solid ' + social.color + '33',
              padding: '5px 12px',
              borderRadius: 3,
              pointerEvents: 'none',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 12px ' + social.glow,
            }}
          >
            {social.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Icon button */}
      <motion.a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={handleTap}
        onClick={handleTap}
        animate={{
          scale: tapped ? 0.82 : hovered ? 1.12 : 1,
        }}
        transition={{ duration: tapped ? 0.1 : 0.25, ease: 'easeOut' }}
        style={{
          width: 46,
          height: 46,
          borderRadius: 6,
          border: '1px solid ' + (hovered ? social.color : 'rgba(197,160,89,0.22)'),
          background: hovered ? social.color + '1a' : 'rgba(8,15,11,0.78)',
          color: hovered ? social.color : 'rgba(197,160,89,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          cursor: 'pointer',
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s',
          boxShadow: hovered
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 18px ' + social.glow
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <IconSvg name={social.icon} />
      </motion.a>
    </motion.div>
  );
}

/* ─── Main panel ────────────────────────────────────────────────── */
export default function SocialPanel() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getThreshold = () =>
      typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;

    const onScroll = () => {
      setVisible(window.scrollY > getThreshold());
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div
        className="social-panel-wrap"
        aria-label="Social Media Links"
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          padding: '14px 16px 14px 0',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <AnimatePresence>
          {visible &&
            SOCIALS.map((social, i) => (
              <SocialButton key={social.label} social={social} index={i} />
            ))}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .social-panel-wrap {
            right: 0 !important;
            padding: 8px 10px 8px 0 !important;
            gap: 8px !important;
          }
          .social-panel-item a {
            width: 44px !important;
            height: 44px !important;
          }
          .social-panel-tooltip {
            display: none !important;
          }
        }
        @media (max-width: 400px) {
          .social-panel-wrap {
            gap: 6px !important;
            padding: 6px 8px 6px 0 !important;
          }
          .social-panel-item a {
            width: 40px !important;
            height: 40px !important;
          }
        }
      `}</style>
    </>
  );
}
