'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackToTop({ scrollTo }) {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  // Circle radius r = 28. Circumference C = 2 * PI * r = 175.9
  const circumference = 175.9;
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.button
      onClick={() => scrollTo('home')}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{
        position: 'fixed',
        bottom: 36,
        right: 36,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--green)',
        border: '1px solid rgba(197, 160, 89, 0.2)',
        color: 'var(--gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9990,
        cursor: 'none',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(197,160,89,0.05)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m18 15-6-6-6 6"/>
      </svg>

      {/* Progress ring SVG overlay */}
      <svg style={{ position: 'absolute', inset: -2, width: 60, height: 60, transform: 'rotate(-90deg)', overflow: 'visible', pointerEvents: 'none' }}>
        {/* Track circle (dim) */}
        <circle
          cx="30" cy="30" r="28"
          stroke="rgba(197, 160, 89, 0.08)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Glowing active progress circle */}
        <motion.circle
          cx="30" cy="30" r="28"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset,
            filter: 'drop-shadow(0px 0px 4px rgba(197, 160, 89, 0.6))'
          }}
        />
      </svg>
    </motion.button>
  );
}

