import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function Counter({ target, suffix, label }) {
  const [count, setCount]   = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  /* Use native IntersectionObserver — more reliable than useInView */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Count-up animation */
  useEffect(() => {
    if (!active) return;
    let frame;
    const duration = 2000; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setCount(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', textAlign: 'center' }}
    >
      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: -20, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197,160,89,0.12), transparent 70%)',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }} />

      {/* Number */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={active ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          /* Use a numeric-safe font with tabular lining figures */
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 200,
          fontSize: 'clamp(52px, 6.5vw, 84px)',
          lineHeight: 1,
          color: 'var(--gold)',
          position: 'relative',
          fontVariantNumeric: 'lining-nums tabular-nums',
          letterSpacing: '-0.02em',
          /* Prevent any ligatures or glyph substitution */
          fontFeatureSettings: '"kern" 1, "liga" 0',
        }}
      >
        {count}
        <span style={{
          fontFamily: '"Cinzel", serif',
          fontSize: '0.38em',
          fontWeight: 400,
          color: 'var(--gold-dk)',
          verticalAlign: 'super',
          letterSpacing: '0.04em',
          marginLeft: 2,
        }}>
          {suffix}
        </span>
      </motion.div>

      {/* Gold rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          height: 1,
          background: 'linear-gradient(to right, transparent, var(--gold), transparent)',
          margin: '18px auto',
          width: 56,
          transformOrigin: 'center',
        }}
      />

      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          fontSize: 10,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        {label}
      </motion.div>
    </div>
  );
}

const stats = [
  { target: 10,  suffix: 'M+', label: 'Happy Guests' },
  { target: 1,   suffix: 'M+', label: 'Customers Served' },
  { target: 35,  suffix: '+',  label: 'Years of Excellence' },
  { target: 50,  suffix: '+',  label: 'Awards Won' },
];

export default function Stats() {
  return (
    <div style={{
      padding: '120px 0',
      background: 'linear-gradient(135deg, var(--green2) 0%, var(--green3) 50%, var(--green4) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-30%', left: '10%', width: '40%', height: '160%', background: 'radial-gradient(circle, rgba(197,160,89,0.03), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '-30%', right: '10%', width: '40%', height: '160%', background: 'radial-gradient(circle, rgba(197,160,89,0.02), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="stats-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 60px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, position: 'relative', zIndex: 1 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <Counter {...s} />
            {i < stats.length - 1 && (
              <div style={{ position: 'absolute', right: 0, top: '15%', bottom: '15%', width: 1, background: 'linear-gradient(to bottom, transparent, rgba(197,160,89,0.12), transparent)' }} />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .stats-grid { grid-template-columns: 1fr !important; padding: 0 24px !important; }
        }
      `}</style>
    </div>
  );
}
