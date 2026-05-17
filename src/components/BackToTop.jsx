import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackToTop({ scrollTo }) {
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: 40,
        right: 40,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'var(--green)',
        border: '1px solid var(--gold)',
        color: 'var(--gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'none',
        boxShadow: '0 0 20px rgba(197,160,89,0.2)'
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m18 15-6-6-6 6"/>
      </svg>
      {/* Progress ring */}
      <svg style={{ position: 'absolute', inset: -2, width: 64, height: 64, transform: 'rotate(-90deg)' }}>
        <motion.circle
          cx="32" cy="32" r="30"
          stroke="var(--gold)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="0 1"
          style={{ pathLength: scrollYProgress, opacity: 0.3 }}
        />
      </svg>
    </motion.button>
  );
}
