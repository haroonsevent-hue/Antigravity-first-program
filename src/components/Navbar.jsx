'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/logo.png';

export default function Navbar({ scrollTo, theme, toggleTheme }) {
  const [scrolled, setScrolled]        = useState(false);
  const [pastHero, setPastHero]         = useState(false);
  const [mobile, setMobile]            = useState(false);
  const [activeSection, setActive]     = useState('home');
  const [indicatorStyle, setIndicator] = useState({ left: 0, width: 0 });
  const [hoveredId, setHovered]        = useState(null);
  const linksRef   = useRef({});
  const pillTrack  = useRef(null);

  const links = [
    { name: 'Home',     id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Gallery',  id: 'gallery' },
    { name: 'Reviews',  id: 'reviews-section' },
    { name: 'Contact',  id: 'contact' },
    { name: 'Social',   id: 'socials' },
  ];

  /* scroll tracking */
  useEffect(() => {
    const onScroll = () => {
      const heroEl = document.getElementById('home');
      const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : window.innerHeight;
      setScrolled(window.scrollY > 60);
      setPastHero(window.scrollY > heroBottom - 120);
      const sections = ['home','services','gallery','reviews-section','contact','socials'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 200) { setActive(sections[i]); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* eyeline indicator position */
  useEffect(() => {
    const targetId = hoveredId || activeSection;
    const el   = linksRef.current[targetId];
    const pill = pillTrack.current;
    if (el && pill) {
      const er = el.getBoundingClientRect();
      const pr = pill.getBoundingClientRect();
      setIndicator({ left: er.left - pr.left, width: er.width });
    }
  }, [activeSection, hoveredId]);

  return (
    <>
      {/* ── Centered floating island ── */}
      <div
        id="navbar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: scrolled ? '10px 0' : '18px 0',
          transition: 'padding 0.5s ease',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ y: -80, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: pastHero
              ? 'linear-gradient(135deg,rgba(6,18,12,0.88),rgba(8,28,18,0.82))'
              : 'transparent',
            backdropFilter: pastHero ? 'blur(28px) saturate(1.5)' : 'none',
            border: `1px solid ${pastHero ? 'rgba(197,160,89,0.22)' : 'rgba(197,160,89,0.10)'}`,
            borderRadius: 100,
            padding: '7px 10px 7px 10px',
            boxShadow: pastHero
              ? '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(197,160,89,0.08), 0 0 60px rgba(197,160,89,0.04)'
              : 'none',
            pointerEvents: 'auto',
            transition: 'background 0.6s ease, backdrop-filter 0.6s ease, box-shadow 0.6s ease, border-color 0.6s ease',
          }}
        >

          {/* ── Logo ── */}
          <button
            onClick={() => scrollTo('home')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', padding: '4px 14px 4px 6px',
              cursor: 'none', flexShrink: 0,
              borderRight: '1px solid rgba(197,160,89,0.15)',
              marginRight: 4,
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={logoImage.src}
                alt="Haroon's Weddings & Events"
                onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid rgba(197,160,89,0.5)', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                display: 'none', width: 34, height: 34, borderRadius: '50%',
                border: '1.5px solid rgba(197,160,89,0.5)',
                background: 'linear-gradient(135deg,rgba(22,51,40,0.9),rgba(8,34,20,0.95))',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontSize: 15, color: 'var(--gold)',
              }}>H</div>
              {/* pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1px solid rgba(197,160,89,0.3)', pointerEvents: 'none' }}
              />
            </div>
            <div style={{ lineHeight: 1, display: 'flex', flexDirection: 'column', gap: 3 }} className="logo-text">
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '0.22em', color: 'var(--white)', whiteSpace: 'nowrap' }}>HAROON'S</span>
              <span style={{ fontSize: 7, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', opacity: 0.75, whiteSpace: 'nowrap' }}>Weddings & Events</span>
            </div>
          </button>

          {/* ── Eyeline pill track (desktop) ── */}
          <div
            ref={pillTrack}
            className="nav-links-desktop"
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: 0,
            }}
          >
            {/* sliding indicator */}
            <motion.div
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: 'spring', stiffness: 400, damping: 36, mass: 0.75 }}
              style={{
                position: 'absolute', top: 0, bottom: 0,
                borderRadius: 100,
                background: 'linear-gradient(135deg,rgba(197,160,89,0.20),rgba(197,160,89,0.09))',
                border: '1px solid rgba(197,160,89,0.32)',
                boxShadow: '0 0 16px rgba(197,160,89,0.2), inset 0 1px 0 rgba(255,255,255,0.07)',
                pointerEvents: 'none', zIndex: 0,
              }}
            />

            {links.map(link => (
              <button
                key={link.id}
                ref={el => { linksRef.current[link.id] = el; }}
                onClick={() => scrollTo(link.id)}
                onMouseEnter={() => setHovered(link.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', zIndex: 1,
                  fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                  fontFamily: 'inherit', fontWeight: 500,
                  color: (hoveredId || activeSection) === link.id
                    ? '#d4a843'
                    : 'rgba(255,255,255,0.52)',
                  background: 'none', border: 'none',
                  padding: '8px 15px', borderRadius: 100,
                  transition: 'color 0.22s ease',
                  cursor: 'none', whiteSpace: 'nowrap',
                }}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* ── Enquire CTA ── */}
          <motion.button
            onClick={() => scrollTo('contact')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 28px rgba(197,160,89,0.45)' }}
            whileTap={{ scale: 0.95 }}
            className="nav-enquire"
            style={{
              fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#0a1a10', background: 'linear-gradient(135deg,#c5a059,#e0c070)',
              border: 'none', padding: '9px 20px', borderRadius: 100,
              marginLeft: 6, cursor: 'none', flexShrink: 0,
              boxShadow: '0 2px 14px rgba(197,160,89,0.22)',
              transition: 'background 0.3s ease',
            }}
          >
            Enquire
          </motion.button>

          {/* ── Theme Toggle ── */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.12, rotate: 18 }}
            whileTap={{ scale: 0.88 }}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(197,160,89,0.18)',
              color: 'var(--gold)',
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'none', marginLeft: 4, flexShrink: 0,
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </motion.button>

          {/* ── Mobile hamburger ── */}
          <motion.button
            onClick={() => setMobile(!mobile)}
            whileTap={{ scale: 0.88 }}
            className="nav-hamburger"
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.18)',
              color: 'var(--white)', padding: 7, borderRadius: 10,
              alignItems: 'center', justifyContent: 'center', cursor: 'none', marginLeft: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {mobile ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></>
              )}
            </svg>
          </motion.button>

        </motion.div>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 72, left: '50%', zIndex: 899,
              transform: 'translateX(-50%)',
              width: 'min(340px, calc(100vw - 32px))',
              background: 'linear-gradient(135deg,rgba(6,18,12,0.95),rgba(8,28,18,0.90))',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(197,160,89,0.2)',
              borderRadius: 20,
              padding: '14px 14px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(197,160,89,0.05)',
            }}
          >
            {links.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { scrollTo(link.id); setMobile(false); }}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: activeSection === link.id ? '#d4a843' : 'rgba(255,255,255,0.6)',
                  background: activeSection === link.id ? 'rgba(197,160,89,0.09)' : 'none',
                  border: 'none', borderRadius: 10, padding: '12px 14px',
                  transition: 'all 0.22s ease', cursor: 'none',
                }}
              >
                <span>{link.name}</span>
                {activeSection === link.id && (
                  <motion.div layoutId="mob-dot"
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#d4a843' }}
                  />
                )}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              onClick={() => { scrollTo('contact'); setMobile(false); }}
              style={{
                marginTop: 10, width: '100%', padding: '13px',
                fontFamily: 'Cinzel, serif', fontSize: 9.5, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: '#0a1a10',
                background: 'linear-gradient(135deg,#c5a059,#e0c070)',
                border: 'none', borderRadius: 12, cursor: 'none',
                boxShadow: '0 4px 18px rgba(197,160,89,0.25)',
              }}
            >
              Make an Enquiry →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 820px) {
          .nav-links-desktop { display: none !important; }
          .nav-enquire       { display: none !important; }
          .nav-hamburger     { display: flex !important; }
          .logo-text         { display: none !important; }
        }
      `}</style>
    </>
  );
}
