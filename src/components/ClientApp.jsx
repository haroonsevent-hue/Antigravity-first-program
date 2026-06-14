'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

import Cursor         from './Cursor';
import Loader         from './Loader';
import Navbar         from './Navbar';
import Hero           from './Hero';
import About          from './About';
import Marquee        from './Marquee';
import Services       from './Services';
import Gallery        from './Gallery';
import Stats          from './Stats';
import Process        from './Process';
import Reviews        from './Reviews';
import Contact        from './Contact';
import Footer         from './Footer';
import SectionDivider from './SectionDivider';
import AdminPanel     from './AdminPanel';
import BackToTop      from './BackToTop';

export default function ClientApp() {
  const [loaded, setLoaded] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  /* ── Theme management ── */
  const toggleTheme = useCallback(() => {
    setTheme(p => {
      const next = p === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /* ── Fetch custom hero image from backend on mount ── */
  useEffect(() => {
    fetch('/api/hero-image')
      .then(r => r.json())
      .then(d => {
        if (d.url) setHeroImageUrl(d.url);
      })
      .catch(() => {}); // silently fall back to default if backend is offline
  }, []);

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    if (!loaded) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [loaded]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Film grain overlay */}
      <div className="noise-overlay" />

      {/* Premium cursor */}
      <Cursor />

      {/* Cinematic loader */}
      <AnimatePresence mode="wait">
        {!loaded && <Loader key="loader" onDone={() => setLoaded(true)} />}
      </AnimatePresence>

      {/* Admin panel — always mounted, triggered by Ctrl+Shift+H */}
      <AdminPanel onHeroImageChange={setHeroImageUrl} />

      {/* Back to top button — always mounted */}
      <BackToTop scrollTo={scrollTo} />

      {/* Main site — fades in after loader */}
      <AnimatePresence>
        {loaded && (
          <motion.div
            key="site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Navbar   scrollTo={scrollTo} theme={theme} toggleTheme={toggleTheme} />

            {/* ── HERO ─────────────────────────────── */}
            <Hero     scrollTo={scrollTo} heroImageUrl={heroImageUrl} />

            {/* Hero → About: Marquee ticker band */}
            <Marquee />

            {/* ── ABOUT ────────────────────────────── */}
            <About />

            {/* About → Services */}
            <SectionDivider fromColor="var(--green)" toColor="var(--green2)" variant="wave" height={70} />

            {/* ── SERVICES ─────────────────────────── */}
            <Services scrollTo={scrollTo} />

            {/* Services → Gallery  (services bg → gallery bg) */}
            <SectionDivider fromColor="var(--green2)" toColor="var(--green)" variant="double" height={90} />

            {/* ── GALLERY ──────────────────────────── */}
            <Gallery />

            {/* Gallery → Stats  (gallery → gradient start) */}
            <SectionDivider fromColor="var(--green)" toColor="var(--green2)" variant="arc" height={80} />

            {/* ── STATS ────────────────────────────── */}
            <Stats />

            {/* Stats → Process */}
            <SectionDivider fromColor="var(--green4)" toColor="var(--green)" variant="wave" height={90} />

            {/* ── PROCESS ──────────────────────────── */}
            <Process />

            {/* Process → Reviews */}
            <SectionDivider fromColor="var(--green)" toColor="var(--green2)" variant="tilt" height={70} flip />

            {/* ── REVIEWS ──────────────────────────── */}
            <Reviews />

            {/* Reviews → Contact */}
            <SectionDivider fromColor="var(--green2)" toColor="var(--green)" variant="double" height={90} />

            {/* ── CONTACT ──────────────────────────── */}
            <Contact />

            {/* Contact → Footer */}
            <SectionDivider fromColor="var(--green)" toColor="var(--footer-bg)" variant="wave" height={70} flip />

            <Footer   scrollTo={scrollTo} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
