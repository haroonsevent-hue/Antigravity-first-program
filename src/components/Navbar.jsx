import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/logo.png';

export default function Navbar({ scrollTo, theme, toggleTheme }) {
  const [scrolled, setScrolled]   = useState(false);
  const [mobile, setMobile]       = useState(false);
  const [activeSection, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      // Determine active section
      const sections = ['home','services','gallery','reviews-section','contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'Home',     id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Gallery',  id: 'gallery' },
    { name: 'Reviews',  id: 'reviews-section' },
    { name: 'Contact',  id: 'contact' },
    { name: 'Social',   id: 'socials' },
  ];

  return (
    <>
      <motion.nav
        id="navbar"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
          padding: scrolled ? '14px 60px' : '24px 60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: scrolled ? 'var(--nav-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
          borderBottom: scrolled ? '1px solid var(--input-border)' : '1px solid transparent',
          transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => scrollTo('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', padding: 0 }}
        >
          <img
            src={logoImage}
            alt="Haroon's Weddings & Events"
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            style={{ width: 46, height: 46, borderRadius: '50%', border: '1.5px solid rgba(197,160,89,0.4)', objectFit: 'cover', transition: 'transform 0.4s ease', boxShadow: '0 0 20px rgba(197,160,89,0.1)' }}
          />
          <div style={{
            display: 'none', width: 46, height: 46, borderRadius: '50%',
            border: '1.5px solid rgba(197,160,89,0.45)',
            background: 'linear-gradient(135deg, rgba(22,51,40,0.8), rgba(8,34,20,0.9))',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif', fontSize: 19, color: 'var(--gold)',
          }}>
            H
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: '0.2em', color: 'var(--white)' }}>HAROON'S</div>
            <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', marginTop: 3, opacity: 0.8 }}>Weddings & Events</div>
          </div>
        </button>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="nav-links-desktop">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: activeSection === link.id ? 'var(--gold)' : 'var(--nav-link)',
                background: 'none', border: 'none',
                position: 'relative', paddingBottom: 4,
                transition: 'color 0.3s ease',
              }}
            >
              {link.name}
              {/* Active underline */}
              <motion.div
                animate={{ scaleX: activeSection === link.id ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--gold)', transformOrigin: 'left' }}
              />
            </button>
          ))}

          <motion.button
            onClick={() => scrollTo('contact')}
            whileHover={{ y: -2, boxShadow: '0 12px 36px rgba(197,160,89,0.35)' }}
            transition={{ duration: 0.25 }}
            style={{
              fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--green)', background: 'var(--gold)',
              border: 'none', padding: '11px 28px', borderRadius: 1,
              transition: 'background 0.3s ease',
            }}
          >
            Enquire
          </motion.button>

          {/* Theme Toggle Desktop */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.15, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gold)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </motion.button>
        </div>

        {/* Mobile controls (hamburger + theme toggle) */}
        <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: 18 }}>
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.85 }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gold)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </motion.button>

          <button
            onClick={() => setMobile(!mobile)}
            style={{ background: 'none', border: 'none', color: 'var(--white)', padding: 4 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobile ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="8" x2="21" y2="8"/>
                  <line x1="3" y1="16" x2="21" y2="16"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 70, left: 0, right: 0, zIndex: 899,
              background: 'var(--nav-mobile-bg)', backdropFilter: 'blur(24px)',
              borderBottom: '1px solid var(--input-border)',
              padding: '24px 32px',
            }}
          >
            {links.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => { scrollTo(link.id); setMobile(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--nav-mobile-link)', background: 'none', border: 'none',
                  padding: '14px 0', borderBottom: '1px solid var(--input-border)',
                }}
              >
                {link.name}
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => { scrollTo('contact'); setMobile(false); }}
              style={{
                marginTop: 20, width: '100%', padding: '14px',
                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--green)', background: 'var(--gold)',
                border: 'none', borderRadius: 1,
              }}
            >
              Make an Enquiry →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-controls { display: flex !important; }
          nav { padding: 18px 24px !important; }
        }
      `}</style>
    </>
  );
}
