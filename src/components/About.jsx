'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';

const API_BASE = ''; // Uses Next.js rewrites → http://localhost:3001

/* ── Static fallback: 3 couple / wedding photos ── */
const FALLBACK_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80', alt: 'Royal Celebration' },
  { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80', alt: 'Emerald Evening' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80', alt: 'Garden Ceremony' },
];

/* Duration each card stays on top (ms) */
const SLIDE_INTERVAL = 3500;

/* 3D card slot config: translateX, translateZ, rotateY, scale, brightness for each position */
const CARD_SLOTS = [
  /* Front  */ { x: 0, z: 0, ry: 0, scale: 1, bright: 1 },
  /* Right  */ { x: 90, z: -80, ry: -28, scale: 0.88, bright: 0.72 },
  /* Left   */ { x: -80, z: -120, ry: 22, scale: 0.82, bright: 0.55 },
];

function StorySlideshow() {
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [uploadedImages, setUploadedImages] = useState([]);
  const frontRef = useRef(null);

  /* Cap at 10 images in the About section carousel */
  const rawImages = uploadedImages.length > 0 ? uploadedImages : FALLBACK_IMAGES;
  const images = rawImages.slice(0, 10);

  /* Fetch uploaded gallery images */
  useEffect(() => {
    function fetchUploads() {
      fetch(`${API_BASE}/api/about-images`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setUploadedImages(data.map(img => ({
              src: img.src, // /uploads/about/... served via Next.js rewrites
              alt: img.title || img.tag || 'Event Photo',
            })));
          } else {
            setUploadedImages([]);
          }
        })
        .catch(() => setUploadedImages([]));
    }
    fetchUploads();
    const poll = setInterval(fetchUploads, 30_000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => { setActive(0); }, [images.length]);

  /* Auto-advance */
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % images.length), SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [images.length]);

  /* Mouse tilt for front card */
  function handleMouseMove(e) {
    const el = frontRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   /* -1 → 1 */
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ rx: dy * -9, ry: dx * 12 });
  }
  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  /* Map each slot position to an image index */
  const slots = CARD_SLOTS.map((cfg, slot) => ({
    cfg,
    imgIdx: (active + slot) % images.length,
    slot,
  })).reverse(); /* paint back first */

  return (
    <>
      <style>{`
        .card3d-scene {
          width: 100%; height: 100%;
          position: relative;
          perspective: 900px;
          perspective-origin: 50% 45%;
          overflow: visible;
        }
        .card3d-wrap {
          position: absolute; inset: 0;
          transform-style: preserve-3d;
          will-change: transform;
          cursor: pointer;
        }
        .card3d-inner {
          position: absolute; inset: 0;
          border-radius: 10px;
          overflow: hidden;
          backface-visibility: hidden;
        }
        .card3d-shine {
          position: absolute; inset: 0;
          border-radius: 10px;
          background: linear-gradient(
            130deg,
            rgba(255,255,255,0.13) 0%,
            rgba(197,160,89,0.08) 40%,
            transparent 70%
          );
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 3;
          transition: opacity 0.3s;
        }
        .card3d-edge {
          position: absolute; inset: 0;
          border-radius: 10px;
          border: 1px solid rgba(197,160,89,0.28);
          pointer-events: none;
          z-index: 4;
        }
        .card3d-shadow {
          position: absolute;
          bottom: -30px; left: 8%; right: 8%;
          height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          filter: blur(18px);
          transform: scaleX(1);
          transform-origin: center;
          z-index: 0;
        }
      `}</style>

      {/* 3D Scene wrapper */}
      <div
        className="card3d-scene"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={frontRef}
      >
        <AnimatePresence initial={false}>
          {slots.map(({ cfg, imgIdx, slot }) => {
            const isFront = slot === 0;

            return (
              <motion.div
                key={`card-${slot}-${imgIdx}`}
                className="card3d-wrap"
                initial={isFront
                  ? { rotateY: -55, rotateX: 8, x: -40, z: -180, scale: 0.75, opacity: 0 }
                  : false
                }
                animate={{
                  rotateY: isFront ? tilt.ry : cfg.ry,
                  rotateX: isFront ? tilt.rx : 0,
                  x: isFront ? 0 : cfg.x,
                  z: isFront ? 0 : cfg.z,
                  scale: isFront ? 1 : cfg.scale,
                  opacity: 1,
                  filter: `brightness(${cfg.bright})`,
                  zIndex: isFront ? 10 : (slot === 1 ? 5 : 2),
                }}
                exit={isFront
                  ? {
                    rotateY: 65, x: 60, z: -100, scale: 0.82, opacity: 0,
                    transition: { duration: 0.5, ease: [0.4, 0, 0.6, 1] }
                  }
                  : false
                }
                transition={
                  isFront
                    ? { type: 'spring', stiffness: 120, damping: 18 }
                    : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                }
                onClick={isFront ? undefined : () => setActive(imgIdx)}
                style={{
                  boxShadow: isFront
                    ? '0 32px 70px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35)'
                    : `0 12px 32px rgba(0,0,0,0.4)`,
                  transformStyle: 'preserve-3d',
                  borderRadius: 10,
                }}
              >
                {/* Card face */}
                <div className="card3d-inner">
                  <img
                    src={images[imgIdx].src}
                    alt={images[imgIdx].alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Gradient overlay — deeper on back cards */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: isFront
                      ? 'linear-gradient(to top, rgba(3,10,6,0.45) 0%, transparent 55%)'
                      : `rgba(3,10,6,${slot === 1 ? 0.32 : 0.52})`,
                    pointerEvents: 'none',
                  }} />
                </div>

                {/* Specular shine (only front) */}
                {isFront && <div className="card3d-shine" />}

                {/* Gold edge border */}
                <div className="card3d-edge" style={{
                  borderColor: isFront
                    ? 'rgba(197,160,89,0.35)'
                    : `rgba(197,160,89,${slot === 1 ? 0.14 : 0.07})`,
                }} />

                {/* "Click to view" hint on side cards */}
                {!isFront && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                      color: 'rgba(197,160,89,0.6)', opacity: 0.8,
                    }}>
                      {images[imgIdx].alt}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Ground shadow under front card */}
        <div className="card3d-shadow" />
      </div>

      {/* Caption badge on front card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`caption-${active}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            top: 16, left: 16, zIndex: 20,
            background: 'rgba(3,10,6,0.65)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(197,160,89,0.28)',
            padding: '5px 14px',
            borderRadius: 40,
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          {images[active]?.alt}
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 6, zIndex: 20,
      }}>
        {images.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            animate={{
              width: i === active ? 24 : 6,
              background: i === active ? 'rgba(197,160,89,0.95)' : 'rgba(197,160,89,0.3)',
            }}
            transition={{ duration: 0.35 }}
            style={{ height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0 }}
          />
        ))}
      </div>
    </>
  );
}

const FADE_UP = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: '-80px' },
  transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
};

const FADE_LEFT = {
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, margin: '-80px' },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
};

const FADE_RIGHT = {
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: false, margin: '-80px' },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
};

export default function About() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        padding: '140px 0',
        background: 'var(--green)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background grid lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[20, 50, 80].map((pct, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${pct}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background:
                'linear-gradient(to bottom, transparent, rgba(197,160,89,0.04), transparent)',
            }}
          />
        ))}
      </div>

      {/* Ambient gold glow */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Section header */}
        <motion.div
          {...FADE_UP}
          style={{ marginBottom: 80, maxWidth: 620 }}
        >
          <span className="section-label">Our Story</span>
          <h2 className="section-title">
            A Legacy of <em>Excellence</em>
          </h2>
          <div className="gold-rule" />
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.9,
              color: 'var(--text-dim)',
              marginTop: 8,
            }}
          >
            Three decades of crafting unforgettable celebrations across Kerala and beyond.
          </p>
        </motion.div>

        {/* Two-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}
        >
          {/* ── Image column — 3D card fan ── */}
          <motion.div
            {...FADE_LEFT}
            style={{
              position: 'relative',
              borderRadius: 10,
              aspectRatio: '4/3',
              /* overflow must be visible so side cards in 3D space aren't clipped */
              overflow: 'visible',
            }}
          >
            {/* 3D card fan slideshow */}
            <StorySlideshow />
          </motion.div>

          {/* ── Content column ── */}
          <motion.div {...FADE_RIGHT}>
            {/* "Since 1990" eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1, duration: 0.9 }}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 11,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: 24,
                opacity: 0.8,
              }}
            >
              Since 1990
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.18, duration: 0.9 }}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(28px, 3vw, 40px)',
                fontWeight: 300,
                color: 'var(--white)',
                lineHeight: 1.2,
                marginBottom: 32,
              }}
            >
              Turning Dreams into{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>
                Timeless Memories
              </em>
            </motion.h3>

            <div className="gold-rule" style={{ margin: '0 0 32px' }} />

            {[
              'Haroon\'s Weddings & Events Management began its journey over three decades ago with a simple mission: to transform dreams into reality. What started as a modest family endeavor in Edavanna, Kerala, has blossomed into one of the region\'s most trusted names in event planning.',
              'For more than 35 years, we have been at the heart of countless celebrations — from intimate family weddings to grand corporate galas. Our founder\'s vision of delivering impeccable service with a personal touch continues to guide every event we undertake.',
              'Located near Jamia College in Chembakuth, Edavanna, we combine local warmth with world-class standards. Every detail matters to us, because we understand that your event is not just a date on the calendar — it is a milestone in your life\'s story.',
            ].map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: 0.25 + i * 0.12, duration: 1 }}
                style={{
                  fontSize: 15,
                  lineHeight: 1.9,
                  color: 'var(--text-dim)',
                  marginBottom: i < 2 ? 22 : 0,
                }}
              >
                {para}
              </motion.p>
            ))}

            {/* Milestone pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.6, duration: 1 }}
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 44,
                flexWrap: 'wrap',
              }}
            >
              {[
                { num: '35+', label: 'Years of Legacy' },
                { num: '500+', label: 'Events Crafted' },
                { num: '100%', label: 'Client Dedication' },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  style={{
                    padding: '18px 28px',
                    border: '1px solid rgba(197,160,89,0.18)',
                    background: 'rgba(197,160,89,0.04)',
                    borderRadius: 2,
                    textAlign: 'center',
                    flex: 1,
                    minWidth: 100,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 30,
                      fontWeight: 300,
                      color: 'var(--gold)',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {num}
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          #about > div > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 700px) {
          #about { padding: 100px 0 !important; }
          #about > div { padding: 0 24px !important; }
        }
      `}</style>
    </section>
  );
}
