'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

/* WhatsApp green */
const WA_GREEN = '#25D366';
const WA_GREEN_DARK = '#128C7E';

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="white">
    <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.79 6.71L2 30l7.5-1.76A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.83-1.6l-.41-.25-4.45 1.05 1.07-4.33-.27-.44A11.45 11.45 0 0 1 4.5 16C4.5 9.6 9.6 4.5 16 4.5S27.5 9.6 27.5 16 22.4 27.5 16 27.5zm6.29-8.58c-.34-.17-2.02-.99-2.34-1.1-.31-.12-.54-.17-.77.17s-.89 1.1-1.09 1.33c-.2.22-.4.25-.74.08a9.35 9.35 0 0 1-2.74-1.69 10.25 10.25 0 0 1-1.9-2.36c-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59h-.66c-.22 0-.57.08-.87.42-.31.34-1.17 1.14-1.17 2.78s1.2 3.23 1.36 3.45c.17.22 2.36 3.6 5.72 5.05.8.34 1.43.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2.02-.83 2.3-1.62.28-.8.28-1.49.2-1.63-.08-.14-.31-.22-.65-.39z"/>
  </svg>
);

/* Labelled field wrapper */
function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, color: 'var(--text)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {required && <span style={{ color: '#f87171', fontSize: 12 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: 10,
  color: 'var(--white)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 14,
  fontWeight: 300,
  outline: 'none',
  transition: 'border-color 0.3s, background 0.3s',
  WebkitAppearance: 'none',
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', event: '', message: '' });
  const [sending, setSending] = useState(false);

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const sendWhatsApp = e => {
    e.preventDefault();
    setSending(true);
    const text = [
      `*New Enquiry from Website*`,
      ``,
      `*Name:* ${form.name}`,
      `*Email:* ${form.email}`,
      `*WhatsApp:* ${form.phone}`,
      `*Event Type:* ${form.event}`,
      `*Message:* ${form.message}`,
    ].join('%0A');
    window.open(`https://wa.me/919037874001?text=${text}`, '_blank');
    setTimeout(() => setSending(false), 1500);
  };

  return (
    <section id="contact" style={{ padding: '140px 0', background: 'var(--green)', position: 'relative', overflow: 'hidden' }}>
      {/* Background accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(197,160,89,0.025), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'start', position: 'relative', zIndex: 1 }}>

        {/* ── Left: Info column ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">Get in Touch</span>
          <h2 className="section-title">Let's Plan Your <em>Big Day</em></h2>
          <div className="gold-rule" />
          <p style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text-dim)', marginBottom: 60, maxWidth: 420 }}>
            Ready to start planning? We offer free initial consultations to help bring your vision to life. Reach out — we'd love to hear your story.
          </p>

        </motion.div>

        {/* ── Right: Enquiry Form ── */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: 16,
            padding: '48px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner glow */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle at top right, rgba(197,160,89,0.06), transparent)', pointerEvents: 'none' }} />

          <form onSubmit={sendWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Full Name */}
            <Field label="Full Name" required>
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={form.name}
                onChange={update}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(197,160,89,0.55)'; e.target.style.background = 'var(--input-focus-bg)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.background = 'var(--input-bg)'; }}
              />
            </Field>

            {/* Email + WhatsApp side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Email" required>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={update}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(197,160,89,0.55)'; e.target.style.background = 'var(--input-focus-bg)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.background = 'var(--input-bg)'; }}
                />
              </Field>
              <Field label="WhatsApp No." required>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 0000000000"
                  value={form.phone}
                  onChange={update}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(197,160,89,0.55)'; e.target.style.background = 'var(--input-focus-bg)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.background = 'var(--input-bg)'; }}
                />
              </Field>
            </div>

            {/* Event Type */}
            <Field label="Event Type" required>
              <select
                name="event"
                required
                value={form.event}
                onChange={update}
                style={{ ...inputStyle, cursor: 'none', color: form.event ? 'var(--white)' : 'var(--text-dim)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(197,160,89,0.55)'; e.target.style.background = 'var(--input-focus-bg)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.background = 'var(--input-bg)'; }}
              >
                <option value="" disabled style={{ background: 'var(--green3)' }}>Select Event Category</option>
                <option value="Wedding" style={{ background: 'var(--green3)' }}>Wedding</option>
                <option value="Engagement" style={{ background: 'var(--green3)' }}>Engagement</option>
                <option value="Corporate Event" style={{ background: 'var(--green3)' }}>Corporate Event</option>
                <option value="Birthday Party" style={{ background: 'var(--green3)' }}>Birthday Party</option>
                <option value="Social Gathering" style={{ background: 'var(--green3)' }}>Social Gathering</option>
                <option value="Other" style={{ background: 'var(--green3)' }}>Other</option>
              </select>
            </Field>

            {/* Message */}
            <Field label="Message Details">
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us more about your vision…"
                value={form.message}
                onChange={update}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(197,160,89,0.55)'; e.target.style.background = 'var(--input-focus-bg)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.background = 'var(--input-bg)'; }}
              />
            </Field>

            {/* Send to WhatsApp button */}
            <motion.button
              type="submit"
              disabled={sending}
              whileHover={{ scale: 1.015, boxShadow: `0 16px 48px rgba(37,211,102,0.4)` }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '17px 32px',
                background: sending
                  ? WA_GREEN_DARK
                  : `linear-gradient(135deg, ${WA_GREEN} 0%, #1ebe5d 100%)`,
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginTop: 4,
                cursor: 'none',
                transition: 'background 0.3s',
                boxShadow: `0 8px 32px rgba(37,211,102,0.25)`,
              }}
            >
              <WhatsAppIcon />
              {sending ? 'Opening WhatsApp…' : 'Send to WhatsApp'}
            </motion.button>

          </form>
        </motion.div>
      </div>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        @media (max-width: 1024px) {
          #contact > div { grid-template-columns: 1fr !important; gap: 60px !important; }
        }
        @media (max-width: 768px) {
          #contact { padding: 100px 0 !important; }
          #contact > div { padding: 0 24px !important; }
          #contact > div > div:last-child { padding: 36px 24px !important; }
          #contact > div > div:last-child form > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
