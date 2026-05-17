import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhtBle7BrR2Ip8Q_-rQI1Y3tTQ37PDxGdDyBXRnQimAOVFUANHwG7RStXeHJFvY5bHSQ/exec";

const hardcoded = [
  { id: 'h1', name: "Adnan & Fatima", text: "Haroon's made our dream wedding a reality. The stage decoration was breathtaking and exactly what we imagined. Every detail was perfect!", rating: 5, eventType: "Wedding", time: "10/28/2023 02:30 PM" },
  { id: 'h2', name: "TechSolutions Pvt Ltd", text: "Professional, punctual, and perfect execution. The annual meet was handled flawlessly. Highly recommended for corporate events.", rating: 5, eventType: "Corporate Event", time: "11/15/2023 10:00 AM" },
  { id: 'h3', name: "Raheel & Ayesha", text: "Our nikah ceremony was an absolute dream. The floral arrangements were stunning and the team went above and beyond for us.", rating: 5, eventType: "Wedding", time: "12/01/2023 04:00 PM" },
];

function triggerGoldShower() {
  const colors = ['#C5A059','#FFD700','#DAA520','#F0E68C','#e2c98a'];
  const end = Date.now() + 3500;
  const iv = setInterval(() => {
    if (Date.now() > end) { clearInterval(iv); return; }
    for (let i = 0; i < 8; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.cssText = `left:${Math.random()*100}vw;animation-duration:${Math.random()*1.5+1.5}s;background:${colors[Math.floor(Math.random()*colors.length)]};width:${Math.random()*8+4}px;height:${Math.random()*8+4}px;border-radius:${Math.random()>0.5?'50%':'2px'}`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }, 80);
}

function StarRating({ rating, setRating, interactive = true }) {
  const [hovered, setHoveredStar] = useState(0);
  const display = interactive ? (hovered || rating) : rating;

  return (
    <div style={{ display: 'flex', gap: 8, margin: '4px 0' }} onMouseLeave={() => interactive && setHoveredStar(0)}>
      {[1,2,3,4,5].map(n => (
        <motion.button
          key={n}
          type="button"
          whileHover={interactive ? { scale: 1.25 } : {}}
          whileTap={interactive ? { scale: 0.9 } : {}}
          onClick={() => interactive && setRating(n)}
          onMouseEnter={() => interactive && setHoveredStar(n)}
          style={{ background: 'none', border: 'none', padding: '4px 2px', cursor: interactive ? 'none' : 'default' }}
        >
          <svg width={interactive ? 36 : 14} height={interactive ? 36 : 14} viewBox="0 0 24 24" fill={n <= display ? '#C5A059' : 'none'} stroke={n <= display ? '#C5A059' : '#3a5540'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </motion.button>
      ))}
    </div>
  );
}

function ReviewCard({ r, isMine, canDelete, onEdit, onDelete }) {
  const stars = parseInt(r.rating) || 5;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="review-card"
    >
      {isMine && (
        <div className="kebab-wrap">
          <button className="kebab-menu-btn">⋮</button>
          <div className="menu-dropdown">
            <button onClick={() => onEdit(r)} className="menu-item">Edit</button>
            {canDelete && <button onClick={() => onDelete(r.id)} className="menu-item" style={{ color: '#f87171' }}>Delete</button>}
          </div>
        </div>
      )}

      <StarRating rating={stars} interactive={false} />
      <p className="review-text">"{r.text}"</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="review-author-avatar">{(r.name||'A').charAt(0).toUpperCase()}</div>
        <div>
          <div className="review-author-name">{r.name}</div>
          <div className="review-author-type">{r.eventType}</div>
        </div>
      </div>

      {(r.time||r.date) && <div className="review-date">{r.time||r.date}</div>}
    </motion.div>
  );
}

export default function Reviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [rating, setRating]     = useState(0);
  const [action, setAction]     = useState('create');
  const [editId, setEditId]     = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', message: '', eventType: '', otherEvent: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('my_reviews')||'[]');
    setMyReviews(saved);
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      setReviews(data.filter(r => r.name && r.text).reverse());
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { alert('Please select a rating.'); return; }
    setSubmitting(true);
    const id = action === 'create' ? (Date.now().toString(36) + Math.random().toString(36).slice(2)) : editId;
    const eventVal = form.eventType === 'Other' ? form.otherEvent : form.eventType;
    const params = new URLSearchParams({ action, id, name: form.name, text: form.message, rating, eventType: eventVal, time: new Date().toLocaleString() });
    try {
      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: params, mode: 'no-cors' });
      if (action === 'create') {
        const nm = [...myReviews, { id, timestamp: Date.now() }];
        setMyReviews(nm);
        localStorage.setItem('my_reviews', JSON.stringify(nm));
        if (rating >= 4) triggerGoldShower();
      }
      cancelEdit();
      fetchReviews();
    } catch { alert('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  }

  function startEdit(r) {
    setAction('update'); setEditId(r.id); setRating(parseInt(r.rating)||5);
    const knownTypes = ['Wedding','Corporate Event','Birthday Party'];
    setForm({ name: r.name, message: r.text, eventType: knownTypes.includes(r.eventType) ? r.eventType : 'Other', otherEvent: knownTypes.includes(r.eventType) ? '' : r.eventType });
    document.getElementById('reviews-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelEdit() {
    setAction('create'); setEditId(''); setRating(0);
    setForm({ name: '', message: '', eventType: '', otherEvent: '' });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review?')) return;
    const params = new URLSearchParams({ action: 'delete', id });
    await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: params, mode: 'no-cors' });
    const nm = myReviews.filter(r => r.id !== id);
    setMyReviews(nm); localStorage.setItem('my_reviews', JSON.stringify(nm));
    fetchReviews();
  }

  const all = [...reviews, ...hardcoded];
  const displayed = expanded ? all : all.slice(0, 6);
  const ratingLabels = ['','Disappointing','Fair','Good','Great','Outstanding!'];

  return (
    <section id="reviews-section" style={{ padding: '140px 0', background: 'var(--green2)', position: 'relative', overflow: 'hidden' }}>
      {/* Giant quote mark */}
      <div style={{ position: 'absolute', top: -40, left: -30, fontFamily: 'Cormorant Garamond, serif', fontSize: '500px', lineHeight: 1, color: 'rgba(197,160,89,0.025)', pointerEvents: 'none', userSelect: 'none' }}>"</div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 60px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <span className="section-label" style={{ justifyContent: 'center' }}>Client Stories</span>
          <h2 className="section-title">Feedback &amp; <em>Reviews</em></h2>
          <div className="gold-rule center" />
        </motion.div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, border: '2px solid rgba(197,160,89,0.15)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--gold)' }}>Loading Reviews…</p>
          </div>
        )}

        {/* Review cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 48 }}>
          <AnimatePresence mode="popLayout">
            {displayed.map((r, i) => {
              const mine = myReviews.some(m => m.id === r.id);
              const mineData = myReviews.find(m => m.id === r.id);
              const canDel = mineData && (Date.now() - mineData.timestamp) < 3600000;
              return (
                <ReviewCard key={r.id||i} r={r} isMine={mine} canDelete={canDel} onEdit={startEdit} onDelete={handleDelete} />
              );
            })}
          </AnimatePresence>
        </div>

        {/* See more */}
        {all.length > 6 && (
          <motion.div layout style={{ textAlign: 'center', marginBottom: 60 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--gold)', background: 'none', border: '1px solid rgba(197,160,89,0.3)',
                padding: '14px 44px', borderRadius: 1, transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.target.style.background = 'rgba(197,160,89,0.08)'; }}
              onMouseLeave={e => { e.target.style.background = 'none'; }}
            >
              {expanded ? 'Show Less' : `View All ${all.length} Reviews`}
            </button>
          </motion.div>
        )}

        {/* Review form */}
        <div id="reviews-form-anchor" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 680, margin: '0 auto',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(197,160,89,0.12)',
            padding: 64,
          }}
        >
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300, color: 'var(--white)', marginBottom: 8 }}>
            {action === 'create' ? 'Share Your Experience' : 'Edit Your Review'}
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 36 }}>
            {action === 'create' ? 'Click a star to rate us and leave your review.' : 'Make changes and submit below.'}
          </p>

          {/* Stars */}
          <div style={{ marginBottom: 4 }}>
            <StarRating rating={rating} setRating={(n) => { setRating(n); if (n === 5) triggerGoldShower(); }} interactive={true} />
          </div>
          <AnimatePresence>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: 28 }}
              >
                {ratingLabels[rating]}
              </motion.p>
            )}
          </AnimatePresence>
          {rating === 0 && <div style={{ height: 28 }} />}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <input type="text" required placeholder="Your Name" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <select required className="form-input" value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})}>
                <option value="" disabled>Select Event Type</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Other">Other (Please Specify)</option>
              </select>
            </div>
            <AnimatePresence>
              {form.eventType === 'Other' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ marginBottom: 16, overflow: 'hidden' }}>
                  <input type="text" placeholder="Describe your event…" className="form-input" value={form.otherEvent} onChange={e => setForm({...form, otherEvent: e.target.value})} />
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ marginBottom: 16 }}>
              <textarea required rows="4" placeholder="Tell us about your experience…" className="form-input" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9 22 2z"/></svg>
              <span>{submitting ? 'Processing…' : action === 'create' ? 'Submit Review' : 'Update Review'}</span>
            </button>

            {action === 'update' && (
              <button type="button" className="cancel-btn" onClick={cancelEdit}>Cancel Edit</button>
            )}
          </form>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1024px) { #reviews-section > div > div:nth-child(3) { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 768px) {
          #reviews-section { padding: 100px 0 !important; }
          #reviews-section > div { padding: 0 24px !important; }
          #reviews-section > div > div:nth-child(3) { grid-template-columns: 1fr !important; }
          #reviews-section > div > div:last-child { padding: 36px 28px !important; }
        }
      `}</style>
    </section>
  );
}
