import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/logo.png';

export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | reveal | done

  useEffect(() => {
    let v = 0;
    const speed = () => Math.random() * (v > 70 ? 1.5 : v > 40 ? 4 : 8) + 0.5;
    const id = setInterval(() => {
      v = Math.min(v + speed(), 100);
      setPct(Math.floor(v));
      if (v >= 100) {
        clearInterval(id);
        setTimeout(() => setPhase('reveal'), 400);
        setTimeout(() => { setPhase('done'); setTimeout(onDone, 100); }, 1600);
      }
    }, 60);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="loader-screen"
          style={{ background: '#030a05', overflow: 'hidden', position: 'fixed', inset: 0, zIndex: 99999 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Curtain panels */}
          <motion.div
            style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: '#030a05', originX: 0, zIndex: 10 }}
            animate={phase === 'reveal' ? { scaleX: 0 } : { scaleX: 1 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: '#030a05', originX: 1, zIndex: 10 }}
            animate={phase === 'reveal' ? { scaleX: 0 } : { scaleX: 1 }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          />

          {/* Ambient glow */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: '70vw', height: '70vw',
              background: 'radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 70%)',
              filter: 'blur(80px)',
              zIndex: 0
            }}
          />

          {/* Horizontal scan line */}
          <motion.div
            animate={{ y: ['0vh', '100vh'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
            style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, rgba(197,160,89,0.3), transparent)', zIndex: 5 }}
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}
          >
            {/* Logo ring */}
            <div style={{ position: 'relative', marginBottom: 40 }}>
              {/* Outer rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: -12,
                  borderRadius: '50%',
                  border: '1px solid transparent',
                  borderTopColor: 'rgba(197,160,89,0.3)',
                  borderRightColor: 'rgba(197,160,89,0.1)',
                }}
              />
              {/* Inner pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  position: 'absolute', inset: -4,
                  borderRadius: '50%',
                  border: '1px solid rgba(197,160,89,0.2)',
                }}
              />
              <div className="loader-logo-ring">
                <motion.img
                  src={logoImage}
                  alt="Haroon's Logo"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="loader-h"
                  style={{ display: 'none' }}
                >
                  H
                </motion.span>
              </div>
            </div>

            {/* Brand name with stagger */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              style={{ textAlign: 'center', marginBottom: 48 }}
            >
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: '0.5em', color: 'var(--gold)', marginBottom: 6 }}>
                HAROON'S
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.4em', color: 'rgba(197,160,89,0.4)', textTransform: 'uppercase' }}>
                Weddings & Events
              </div>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
            >
              {/* Track */}
              <div style={{ width: 260, height: 1, background: 'rgba(197,160,89,0.08)', position: 'relative', overflow: 'visible' }}>
                {/* Fill */}
                <div className="loader-progress-fill" style={{ width: `${pct}%`, height: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', width: 260 }}>
                <span className="loader-percent" style={{ fontSize: 11 }}>
                  {String(pct).padStart(3, '0')}
                </span>
                <span className="loader-tagline">Est. 1990 · Kerala</span>
              </div>
            </motion.div>

            {/* Loading text */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginTop: 32, fontSize: 9, letterSpacing: '0.35em', color: 'rgba(197,160,89,0.3)', textTransform: 'uppercase' }}
            >
              Preparing your experience
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
