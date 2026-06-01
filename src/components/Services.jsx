import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const services = [
  {
    num: '01',
    title: 'Wedding Planning',
    tagline: 'Your Fairytale, Perfected',
    desc: 'From venue selection to the final vow, we craft your perfect wedding with meticulous attention to every detail — flowers, lighting, flow, and feeling.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    ),
    accent: 'rgba(197,160,89,0.08)',
  },
  {
    num: '02',
    title: 'Corporate Events',
    tagline: 'Precision Meets Prestige',
    desc: 'Professional conferences, product launches, and company galas executed with surgical precision and polished refinement that reflects your brand.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    ),
    accent: 'rgba(197,160,89,0.06)',
  },
  {
    num: '03',
    title: 'Social Gatherings',
    tagline: 'Moments Worth Remembering',
    desc: 'Birthdays, anniversaries, and reunions transformed into unforgettable celebrations. We handle every detail so you can be fully present.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    accent: 'rgba(197,160,89,0.05)',
  },
  {
    num: '04',
    title: 'Floral Artistry',
    tagline: 'Nature, Elevated',
    desc: 'Sourcing the finest blooms to create immersive botanical environments — from table centerpieces to ceremony arches that take your breath away.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      </svg>
    ),
    accent: 'rgba(197,160,89,0.07)',
  },
  {
    num: '05',
    title: 'Stage & Décor',
    tagline: 'Theatrical by Design',
    desc: 'Architectural stage design blending traditional Kerala motifs with contemporary lighting for a truly theatrical experience your guests will talk about.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    accent: 'rgba(197,160,89,0.05)',
  },
  {
    num: '06',
    title: 'Photography',
    tagline: 'Capturing Eternity',
    desc: 'Our curated team of photographers and videographers capture every stolen glance, every laugh, and every tear — your story told beautifully.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
    ),
    accent: 'rgba(197,160,89,0.06)',
  },
];

function ServiceCard({ s, i, scrollTo }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { damping: 25 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { damping: 25 });

  function onMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function onMouseLeave() { x.set(0); y.set(0); setHovered(false); }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={() => setHovered(true)}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        perspective: 1000,
        rotateX, rotateY,
        position: 'relative',
        padding: '52px 44px',
        background: hovered ? 'var(--card-hover-bg)' : 'var(--card-bg)',
        border: `1px solid ${hovered ? 'rgba(197,160,89,0.22)' : 'rgba(197,160,89,0.07)'}`,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'background 0.4s, border-color 0.4s',
        cursor: 'default',
      }}
    >
      {/* Shimmering gradient sweep */}
      <motion.div
        animate={hovered ? { x: ['−100%', '200%'] } : { x: '-100%' }}
        transition={hovered ? { duration: 0.8, ease: 'easeInOut' } : {}}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, transparent 40%, rgba(197,160,89,0.05) 50%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glow corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        background: `radial-gradient(circle at top right, ${s.accent}, transparent 70%)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.4s',
        pointerEvents: 'none',
      }} />

      {/* Number watermark */}
      <div style={{
        position: 'absolute', top: 16, right: 28,
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 96, fontWeight: 700, lineHeight: 1,
        color: `rgba(197,160,89,${hovered ? 0.1 : 0.05})`,
        transition: 'color 0.4s',
        userSelect: 'none', pointerEvents: 'none',
      }}>
        {s.num}
      </div>

      {/* Icon box */}
      <motion.div
        animate={hovered ? { background: 'var(--gold)', color: 'var(--green)', rotate: 8, scale: 1.08 } : { background: 'transparent', color: 'var(--gold)', rotate: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: 60, height: 60,
          border: '1px solid rgba(197,160,89,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 2,
          marginBottom: 36,
        }}
      >
        {s.icon}
      </motion.div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 9, letterSpacing: '0.35em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8, opacity: 0.7 }}>
          {s.tagline}
        </p>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 400, color: 'var(--white)', marginBottom: 18, lineHeight: 1.15 }}>
          {s.title}
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-dim)', marginBottom: 36 }}>
          {s.desc}
        </p>

        {/* CTA link */}
        <motion.button
          onClick={() => scrollTo('contact')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--gold)', background: 'none', border: 'none',
            fontFamily: 'Cinzel, serif',
          }}
          whileHover={{ gap: 16 }}
          transition={{ duration: 0.3 }}
        >
          Enquire Now
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.button>
      </div>

      {/* Bottom gold line */}
      <motion.div
        animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', bottom: 0, left: 44, right: 44, height: 1, background: 'var(--gold)', transformOrigin: 'left', opacity: 0.4 }}
      />
    </motion.div>
  );
}

export default function Services({ scrollTo }) {
  return (
    <section id="services" style={{ padding: '140px 0', background: 'var(--green2)', position: 'relative', overflow: 'hidden' }}>
      {/* Background texture lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[20, 50, 80].map((pct, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${pct}%`, top: 0, bottom: 0, width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(197,160,89,0.04), transparent)',
          }} />
        ))}
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 60px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 90, maxWidth: 600 }}
        >
          <span className="section-label">Our Expertise</span>
          <h2 className="section-title">Services We <em>Offer</em></h2>
          <div className="gold-rule" />
          <p style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text-dim)', marginTop: 8 }}>
            Three decades of experience, five hundred unforgettable events, and one promise — your vision, perfected.
          </p>
        </motion.div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {services.map((s, i) => (
            <ServiceCard key={s.num} s={s} i={i} scrollTo={scrollTo} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          #services > div > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          #services { padding: 100px 0 !important; }
          #services > div { padding: 0 24px !important; }
          #services > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
