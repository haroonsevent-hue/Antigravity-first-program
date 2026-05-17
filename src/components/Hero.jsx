import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ── Particle canvas with aurora effect ── */
function AuroraCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0, raf;
    const particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * 1920, y: Math.random() * 1080,
        sx: (Math.random() - 0.5) * 0.25,
        sy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 1.8 + 0.3,
        life: Math.random() * 400,
        maxLife: Math.random() * 350 + 150,
        opacity: Math.random() * 0.6 + 0.1,
      });
    }

    function drawAurora() {
      const blobs = [
        { x: W * 0.15, y: H * 0.5,  r: W * 0.4,  c: 'rgba(197,160,89,0.035)' },
        { x: W * 0.85, y: H * 0.35, r: W * 0.35, c: 'rgba(22,51,40,0.7)' },
        { x: W * 0.5,  y: H * 0.85, r: W * 0.3,  c: 'rgba(197,160,89,0.02)' },
        { x: W * 0.5,  y: H * 0.5,  r: W * 0.6,  c: 'rgba(8,15,11,0.4)' },
      ];
      blobs.forEach(b => {
        const gx = b.x + Math.sin(t * 0.0006) * 80;
        const gy = b.y + Math.cos(t * 0.0005) * 50;
        const grad = ctx.createRadialGradient(gx, gy, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.c);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });
    }

    function frame() {
      t++;
      ctx.clearRect(0, 0, W, H);
      drawAurora();
      particles.forEach(p => {
        p.x += p.sx; p.y += p.sy; p.life++;
        if (p.life > p.maxLife || p.y < -10) { p.x = Math.random() * W; p.y = H + 10; p.life = 0; }
        const prog = p.life / p.maxLife;
        const a = p.opacity * (prog < 0.2 ? prog / 0.2 : prog > 0.8 ? (1 - prog) / 0.2 : 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197,160,89,${a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />;
}

/* ── Animated letter component ── */
function AnimLetter({ char, delay }) {
  return (
    <motion.span
      initial={{ y: '115%', opacity: 0 }}
      animate={{ y: '0%', opacity: 1 }}
      transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'inline-block' }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}

/* ── Mouse-parallax orbs ── */
function ParallaxOrbs({ mousePos }) {
  return (
    <>
      {[
        { size: 350, opacity: 0.06, color: '#C5A059', speed: 0.02, x: '20%', y: '30%' },
        { size: 500, opacity: 0.04, color: '#C5A059', speed: 0.015, x: '75%', y: '60%' },
        { size: 200, opacity: 0.08, color: '#e2c98a', speed: 0.03, x: '60%', y: '20%' },
      ].map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `calc(${orb.x} + ${(mousePos.x - 0.5) * orb.speed * -100}px)`,
            top:  `calc(${orb.y} + ${(mousePos.y - 0.5) * orb.speed * -100}px)`,
            width: orb.size, height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.8s ease, top 0.8s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}
    </>
  );
}

export default function Hero({ scrollTo }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 600], [0, 120]);
  const contentY = useTransform(scrollY, [0, 600], [0, -60]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const onMove = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const line1 = 'We Craft'.split('');
  const line2 = 'Timeless'.split('');
  const line3 = 'Moments'.split('');

  return (
    <section
      id="home"
      ref={heroRef}
      style={{ position: 'relative', height: '100vh', minHeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      {/* Base bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #020706 0%, #060f0a 45%, #08150f 100%)' }} />

      {/* Parallax hero image */}
      <motion.div
        style={{
          position: 'absolute', inset: '-10%',
          backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.15,
          y: imgY,
        }}
      />

      {/* Radial vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(3,7,5,0.85) 100%)', zIndex: 3 }} />

      {/* Mouse parallax orbs */}
      <ParallaxOrbs mousePos={mousePos} />

      {/* Aurora canvas */}
      <AuroraCanvas />

      {/* Decorative vertical lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, overflow: 'hidden' }}>
        {[18, 35, 65, 82].map((pct, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: `${pct}%`, top: 0, bottom: 0, width: 1,
              background: 'linear-gradient(to bottom, transparent, rgba(197,160,89,0.12), transparent)',
              animation: `linePulse ${3 + i * 0.5}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Corner accents */}
      {[
        { top: 60, left: 60 },
        { top: 60, right: 60 },
        { bottom: 60, left: 60 },
        { bottom: 60, right: 60 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 + i * 0.1, duration: 0.8 }}
          style={{
            position: 'absolute', ...pos, width: 30, height: 30, zIndex: 5, pointerEvents: 'none',
            borderTop: i < 2 ? '1px solid rgba(197,160,89,0.25)' : 'none',
            borderBottom: i >= 2 ? '1px solid rgba(197,160,89,0.25)' : 'none',
            borderLeft: i % 2 === 0 ? '1px solid rgba(197,160,89,0.25)' : 'none',
            borderRight: i % 2 === 1 ? '1px solid rgba(197,160,89,0.25)' : 'none',
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 1000, y: contentY, opacity }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 40 }}
        >
          <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, transparent, rgba(197,160,89,0.5))' }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.45em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            Since 1990 · Kerala's Premier Events Studio
          </span>
          <div style={{ width: 40, height: 1, background: 'linear-gradient(to left, transparent, rgba(197,160,89,0.5))' }} />
        </motion.div>

        {/* Animated title */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, lineHeight: 0.95, color: 'var(--white)', marginBottom: 0 }}>
          {/* Line 1 */}
          <div style={{ overflow: 'hidden', display: 'block', marginBottom: 4 }}>
            <div style={{ fontSize: 'clamp(56px, 10vw, 128px)', display: 'flex', justifyContent: 'center', gap: '0.01em' }}>
              {line1.map((c, i) => (
                <AnimLetter key={i} char={c} delay={0.5 + i * 0.04} />
              ))}
            </div>
          </div>

          {/* Line 2 italic gold */}
          <div style={{ overflow: 'hidden', display: 'block', marginBottom: 4 }}>
            <div style={{ fontSize: 'clamp(56px, 10vw, 128px)', display: 'flex', justifyContent: 'center', gap: '0.01em', fontStyle: 'italic', color: 'var(--gold)' }}>
              {line2.map((c, i) => (
                <AnimLetter key={i} char={c} delay={0.7 + i * 0.05} />
              ))}
            </div>
          </div>

          {/* Line 3 */}
          <div style={{ overflow: 'hidden', display: 'block' }}>
            <div style={{ fontSize: 'clamp(56px, 10vw, 128px)', display: 'flex', justifyContent: 'center', gap: '0.01em' }}>
              {line3.map((c, i) => (
                <AnimLetter key={i} char={c} delay={0.95 + i * 0.05} />
              ))}
            </div>
          </div>
        </h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: 1, background: 'linear-gradient(to right, transparent, var(--gold), transparent)', maxWidth: 120, margin: '36px auto' }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          style={{ fontSize: 15, letterSpacing: '0.04em', lineHeight: 1.9, color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto 52px' }}
        >
          Premium wedding and event management services, tailored to your vision and crafted with devotion.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button className="btn-primary" onClick={() => scrollTo('contact')}>
            <span>Begin Your Journey</span>
          </button>
          <button className="btn-outline" onClick={() => scrollTo('gallery')}>View Portfolio</button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 8, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Scroll</span>
        <div style={{ width: 1, height: 60, overflow: 'hidden', position: 'relative' }}>
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
            style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent, var(--gold), transparent)' }}
          />
        </div>
      </motion.div>

      {/* Floating rotating rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', right: '-8%', top: '10%', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(197,160,89,0.04)', pointerEvents: 'none', zIndex: 4 }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', left: '-10%', bottom: '5%', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(197,160,89,0.03)', pointerEvents: 'none', zIndex: 4 }}
      />
    </section>
  );
}
