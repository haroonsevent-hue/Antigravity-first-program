'use client';
import { motion } from 'framer-motion';

const items = [
  'Wedding Planning', 'Corporate Events', 'Social Gatherings',
  'Floral Design', 'Stage Décor', 'Catering',
  'Photography', 'Entertainment', 'Destination Events',
];

export default function Marquee() {
  const doubled = [...items, ...items, ...items];

  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
      {/* Forward row */}
      <div style={{ background: 'var(--gold)', padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', animation: 'marqueeAnim 28s linear infinite' }}>
          {doubled.map((item, i) => (
            <span key={i} style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 24 }}>
              {item}
              <span style={{ width: 4, height: 4, background: 'var(--green)', borderRadius: '50%', opacity: 0.35, display: 'inline-block' }} />
            </span>
          ))}
        </div>
      </div>

      {/* Backward row (slower, slightly different styling) */}
      <div style={{ background: 'rgba(197,160,89,0.06)', padding: '10px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', animation: 'marqueeBwd 38s linear infinite' }}>
          {doubled.map((item, i) => (
            <span key={i} style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(197,160,89,0.3)', display: 'inline-flex', alignItems: 'center', gap: 24 }}>
              {item}
              <span style={{ width: 3, height: 3, background: 'rgba(197,160,89,0.3)', borderRadius: '50%', display: 'inline-block' }} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
