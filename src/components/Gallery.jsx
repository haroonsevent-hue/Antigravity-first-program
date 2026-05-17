import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const items = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80', tag: 'Wedding',    title: 'Royal Celebration',   cat: 'wedding' },
  { src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80', tag: 'Corporate',  title: 'Gala Night',          cat: 'corporate' },
  { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80', tag: 'Engagement', title: 'Emerald Evening',      cat: 'wedding' },
  { src: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=80', tag: 'Wedding',    title: 'Garden Ceremony',     cat: 'wedding' },
  { src: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80', tag: 'Social',     title: 'Anniversary Party',   cat: 'social' },
  { src: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=900&q=80', tag: 'Concept',    title: 'Minimalist Luxe',     cat: 'corporate' },
  { src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80', tag: 'Outdoor',    title: 'Heritage Garden',     cat: 'wedding' },
  { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80', tag: 'Birthday',   title: 'Grand Soirée',        cat: 'social' },
];

const filters = [
  { label: 'All',       value: 'all' },
  { label: 'Weddings',  value: 'wedding' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Social',    value: 'social' },
];

function GalleryItem({ item, index }) {
  const [hovered, setHovered] = useState(false);
  const isLarge = index === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        gridRow: isLarge ? 'span 2' : 'span 1',
        cursor: 'none',
      }}
    >
      {/* Image */}
      <motion.img
        src={item.src}
        alt={item.title}
        animate={{ scale: hovered ? 1.08 : 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {/* Overlay */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(3,10,6,0.92) 0%, rgba(3,10,6,0.3) 50%, transparent 100%)',
          display: 'flex', alignItems: 'flex-end', padding: '32px',
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={hovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
            {item.tag}
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: isLarge ? 34 : 26, color: 'var(--white)', fontWeight: 300, lineHeight: 1.1 }}>
            {item.title}
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ height: 1, background: 'var(--gold)', marginTop: 14, transformOrigin: 'left', opacity: 0.6 }}
          />
        </motion.div>
      </motion.div>

      {/* Tag badge (always visible) */}
      <div style={{
        position: 'absolute', top: 20, left: 20,
        background: 'rgba(197,160,89,0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(197,160,89,0.2)',
        padding: '5px 14px', borderRadius: 40,
        fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
        color: 'var(--gold)',
        opacity: hovered ? 0 : 1, transition: 'opacity 0.3s',
      }}>
        {item.tag}
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? items : items.filter(i => i.cat === filter);

  return (
    <section id="gallery" style={{ padding: '140px 0', background: 'var(--green)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <span className="section-label" style={{ justifyContent: 'center' }}>Our Portfolio</span>
          <h2 className="section-title">Recent <em>Events</em></h2>
          <div className="gold-rule center" />
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 60, flexWrap: 'wrap' }}
        >
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '10px 28px', borderRadius: 40,
                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                border: filter === f.value ? '1px solid var(--gold)' : '1px solid rgba(197,160,89,0.2)',
                background: filter === f.value ? 'rgba(197,160,89,0.12)' : 'transparent',
                color: filter === f.value ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
                transition: 'all 0.3s ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Masonry grid */}
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 280,
            gap: 12,
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <GalleryItem key={item.title} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #gallery > div > div:last-child { grid-template-columns: 1fr 1fr !important; grid-auto-rows: 220px !important; }
          #gallery > div { padding: 0 20px !important; }
        }
        @media (max-width: 600px) {
          #gallery > div > div:last-child { grid-template-columns: 1fr !important; grid-auto-rows: 240px !important; }
        }
      `}</style>
    </section>
  );
}
