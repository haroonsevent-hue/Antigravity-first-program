'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function Counter({ target, suffix, label }) {
  const [count, setCount]   = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

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
    return () => {
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Trigger spark burst when count finishes
  const triggerBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const arr = [];
    const countSparks = 35;
    for (let i = 0; i < countSparks; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.5;
      arr.push({
        x: centerX,
        y: centerY - 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8, // slight upward drift
        size: Math.random() * 1.8 + 0.8,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        color: Math.random() > 0.4 ? '#C5A059' : '#e2c98a'
      });
    }
    particlesRef.current = arr;

    const renderSparks = () => {
      const parts = particlesRef.current;
      if (parts.length === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.vx *= 0.95; // Drag/Friction
        p.vy *= 0.95;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          parts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.5)';
        ctx.fill();
        ctx.restore();
      }

      if (parts.length > 0) {
        animFrameRef.current = requestAnimationFrame(renderSparks);
      }
    };

    renderSparks();
  };

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
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setCount(target);
        triggerBurst();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', textAlign: 'center' }}
    >
      {/* Canvas for completion sparks */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: -40,
          width: 'calc(100% + 80px)',
          height: 'calc(100% + 80px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

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
          fontFamily: '"Cinzel", serif',
          fontWeight: 400,
          fontSize: 'clamp(52px, 6.5vw, 84px)',
          lineHeight: 1,
          color: 'var(--gold)',
          position: 'relative',
          letterSpacing: '0.02em',
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
          color: 'var(--text-dim)',
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
