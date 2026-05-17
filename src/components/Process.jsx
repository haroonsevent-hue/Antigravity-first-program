import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Consultation',
    desc: 'We meet to deeply understand your vision, style, and dreams — listening to every detail that matters to you.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  {
    num: '02',
    title: 'Curation',
    desc: 'Our designers craft a bespoke plan — every flower, every light, every moment choreographed to reflect your story.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    )
  },
  {
    num: '03',
    title: 'Execution',
    desc: 'Our team handles logistics, vendor coordination and setup — ensuring every single detail is flawlessly in place.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    )
  },
  {
    num: '04',
    title: 'Celebration',
    desc: 'You enjoy every precious moment while we manage the flow of the entire event from beginning to grand finale.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    )
  }
];

export default function Process() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%']);

  return (
    <section
      id="process"
      ref={sectionRef}
      style={{ padding: '140px 0', background: '#060d09', position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '80%', height: '60%', background: 'radial-gradient(ellipse, rgba(197,160,89,0.04), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 60px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 100 }}
        >
          <span className="section-label" style={{ justifyContent: 'center' }}>The Journey</span>
          <h2 className="section-title">Our <em>Process</em></h2>
          <div className="gold-rule center" />
        </motion.div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Animated progress line */}
          <div style={{ position: 'absolute', top: 48, left: 0, right: 0, height: 1, background: 'rgba(197,160,89,0.1)', zIndex: 0 }}>
            <motion.div style={{ height: '100%', background: 'linear-gradient(to right, var(--gold-dk), var(--gold))', width: lineWidth, boxShadow: '0 0 12px rgba(197,160,89,0.4)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, position: 'relative', zIndex: 1 }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: 'center' }}
              >
                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(197,160,89,0.3)' }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 96, height: 96, borderRadius: '50%',
                    background: 'var(--green)',
                    border: '1px solid rgba(197,160,89,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 36px',
                    color: 'var(--gold)',
                    position: 'relative',
                    boxShadow: '0 0 20px rgba(197,160,89,0.08)',
                  }}
                >
                  {step.icon}
                  {/* Step number badge */}
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--gold)', color: 'var(--green)',
                    fontFamily: 'Cinzel, serif', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                </motion.div>

                <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: 'var(--white)', marginBottom: 16, letterSpacing: '0.08em' }}>{step.title}</h4>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.85 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #process > div > div:last-child > div { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 500px) {
          #process > div { padding: 0 24px !important; }
          #process > div > div:last-child > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
