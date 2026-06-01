import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhtBle7BrR2Ip8Q_-rQI1Y3tTQ37PDxGdDyBXRnQimAOVFUANHwG7RStXeHJFvY5bHSQ/exec";

const hardcodedReviews = [
  { id: "hc-1", name: "Adnan & Fatima",      text: "Like walking onto a movie set. Absolutely breathtaking execution. They made our dream wedding a reality.",                                     rating: 5, eventType: "Wedding",        time: "10/28/2023 02:30 PM" },
  { id: "hc-2", name: "TechSolutions",       text: "A masterpiece of corporate event planning. Professional, timely, and executed with absolute precision.",                                      rating: 5, eventType: "Corporate Event", time: "11/15/2023 10:00 AM" },
  { id: "hc-3", name: "Sara & Rahul",        text: "The attention to detail is unmatched! Every guest was amazed by the aesthetic and arrangements.",                                            rating: 5, eventType: "Wedding",        time: "12/03/2023 06:00 PM" },
  { id: "hc-4", name: "Priya & Arjun",       text: "Haroon's team made our traditional wedding a grand success. The best event managers in Kasala without a doubt!",                             rating: 5, eventType: "Wedding",        time: "01/14/2024 11:00 AM" },
  { id: "hc-5", name: "Skyline Builders",    text: "Flawless execution for our annual meet. Highly recommend their corporate event services.",                                                   rating: 4, eventType: "Corporate Event", time: "02/05/2024 09:30 AM" },
  { id: "hc-6", name: "Mohammed & Aisha",    text: "The decor, the coordination, the hospitality… everything was top notch. Thank you for making our day special.",                             rating: 5, eventType: "Wedding",        time: "03/22/2024 05:00 PM" },
];

function generateUUID() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

function isValidName(text) {
  const nameRegex = /^[a-zA-Z\s\.&]+$/;
  const noRepeat = !/(.)\1{2,}/.test(text);
  return nameRegex.test(text) && text.trim().length >= 2 && noRepeat;
}

function isValidMessage(text) {
  if (text.length < 4) return false;
  if (!/[aeiouyAEIOUY]/.test(text)) return false;
  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(text)) return false;
  if (/(.)\1{3,}/.test(text)) return false;
  return true;
}

function triggerGoldShower() {
  const colors = ['#C5A059','#FFD700','#DAA520','#F0E68C'];
  const end = Date.now() + 3500;
  const iv = setInterval(() => {
    if (Date.now() > end) { clearInterval(iv); return; }
    for (let i = 0; i < 8; i++) {
      const c = document.createElement('div');
      c.className = 'rv-confetti';
      c.style.cssText = `left:${Math.random()*100}vw;animation-duration:${Math.random()*1.5+1.5}s;background:${colors[Math.floor(Math.random()*4)]};width:${Math.random()*7+4}px;height:${Math.random()*7+4}px;`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }, 100);
}

const sectionCSS = `
  /* ── Section Shell ────────────────────────────────────────────────── */
  .rv-section {
    position: relative;
    padding: 96px 0;
    background: var(--green2);
    color: var(--text);
    border-top: 1px solid var(--input-border);
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }
  .rv-dot-bg {
    position: absolute;
    inset: 0;
    opacity: .04;
    background-image: radial-gradient(#C5A059 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
  .rv-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }

  /* ── Header ────────────────────────────────────────────────── */
  .rv-header { text-align: center; margin-bottom: 60px; }
  .rv-eyebrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: #C5A059;
    margin-bottom: 18px;
    font-weight: 500;
  }
  .rv-eyebrow::before,
  .rv-eyebrow::after {
    content: '';
    display: block;
    width: 30px;
    height: 1px;
    background: #C5A059;
    opacity: 0.7;
  }
  .rv-title {
    font-family: 'Cinzel', serif;
    font-size: clamp(2.2rem, 4.5vw, 3.4rem);
    font-weight: 400;
    color: var(--white);
    margin: 0;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    line-height: 1.2;
  }
  .rv-title-bar { display: none; }

  /* ── Loader ─────────────────────────────────────────────────── */
  .rv-loader-wrap { text-align: center; padding: 24px 0; }
  .rv-spinner {
    width: 22px; height: 22px;
    border: 3px solid var(--green3);
    border-top-color: #C5A059;
    border-radius: 50%;
    animation: rv-spin 1s linear infinite;
    margin: 0 auto 8px;
  }
  @keyframes rv-spin { to { transform: rotate(360deg); } }
  .rv-loader-text { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 300; color: #C5A059; letter-spacing: .05em; }

  /* ── Marquee & Arrows ────────────────────────────────────────────────────── */
  .rv-marquee-wrapper {
    position: relative;
    width: 100%;
  }
  .rv-marquee-container {
    width: 100%;
    overflow-x: auto;
    position: relative;
    padding: 40px 0 80px;
    mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .rv-marquee-container::-webkit-scrollbar { display: none; }
  .rv-marquee-track {
    display: flex;
    gap: 40px;
    width: max-content;
    padding: 0 20px;
  }
  .rv-nav-arrows {
    position: absolute;
    top: calc(50% - 20px);
    transform: translateY(-50%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 10;
    padding: 0 40px;
    box-sizing: border-box;
  }
  .rv-arrow {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(197, 160, 89, 0.3);
    color: #C5A059;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: auto;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: all .3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    opacity: 0;
  }
  .rv-arrow:hover {
    background: rgba(197, 160, 89, 0.15);
    border-color: rgba(197, 160, 89, 0.8);
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(197, 160, 89, 0.2);
    color: #fff;
  }
  .rv-marquee-wrapper:hover .rv-arrow {
    opacity: 1;
  }
  @media (max-width: 768px) {
    .rv-arrow { opacity: 1; width: 44px; height: 44px; }
    .rv-nav-arrows { padding: 0 16px; }
  }

  /* ── Card ────────────────────────────────────────────────── */
  .rv-card {
    width: 380px;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
    border: 1px solid rgba(197, 160, 89, 0.15);
    border-radius: 20px;
    padding: 36px 32px 30px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
    transition: all .4s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  .rv-card:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
    border-color: rgba(197, 160, 89, 0.4);
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 20px rgba(197, 160, 89, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  @media (max-width: 700px) { .rv-card { width: 320px; padding: 28px 24px 26px; } }
  .rv-card-stars { color: #C5A059; font-size: 14px; letter-spacing: 2px; }
  .rv-card-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    line-height: 1.75;
    color: var(--white);
    font-style: italic;
    flex: 1;
  }
  .rv-card-divider {
    width: 100%;
    height: 1px;
    background: rgba(197,160,89,.12);
    margin: 4px 0 6px;
  }
  .rv-card-name {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--white);
    margin: 0;
  }
  .rv-card-type {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    font-weight: 400;
    letter-spacing: .25em;
    text-transform: uppercase;
    color: #C5A059;
    margin: 0 0 2px;
  }
  .rv-card-time {
    position: absolute;
    bottom: 10px;
    right: 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    font-weight: 300;
    color: var(--text-dim);
  }

  /* Kebab menu */
  .kebab-wrap { position: absolute; top: 10px; right: 10px; z-index: 200; }
  .kebab-btn { background: none; border: none; cursor: pointer; color: #C5A059; opacity: .65; padding: 4px; display: flex; align-items: center; transition: opacity .2s; }
  .kebab-btn:hover { opacity: 1; }
  .menu-dropdown { position: absolute; top: calc(100% + 4px); right: 0; background: var(--green3); border: 1px solid var(--input-border); border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.55); min-width: 120px; overflow: hidden; }
  .menu-item { display: block; width: 100%; text-align: left; padding: 10px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300; color: var(--white); background: none; border: none; cursor: pointer; transition: background .15s, color .15s; }
  .menu-item:hover { background: rgba(197,160,89,.15); color: #C5A059; }

  /* ── Toggle button ────────────────────────────────────────────────── */
  .rv-toggle-wrap { text-align: center; margin-bottom: 56px; }
  .rv-toggle-btn {
    font-family: 'Cinzel', serif;
    border: 1px solid rgba(197,160,89,.6);
    color: #C5A059;
    background: transparent;
    padding: 17px 44px;
    border-radius: 1px;
    font-size: 10px;
    letter-spacing: .22em;
    text-transform: uppercase;
    font-weight: 400;
    cursor: pointer;
    transition: background .35s, color .35s, transform .3s;
  }
  .rv-toggle-btn:hover { background: rgba(197,160,89,.06); color: #C5A059; transform: translateY(-3px); }

  /* ── Form wrapper ────────────────────────────────────────────────── */
  .rv-form-wrap {
    background: var(--card-bg);
    border: 1px solid var(--input-border);
    border-radius: 18px;
    padding: 40px 36px 36px;
    backdrop-filter: blur(10px);
  }
  .rv-form-title {
    text-align: center;
    font-family: 'Cinzel', 'Playfair Display', 'Georgia', serif;
    font-size: 1.3rem;
    font-weight: 400;
    text-transform: uppercase;
    color: #dcb36a;
    margin: 0 0 20px;
    letter-spacing: 0.2em;
    text-shadow: 0 2px 10px rgba(0,0,0,0.6);
  }
  .rv-stars-row {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .rv-star-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    transition: transform .18s cubic-bezier(.175,.885,.32,1.275);
  }
  .rv-star-btn:hover { transform: scale(1.25); }
  .rv-rating-label {
    text-align: center;
    font-size: 13px;
    color: #C5A059;
    min-height: 20px;
    margin-bottom: 20px;
  }

  /* ── Form fields ────────────────────────────────────────────────── */
  .rv-form { display: flex; flex-direction: column; gap: 16px; }
  .rv-input, .rv-textarea {
    width: 100%;
    padding: 14px 18px;
    border-radius: 10px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    outline: none;
    transition: border-color .3s, background .3s;
    box-sizing: border-box;
  }
  .rv-input::placeholder, .rv-textarea::placeholder { color: var(--text-dim); font-weight: 300; }
  .rv-input:focus, .rv-textarea:focus { border-color: rgba(197,160,89,.55); background: var(--input-focus-bg); }
  .rv-textarea { resize: none; }
  .rv-input-other { border-left: 3px solid #C5A059; }

  .rv-select-wrap { position: relative; }
  .rv-select {
    width: 100%;
    padding: 14px 40px 14px 18px;
    border-radius: 10px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color .3s, background .3s;
    box-sizing: border-box;
  }
  .rv-select:focus { border-color: rgba(197,160,89,.55); background: var(--input-focus-bg); }
  .rv-select option { background: var(--green3); color: var(--white); }
  .rv-select-arrow {
    pointer-events: none;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-dim);
  }

  .rv-submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px;
    background: #C5A059;
    color: var(--green);
    border: none;
    border-radius: 10px;
    font-size: 12px;
    letter-spacing: .14em;
    text-transform: uppercase;
    font-weight: 800;
    cursor: pointer;
    transition: background .2s, transform .2s;
  }
  .rv-submit-btn:hover { background: #d4af6a; transform: translateY(-1px); }
  .rv-submit-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .rv-cancel-btn {
    background: none; border: none; color: var(--text-dim);
    font-size: 12px; cursor: pointer; text-decoration: underline;
    transition: color .2s; margin-top: 4px; align-self: center;
  }
  .rv-cancel-btn:hover { color: var(--white); }

  /* ── Confetti ────────────────────────────────────────────────── */
  @keyframes rv-fall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
  .rv-confetti { position:fixed; top:-10px; z-index:9999; pointer-events:none; border-radius:2px; animation:rv-fall linear forwards; }

  .hidden { display:none !important; }
`;

export default function Reviews() {
  const [globalReviews, setGlobalReviews] = useState([]);
  const [myReviews, setMyReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('my_reviews') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Auto-scroll states
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeout = useRef(null);

  useEffect(() => {
    let animationId;
    const container = scrollRef.current;
    
    const scrollLoop = () => {
      if (container && !isPaused) {
        container.scrollLeft += 0.5; // Auto-scroll speed
        // Reset when halfway (since we duplicated items an even number of times)
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft -= container.scrollWidth / 2;
        }
      }
      animationId = requestAnimationFrame(scrollLoop);
    };
    
    animationId = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const handleManualScroll = useCallback((direction) => {
    const container = scrollRef.current;
    if (!container) return;

    // Pause scroll
    setIsPaused(true);
    if (pauseTimeout.current) clearTimeout(pauseTimeout.current);

    const scrollAmount = windowWidth < 700 ? 360 : 420; // Card width + gap

    // Infinite loop jump
    if (direction === 'left' && container.scrollLeft < scrollAmount) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft += container.scrollWidth / 2;
    } else if (direction === 'right' && container.scrollLeft >= container.scrollWidth / 2) {
      container.style.scrollBehavior = 'auto';
      container.scrollLeft -= container.scrollWidth / 2;
    }
    
    // Force layout reflow
    void container.offsetWidth;

    // Smooth animate
    container.style.scrollBehavior = 'smooth';
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount });

    // Remove smooth scroll after animation
    setTimeout(() => {
      if (container) container.style.scrollBehavior = 'auto';
    }, 500);

    // Resume after 4 seconds
    pauseTimeout.current = setTimeout(() => {
      setIsPaused(false);
      pauseTimeout.current = null;
    }, 4000);
  }, [windowWidth]);

  // Form states
  const [formAction, setFormAction] = useState('create');
  const [editId, setEditId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [eventType, setEventType] = useState('');
  const [otherEventType, setOtherEventType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Kebab menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Fetch reviews on mount
  useEffect(() => {
    setLoading(true);
    fetch(GOOGLE_SCRIPT_URL)
      .then(r => r.json())
      .then(data => {
        const valid = data.filter(r => isValidName(r.name) && isValidMessage(r.text));
        valid.reverse();
        setGlobalReviews(valid);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close kebab menu on click outside
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleStarClick = (n) => {
    setCurrentRating(n);
    if (n === 5) triggerGoldShower();
  };

  const handleEditClick = useCallback((review) => {
    setFormAction('update');
    setEditId(review.id);
    setName(review.name);
    setMessage(review.text || review.message || '');
    
    const standardTypes = ['Wedding', 'Corporate Event', 'Birthday Party'];
    if (standardTypes.includes(review.eventType)) {
      setEventType(review.eventType);
      setOtherEventType('');
    } else {
      setEventType('Other');
      setOtherEventType(review.eventType || '');
    }
    setCurrentRating(parseInt(review.rating) || 5);
    
    setTimeout(() => {
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const cancelEdit = useCallback(() => {
    setFormAction('create');
    setEditId('');
    setName('');
    setMessage('');
    setEventType('');
    setOtherEventType('');
    setCurrentRating(0);
  }, []);

  const handleDeleteClick = useCallback(async (id) => {
    if (!window.confirm('Delete this review?')) return;
    
    const params = new URLSearchParams();
    params.append('action', 'delete');
    params.append('id', id);
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: params,
        mode: 'no-cors'
      });
      
      setGlobalReviews(prev => prev.filter(r => r.id !== id));
      const updatedMy = myReviews.filter(r => r.id !== id);
      setMyReviews(updatedMy);
      localStorage.setItem('my_reviews', JSON.stringify(updatedMy));
    } catch {
      alert('Network error.');
    }
  }, [myReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isValidName(name)) {
      alert('Invalid Name (letters only, min 2 chars).');
      return;
    }
    if (!isValidMessage(message)) {
      alert('Invalid Message (min 4 chars).');
      return;
    }
    
    setSubmitting(true);
    const finalEventType = eventType === 'Other' ? otherEventType.trim() : eventType;
    const timeStr = new Date().toLocaleString();
    
    const params = new URLSearchParams();
    params.append('action', formAction);
    params.append('name', name.trim());
    params.append('text', message.trim());
    params.append('rating', currentRating.toString());
    params.append('eventType', finalEventType);
    params.append('time', timeStr);
    
    let finalId = editId;
    if (formAction === 'create') {
      finalId = generateUUID();
      params.append('id', finalId);
    } else {
      params.append('id', editId);
    }
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: params,
        mode: 'no-cors'
      });
      
      alert(formAction === 'create' ? 'Review Submitted!' : 'Review Updated!');
      
      if (formAction === 'create') {
        const newReviewEntry = { id: finalId, timestamp: Date.now() };
        const updatedMy = [...myReviews, newReviewEntry];
        setMyReviews(updatedMy);
        localStorage.setItem('my_reviews', JSON.stringify(updatedMy));
        
        const newReview = {
          id: finalId,
          name: name.trim(),
          text: message.trim(),
          rating: currentRating,
          eventType: finalEventType,
          time: timeStr
        };
        setGlobalReviews(prev => [newReview, ...prev]);
        if (currentRating >= 4) triggerGoldShower();
      } else {
        setGlobalReviews(prev => prev.map(r => {
          if (r.id === finalId) {
            return {
              ...r,
              name: name.trim(),
              text: message.trim(),
              rating: currentRating,
              eventType: finalEventType
            };
          }
          return r;
        }));
      }
      cancelEdit();
    } catch {
      alert('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const allReviews = [...globalReviews, ...hardcodedReviews];
  // Duplicate 4x to ensure there's enough content to fill any ultra-wide screen and scroll infinitely
  const marqueeReviews = [...allReviews, ...allReviews, ...allReviews, ...allReviews];

  const showForm = currentRating > 0 || formAction === 'update';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sectionCSS }} />
      
      <section id="reviews-section" className="rv-section">
        <div className="rv-dot-bg"></div>

        <div className="rv-container">
          {/* Header */}
          <motion.div
            className="rv-header"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="rv-eyebrow">Review &amp; Feedback</span>
            <h2 className="rv-title">Client Stories</h2>
            <div className="rv-title-bar"></div>
          </motion.div>

          {/* Loader */}
          {loading && (
            <div id="reviews-loader" className="rv-loader-wrap">
              <div className="rv-spinner"></div>
              <p className="rv-loader-text">Loading Reviews…</p>
            </div>
          )}
        </div>

        {/* Infinite Marquee - Full Width */}
        <div className="rv-marquee-wrapper">
            <div className="rv-nav-arrows">
              <button 
                className="rv-arrow" 
                onClick={() => handleManualScroll('left')}
                aria-label="Previous Reviews"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className="rv-arrow" 
                onClick={() => handleManualScroll('right')}
                aria-label="Next Reviews"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div 
              className="rv-marquee-container" 
              ref={scrollRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => {
                if (!pauseTimeout.current) setIsPaused(false);
              }}
            >
              <div className="rv-marquee-track">
                {marqueeReviews.map((review, i) => {
                  const isMine = myReviews.some(m => m.id === review.id);
                  const stars = '★'.repeat(Math.min(parseInt(review.rating) || 5, 5));
                  let displayTime = review.time || review.date || '';
                  if (displayTime && displayTime.includes('T')) {
                    try { displayTime = new Date(displayTime).toLocaleString(); } catch {}
                  }
                  const entry = myReviews.find(m => m.id === review.id);
                  const canDelete = entry && (Date.now() - entry.timestamp) < 3600000;
                  
                  // Using a unique key combination for duplicated elements
                  const uniqueKey = `${review.id || 'rev'}-${i}`;

                  return (
                    <div key={uniqueKey} className="rv-card">
                      {isMine && (
                        <div className="kebab-wrap">
                          <button
                            className="kebab-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === review.id ? null : review.id);
                            }}
                            title="Options"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="6" r="2" />
                              <circle cx="12" cy="18" r="2" />
                            </svg>
                          </button>
                          
                          {activeMenuId === review.id && (
                            <div className="menu-dropdown" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => handleEditClick(review)} className="menu-item">✏️ Edit</button>
                              {canDelete && (
                                <button onClick={() => handleDeleteClick(review.id)} className="menu-item" style={{ color: '#f87171' }}>🗑 Delete</button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="rv-card-stars">{stars}</div>
                      <p className="rv-card-text">"{review.text || review.message}"</p>
                      <div className="rv-card-divider"></div>
                      <p className="rv-card-name">{review.name}</p>
                      <p className="rv-card-type">{review.eventType}</p>
                      {displayTime && <span className="rv-card-time">{displayTime}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        <div className="rv-container">
          {/* Rating Form */}
          <motion.div
            className="rv-form-wrap"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="rv-form-title" id="form-title">
              {formAction === 'update' ? 'Edit Your Review' : 'Rate Our Performance'}
            </h3>

            <div
              className="rv-stars-row"
              id="star-container"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((starNum) => {
                const isLit = hoverRating > 0 ? starNum <= hoverRating : starNum <= currentRating;
                return (
                  <button
                    type="button"
                    key={starNum}
                    onClick={() => handleStarClick(starNum)}
                    onMouseEnter={() => setHoverRating(starNum)}
                    className="rv-star-btn"
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill={isLit ? '#C5A059' : 'none'}
                      stroke={isLit ? '#C5A059' : '#6B7280'}
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                );
              })}
            </div>

            <div id="rating-text" className="rv-rating-label">
              {currentRating ? `You selected ${currentRating} star${currentRating > 1 ? 's' : ''}` : ''}
            </div>

            <form
              id="review-form"
              className={`rv-form ${showForm ? '' : 'hidden'}`}
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="name"
                id="review-name"
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rv-input"
              />

              <div className="rv-select-wrap">
                <select
                  name="event_type"
                  id="review-event-type"
                  required
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="rv-select"
                >
                  <option value="" disabled>Select Event Type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Other">Other (Please Specify)</option>
                </select>
                <div className="rv-select-arrow">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div id="other-event-container" className={eventType === 'Other' ? '' : 'hidden'}>
                <input
                  type="text"
                  id="other-event-input"
                  placeholder="Specify your event…"
                  required={eventType === 'Other'}
                  value={otherEventType}
                  onChange={(e) => setOtherEventType(e.target.value)}
                  className="rv-input rv-input-other"
                />
              </div>

              <textarea
                name="message"
                id="review-message"
                required
                rows="3"
                placeholder="Tell us about your experience…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rv-textarea"
              ></textarea>

              <button
                type="submit"
                id="submit-btn"
                disabled={submitting}
                className="rv-submit-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2z" />
                </svg>
                <span>{submitting ? 'Processing…' : formAction === 'create' ? 'Submit' : 'Update Review'}</span>
              </button>
              
              {formAction === 'update' && (
                <button
                  type="button"
                  id="cancel-edit-btn"
                  onClick={cancelEdit}
                  className="rv-cancel-btn"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </>
  );
}
