import './App.css';
import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

import Cursor   from './components/Cursor';
import Loader   from './components/Loader';
import Navbar   from './components/Navbar';
import Hero     from './components/Hero';
import Marquee  from './components/Marquee';
import Services from './components/Services';
import Gallery  from './components/Gallery';
import Stats    from './components/Stats';
import Process  from './components/Process';
import Reviews  from './components/Reviews';
import Contact  from './components/Contact';
import Footer          from './components/Footer';
import SectionDivider  from './components/SectionDivider';
import AdminPanel      from './components/AdminPanel';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState(null);

  /* ── Fetch custom hero image from backend on mount ── */
  useEffect(() => {
    fetch('http://localhost:3001/api/hero-image')
      .then(r => r.json())
      .then(d => {
        if (d.url) setHeroImageUrl(`http://localhost:3001${d.url}`);
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

      {/* Admin panel — always mounted, triggered by Shift+Ctrl+A */}
      <AdminPanel onHeroImageChange={setHeroImageUrl} />

      {/* Main site — fades in after loader */}
      <AnimatePresence>
        {loaded && (
          <motion.div
            key="site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Navbar   scrollTo={scrollTo} />

            {/* ── HERO ─────────────────────────────── */}
            <Hero     scrollTo={scrollTo} heroImageUrl={heroImageUrl} />

            {/* Hero → Marquee  (dark green → deep green) */}
            <SectionDivider fromColor="#060f0a" toColor="#060d08" variant="wave" height={80} />

            <Marquee />

            {/* Marquee → Services  (marquee bg → slightly lighter) */}
            <SectionDivider fromColor="#060d08" toColor="#0a1a12" variant="tilt" height={70} />

            {/* ── SERVICES ─────────────────────────── */}
            <Services scrollTo={scrollTo} />

            {/* Services → Gallery  (services bg → gallery bg) */}
            <SectionDivider fromColor="#0a1a12" toColor="#080f0b" variant="double" height={90} />

            {/* ── GALLERY ──────────────────────────── */}
            <Gallery />

            {/* Gallery → Stats  (gallery → gradient start) */}
            <SectionDivider fromColor="#080f0b" toColor="#0a1a12" variant="arc" height={80} />

            {/* ── STATS ────────────────────────────── */}
            <Stats />

            {/* Stats → Process */}
            <SectionDivider fromColor="#122b1e" toColor="#080f0b" variant="wave" height={90} />

            {/* ── PROCESS ──────────────────────────── */}
            <Process />

            {/* Process → Reviews */}
            <SectionDivider fromColor="#080f0b" toColor="#0a1a12" variant="tilt" height={70} flip />

            {/* ── REVIEWS ──────────────────────────── */}
            <Reviews />

            {/* Reviews → Contact */}
            <SectionDivider fromColor="#0a1a12" toColor="#080f0b" variant="double" height={90} />

            {/* ── CONTACT ──────────────────────────── */}
            <Contact />

            {/* Contact → Footer */}
            <SectionDivider fromColor="#080f0b" toColor="#060d08" variant="wave" height={70} flip />

            <Footer   scrollTo={scrollTo} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}