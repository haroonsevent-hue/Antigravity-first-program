'use client';
import { motion } from 'framer-motion';
import logoImage from '../assets/logo.png';

const links = ['Home', 'Services', 'Gallery', 'Reviews', 'Contact'];
const secMap = { Home: 'home', Services: 'services', Gallery: 'gallery', Reviews: 'reviews-section', Contact: 'contact' };

const socials = [
  {
    label: 'Instagram', href: 'https://www.instagram.com/haroons_weddings/?hl=en',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>,
  },
  {
    label: 'Facebook', href: 'https://www.facebook.com/p/Haroons-weddings-events-100063703044091/',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
  },
  {
    label: 'YouTube', href: 'https://www.youtube.com/channel/UC5XX2UPV5JB6wIaPxrPlMbg',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>,
  },
];

export default function Footer({ scrollTo }) {
  return (
    <footer id="socials" style={{ background: 'var(--footer-bg)', borderTop: '1px solid var(--input-border)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative gradient line */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(to right, transparent, rgba(197,160,89,0.25), transparent)' }} />

      {/* Ambient glow */}
      <div style={{ position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '100%', background: 'radial-gradient(circle, rgba(197,160,89,0.025), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="footer-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 60px 64px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 60, position: 'relative', zIndex: 1 }}>
        {/* Brand column */}
        <div>
          <button onClick={() => scrollTo('home')} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'none', border: 'none', marginBottom: 28, padding: 0 }}>
            <img
              src={logoImage.src}
              alt="Haroon's Weddings & Events"
              onError={e => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid rgba(197,160,89,0.35)', objectFit: 'cover' }}
            />
            <div style={{
              display: 'none', width: 52, height: 52, borderRadius: '50%',
              border: '1.5px solid rgba(197,160,89,0.35)',
              background: 'linear-gradient(135deg, #091a12, #163f2e)',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cinzel, serif', fontSize: 22, color: 'var(--gold)',
            }}>H</div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: '0.2em', color: 'var(--white)' }}>HAROON'S</div>
              <div style={{ fontSize: 8, letterSpacing: '0.4em', color: 'var(--gold)', textTransform: 'uppercase', marginTop: 3, opacity: 0.7 }}>Weddings & Events</div>
            </div>
          </button>

          <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text-dim)', maxWidth: 360, marginBottom: 36 }}>
            Turning your special moments into lifelong memories. Full-service planning for weddings, corporate galas, and private celebrations since 1990.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            {socials.map(s => (
              <motion.a
                key={s.label}
                href={s.href} target="_blank" rel="noopener noreferrer"
                title={s.label}
                whileHover={{ borderColor: 'var(--gold)', color: 'var(--gold)', y: -3, background: 'rgba(197,160,89,0.08)' }}
                transition={{ duration: 0.25 }}
                style={{ width: 42, height: 42, border: '1px solid rgba(197,160,89,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', borderRadius: 2 }}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 28 }}>Quick Links</h4>
          {links.map(l => (
            <motion.button
              key={l}
              onClick={() => scrollTo(secMap[l])}
              whileHover={{ x: 5, color: 'var(--gold)' }}
              transition={{ duration: 0.2 }}
              style={{ display: 'block', fontSize: 13, color: 'var(--text-dim)', background: 'none', border: 'none', textAlign: 'left', marginBottom: 14, lineHeight: 1, padding: 0 }}
            >
              {l}
            </motion.button>
          ))}
        </div>

        {/* Contact info */}
        <div>
          <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 28 }}>Contact Us</h4>
          {[
            { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>, text: 'Near Jamia College, Chembakuth, Edavanna, Kerala 676541' },
            { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, text: '+91 9037874001\n+91 9567525723\n+91 9633772525' },
            { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>, text: 'haroonsevent@gmail.com' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18, fontSize: 13, color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <span style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--input-border)', padding: '24px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
          © 2025 Haroon's Weddings &amp; Events Management. All rights reserved.
        </p>
        <p style={{ fontSize: 10, color: 'rgba(197,160,89,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Crafted with Devotion
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            padding: 60px 30px !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 600px) {
          /* Main grid → single column, centered */
          .footer-grid {
            grid-template-columns: 1fr !important;
            padding: 48px 24px 40px !important;
            gap: 36px !important;
          }

          /* Brand column — center everything */
          .footer-grid > div:first-child {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer-grid > div:first-child button {
            justify-content: center !important;
          }
          .footer-grid > div:first-child p {
            text-align: center;
            max-width: 100% !important;
            margin-bottom: 24px !important;
          }

          /* Social icons — centered, larger touch targets */
          .footer-grid > div:first-child > div:last-child {
            justify-content: center;
            gap: 12px !important;
          }
          .footer-grid > div:first-child > div:last-child a {
            width: 44px !important;
            height: 44px !important;
          }

          /* Quick Links — centered with divider top */
          .footer-grid > div:nth-child(2) {
            text-align: center;
            border-top: 1px solid rgba(197,160,89,0.1);
            padding-top: 28px;
          }
          .footer-grid > div:nth-child(2) h4 {
            text-align: center;
            margin-bottom: 20px !important;
          }
          .footer-grid > div:nth-child(2) button {
            text-align: center !important;
            display: inline-block !important;
            margin: 0 8px 12px !important;
            font-size: 14px !important;
            min-height: 44px !important;
            line-height: 44px !important;
            padding: 0 4px !important;
          }

          /* Contact info — centered with divider top */
          .footer-grid > div:nth-child(3) {
            text-align: center;
            border-top: 1px solid rgba(197,160,89,0.1);
            padding-top: 28px;
          }
          .footer-grid > div:nth-child(3) h4 {
            text-align: center;
            margin-bottom: 20px !important;
          }
          .footer-grid > div:nth-child(3) > div {
            justify-content: center;
          }

          /* Bottom bar — stack and center */
          footer > div:last-of-type {
            padding: 20px 24px !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </footer>
  );
}
