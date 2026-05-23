import { useEffect } from 'react';

const sectionHTML = `
<section id="reviews-section" class="rv-section">
  <div class="rv-dot-bg"></div>

  <div class="rv-container">

    <!-- Header -->
    <div class="rv-header reveal">
      <span class="rv-eyebrow">Review &amp; Feedback</span>
      <h2 class="rv-title">Client Stories</h2>
      <div class="rv-title-bar"></div>
    </div>

    <!-- Loader -->
    <div id="reviews-loader" class="rv-loader-wrap hidden">
      <div class="rv-spinner"></div>
      <p class="rv-loader-text">Loading Reviews…</p>
    </div>

    <!-- Cards Grid -->
    <div id="testimonials-grid" class="rv-grid"></div>

    <!-- See More / See Less toggle -->
    <div id="see-more-container" class="rv-toggle-wrap hidden">
      <button onclick="toggleSeeMore()" id="see-more-btn" class="rv-toggle-btn">See More Stories</button>
    </div>
    <div id="see-less-container" class="rv-toggle-wrap hidden">
      <button onclick="toggleSeeLess()" id="see-less-btn" class="rv-toggle-btn">See Less Stories</button>
    </div>

    <!-- Rating Form -->
    <div class="rv-form-wrap reveal">
      <h3 class="rv-form-title" id="form-title">Rate Our Performance</h3>

      <div class="rv-stars-row" id="star-container" onmouseleave="highlightStars(currentRating)">
        <button onclick="setRating(1,true)" onmouseenter="highlightStars(1)" class="rv-star-btn">
          <svg id="star-1" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <button onclick="setRating(2,true)" onmouseenter="highlightStars(2)" class="rv-star-btn">
          <svg id="star-2" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <button onclick="setRating(3,true)" onmouseenter="highlightStars(3)" class="rv-star-btn">
          <svg id="star-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <button onclick="setRating(4,true)" onmouseenter="highlightStars(4)" class="rv-star-btn">
          <svg id="star-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
        <button onclick="setRating(5,true)" onmouseenter="highlightStars(5)" class="rv-star-btn">
          <svg id="star-5" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </button>
      </div>

      <div id="rating-text" class="rv-rating-label"></div>

      <form id="review-form" class="rv-form hidden">
        <input type="hidden" name="action"   id="form-action" value="create">
        <input type="hidden" name="edit_id"  id="edit-id"    value="">

        <input  type="text"  name="name"     id="review-name"       required
                placeholder="Your Name"
                class="rv-input" />

        <div class="rv-select-wrap">
          <select name="event_type" id="review-event-type" required onchange="toggleOtherInput(this)" class="rv-select">
            <option value="" disabled selected>Select Event Type</option>
            <option value="Wedding">Wedding</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Birthday Party">Birthday Party</option>
            <option value="Other">Other (Please Specify)</option>
          </select>
          <div class="rv-select-arrow">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>

        <div id="other-event-container" class="hidden">
          <input type="text" id="other-event-input" placeholder="Specify your event…" class="rv-input rv-input-other" />
        </div>

        <textarea name="message" id="review-message" required rows="3"
                  placeholder="Tell us about your experience…"
                  class="rv-textarea"></textarea>

        <button type="submit" id="submit-btn" class="rv-submit-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2z"/></svg>
          <span id="submit-text">Submit Script</span>
        </button>
        <button type="button" id="cancel-edit-btn" onclick="cancelEdit()" class="rv-cancel-btn hidden">Cancel Edit</button>
      </form>
    </div>

  </div>
</section>
`;

const sectionCSS = `
  /* ── Section Shell ────────────────────────────────────────────────── */
  .rv-section {
    position: relative;
    padding: 96px 0;
    background: #0d2d1f;
    color: #fff;
    border-top: 1px solid rgba(255,255,255,.08);
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
    font-family: 'Playfair Display', 'Georgia', serif;
    font-size: clamp(2.6rem, 5vw, 3.8rem);
    font-weight: 400;
    color: #fff;
    margin: 0;
    letter-spacing: -.01em;
    line-height: 1.1;
  }
  .rv-title-bar { display: none; }

  /* ── Loader ─────────────────────────────────────────────────── */
  .rv-loader-wrap { text-align: center; padding: 24px 0; }
  .rv-spinner {
    width: 22px; height: 22px;
    border: 3px solid #1a4f3d;
    border-top-color: #C5A059;
    border-radius: 50%;
    animation: rv-spin 1s linear infinite;
    margin: 0 auto 8px;
  }
  @keyframes rv-spin { to { transform: rotate(360deg); } }
  .rv-loader-text { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 300; color: #C5A059; letter-spacing: .05em; }

  /* ── Grid ────────────────────────────────────────────────────── */
  .rv-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 32px;
  }
  @media (max-width: 700px) { .rv-grid { grid-template-columns: 1fr; } }
  @media (min-width: 701px) and (max-width: 900px) { .rv-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── Card ────────────────────────────────────────────────── */
  .rv-card {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 14px;
    padding: 24px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
    transition: border-color .25s, transform .25s, box-shadow .25s;
    backdrop-filter: blur(8px);
  }
  .rv-card:hover {
    border-color: rgba(197,160,89,.45);
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,.35);
  }
  .rv-card-stars { color: #C5A059; font-size: 14px; letter-spacing: 2px; }
  .rv-card-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    line-height: 1.75;
    color: rgba(255,255,255,.75);
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
    color: #fff;
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
    color: rgba(255,255,255,.22);
  }

  /* Kebab menu */
  .kebab-wrap { position: absolute; top: 10px; right: 10px; z-index: 200; }
  .kebab-btn { background: none; border: none; cursor: pointer; color: #C5A059; opacity: .65; padding: 4px; display: flex; align-items: center; transition: opacity .2s; }
  .kebab-btn:hover { opacity: 1; }
  .menu-dropdown { position: absolute; top: calc(100% + 4px); right: 0; background: #0a2416; border: 1px solid #C5A059; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.55); min-width: 120px; overflow: hidden; }
  .menu-item { display: block; width: 100%; text-align: left; padding: 10px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300; color: #fff; background: none; border: none; cursor: pointer; transition: background .15s, color .15s; }
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
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(197,160,89,.25);
    border-radius: 18px;
    padding: 40px 36px 36px;
    backdrop-filter: blur(10px);
  }
  .rv-form-title {
    text-align: center;
    font-family: 'Playfair Display', 'Georgia', serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #C5A059;
    margin: 0 0 20px;
    letter-spacing: .03em;
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
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(197,160,89,.18);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    outline: none;
    transition: border-color .3s, background .3s;
    box-sizing: border-box;
  }
  .rv-input::placeholder, .rv-textarea::placeholder { color: rgba(255,255,255,.28); font-weight: 300; }
  .rv-input:focus, .rv-textarea:focus { border-color: rgba(197,160,89,.55); background: rgba(197,160,89,.04); }
  .rv-textarea { resize: none; }
  .rv-input-other { border-left: 3px solid #C5A059; }

  .rv-select-wrap { position: relative; }
  .rv-select {
    width: 100%;
    padding: 14px 40px 14px 18px;
    border-radius: 10px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(197,160,89,.18);
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color .3s, background .3s;
    box-sizing: border-box;
  }
  .rv-select:focus { border-color: rgba(197,160,89,.55); background: rgba(197,160,89,.04); }
  .rv-select option { background: #0d2d1f; }
  .rv-select-arrow {
    pointer-events: none;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,.3);
  }

  .rv-submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 15px;
    background: #C5A059;
    color: #0d2d1f;
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
    background: none; border: none; color: rgba(255,255,255,.4);
    font-size: 12px; cursor: pointer; text-decoration: underline;
    transition: color .2s; margin-top: 4px; align-self: center;
  }
  .rv-cancel-btn:hover { color: #fff; }

  /* ── Confetti ────────────────────────────────────────────────── */
  @keyframes rv-fall { 0%{transform:translateY(-10vh) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
  .rv-confetti { position:fixed; top:-10px; z-index:9999; pointer-events:none; border-radius:2px; animation:rv-fall linear forwards; }

  /* ── Reveal ──────────────────────────────────────────────────── */
  .reveal { opacity:0; transform:translateY(24px); transition:all .7s cubic-bezier(.5,0,0,1); }
  .reveal.active { opacity:1; transform:translateY(0); }
  .hidden { display:none !important; }
`;

const sectionJS = `
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhtBle7BrR2Ip8Q_-rQI1Y3tTQ37PDxGdDyBXRnQimAOVFUANHwG7RStXeHJFvY5bHSQ/exec";

  let currentRating = 0;
  let isExpanded = false;
  let globalReviews = [];
  let myReviews = JSON.parse(localStorage.getItem('my_reviews') || '[]');

  const hardcodedReviews = [
    { name: "Adnan & Fatima",      text: "Like walking onto a movie set. Absolutely breathtaking execution. They made our dream wedding a reality.",                                     rating: 5, eventType: "Wedding",        time: "10/28/2023 02:30 PM" },
    { name: "TechSolutions",       text: "A masterpiece of corporate event planning. Professional, timely, and executed with absolute precision.",                                      rating: 5, eventType: "Corporate Event", time: "11/15/2023 10:00 AM" },
    { name: "Sara & Rahul",        text: "The attention to detail is unmatched! Every guest was amazed by the aesthetic and arrangements.",                                            rating: 5, eventType: "Wedding",        time: "12/03/2023 06:00 PM" },
    { name: "Priya & Arjun",       text: "Haroon's team made our traditional wedding a grand success. The best event managers in Kasala without a doubt!",                             rating: 5, eventType: "Wedding",        time: "01/14/2024 11:00 AM" },
    { name: "Skyline Builders",    text: "Flawless execution for our annual meet. Highly recommend their corporate event services.",                                                   rating: 4, eventType: "Corporate Event", time: "02/05/2024 09:30 AM" },
    { name: "Mohammed & Aisha",    text: "The decor, the coordination, the hospitality… everything was top notch. Thank you for making our day special.",                             rating: 5, eventType: "Wedding",        time: "03/22/2024 05:00 PM" },
  ];

  function generateUUID() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

  function isValidName(text) {
    const nameRegex = /^[a-zA-Z\\s\\.&]+$/;
    const noRepeat = !/(.)\\1{2,}/.test(text);
    return nameRegex.test(text) && text.trim().length >= 2 && noRepeat;
  }
  function isValidMessage(text) {
    if (text.length < 4) return false;
    if (!/[aeiouyAEIOUY]/.test(text)) return false;
    if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(text)) return false;
    if (/(.)\\1{3,}/.test(text)) return false;
    return true;
  }

  function fetchReviews() {
    const loader = document.getElementById('reviews-loader');
    if (loader) loader.classList.remove('hidden');
    fetch(GOOGLE_SCRIPT_URL)
      .then(r => r.json())
      .then(data => {
        globalReviews = data.filter(r => isValidName(r.name) && isValidMessage(r.text));
        globalReviews.reverse();
        loadReviews();
      })
      .catch(() => loadReviews())
      .finally(() => { if (loader) loader.classList.add('hidden'); });
  }

  function loadReviews() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const all = [...globalReviews, ...hardcodedReviews];
    all.forEach((review, i) => grid.appendChild(createCard(review, i)));
    updateVisibility();
  }

  function createCard(review, index) {
    const el = document.createElement('div');
    el.className = 'rv-card';
    el.dataset.index = index;

    const isMine = myReviews.some(m => m.id === review.id);
    const menuHtml = isMine ? buildMenu(review) : '';

    const stars = '★'.repeat(Math.min(parseInt(review.rating) || 5, 5));
    let displayTime = review.time || review.date || '';
    if (displayTime && displayTime.includes('T')) displayTime = new Date(displayTime).toLocaleString();

    el.innerHTML = \`
      \${menuHtml}
      <div class="rv-card-stars">\${stars}</div>
      <p class="rv-card-text">"\${review.text}"</p>
      <div class="rv-card-divider"></div>
      <p class="rv-card-name">\${review.name}</p>
      <p class="rv-card-type">\${review.eventType}</p>
      \${displayTime ? \`<span class="rv-card-time">\${displayTime}</span>\` : ''}
    \`;
    return el;
  }

  function buildMenu(review) {
    const entry = myReviews.find(m => m.id === review.id);
    const canDelete = entry && (Date.now() - entry.timestamp) < 3600000;
    const deleteBtn = canDelete
      ? \`<button onclick="deleteReview('\${review.id}')" class="menu-item" style="color:#f87171">🗑 Delete</button>\`
      : '';
    return \`
      <div class="kebab-wrap">
        <button class="kebab-btn" onclick="toggleCardMenu(this)" title="Options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="18" r="2"/></svg>
        </button>
        <div class="menu-dropdown hidden">
          <button onclick="editReview('\${review.id}','\${review.name}','\${review.text.replace(/'/g,"'")}','\${review.rating}','\${review.eventType}')" class="menu-item">✏️ Edit</button>
          \${deleteBtn}
        </div>
      </div>
    \`;
  }

  function toggleCardMenu(btn) {
    const dropdown = btn.nextElementSibling;
    const isHidden = dropdown.classList.contains('hidden');
    // Close all open dropdowns first
    document.querySelectorAll('.menu-dropdown').forEach(el => el.classList.add('hidden'));
    // Open this one if it was closed
    if (isHidden) dropdown.classList.remove('hidden');
  }
  document.addEventListener('click', e => {
    if (!e.target.closest('.kebab-wrap'))
      document.querySelectorAll('.menu-dropdown').forEach(el => el.classList.add('hidden'));
  });

  function updateVisibility() {
    const cards = [...document.querySelectorAll('.rv-card')];
    const isMobile = window.innerWidth < 700;
    const limit = isMobile ? 3 : 6;
    let hidden = 0;
    cards.forEach((c, i) => {
      if (isExpanded || i < limit) c.classList.remove('hidden');
      else { c.classList.add('hidden'); hidden++; }
    });
    const more = document.getElementById('see-more-container');
    const less = document.getElementById('see-less-container');
    if (hidden > 0 && !isExpanded) { more?.classList.remove('hidden'); less?.classList.add('hidden'); }
    else if (isExpanded)            { more?.classList.add('hidden');    less?.classList.remove('hidden'); }
    else                            { more?.classList.add('hidden');    less?.classList.add('hidden'); }
  }
  function toggleSeeMore() { isExpanded = true;  updateVisibility(); }
  function toggleSeeLess()  {
    isExpanded = false; updateVisibility();
    document.getElementById('testimonials-grid')?.scrollIntoView({ behavior:'smooth', block:'start' });
  }
  window.addEventListener('resize', updateVisibility);

  function highlightStars(n) {
    for (let i = 1; i <= 5; i++) {
      const svg = document.getElementById(\`star-\${i}\`);
      if (!svg) continue;
      if (i <= n) { svg.setAttribute('fill','#C5A059'); svg.setAttribute('stroke','#C5A059'); }
      else         { svg.setAttribute('fill','none');    svg.setAttribute('stroke','#6B7280'); }
    }
  }

  function setRating(n, isUserAction = false) {
    currentRating = n;
    highlightStars(n);
    const label = document.getElementById('rating-text');
    if (label) label.innerText = n ? \`You selected \${n} star\${n > 1 ? 's' : ''}\` : '';
    const form = document.getElementById('review-form');
    if (form) { form.classList.remove('hidden'); }
    if (isUserAction && n === 5) triggerGoldShower();
  }

  function triggerGoldShower() {
    const colors = ['#C5A059','#FFD700','#DAA520','#F0E68C'];
    const end = Date.now() + 3500;
    const iv = setInterval(() => {
      if (Date.now() > end) { clearInterval(iv); return; }
      for (let i = 0; i < 8; i++) {
        const c = document.createElement('div');
        c.className = 'rv-confetti';
        c.style.cssText = \`left:\${Math.random()*100}vw;animation-duration:\${Math.random()*1.5+1.5}s;background:\${colors[Math.floor(Math.random()*4)]};width:\${Math.random()*7+4}px;height:\${Math.random()*7+4}px;\`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 3200);
      }
    }, 100);
  }

  // Form submit
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-btn');
      const submitText = document.getElementById('submit-text');
      submitBtn.disabled = true; submitText.innerText = 'Processing…';

      const fd = new FormData(reviewForm);
      const action  = document.getElementById('form-action').value;
      const editId  = document.getElementById('edit-id').value;
      const name    = fd.get('name');
      const message = fd.get('message');
      let   evType  = document.getElementById('review-event-type').value;
      const otherIn = document.getElementById('other-event-input');

      if (!isValidName(name))    { alert('Invalid Name (letters only, min 2 chars).'); document.getElementById('review-name').focus(); reset(); return; }
      if (!isValidMessage(message)) { alert('Invalid Message (min 4 chars).'); document.getElementById('review-message').focus(); reset(); return; }
      if (evType === 'Other') evType = otherIn.value.trim();

      const params = new URLSearchParams();
      params.append('action', action);
      params.append('name', name);
      params.append('text', message);
      params.append('rating', currentRating);
      params.append('eventType', evType);
      params.append('time', new Date().toLocaleString());

      let finalId = editId;
      if (action === 'create') { finalId = generateUUID(); params.append('id', finalId); }
      else                     { params.append('id', editId); }

      fetch(GOOGLE_SCRIPT_URL, { method:'POST', body:params, mode:'no-cors' })
        .then(() => {
          alert(action === 'create' ? 'Review Submitted!' : 'Review Updated!');
          if (action === 'create') {
            myReviews.push({ id: finalId, timestamp: Date.now() });
            localStorage.setItem('my_reviews', JSON.stringify(myReviews));
            globalReviews.unshift({ id:finalId, name, text:message, rating:currentRating, eventType:evType, time:new Date().toLocaleString() });
            if (currentRating >= 4) triggerGoldShower();
          } else {
            const idx = globalReviews.findIndex(r => r.id === finalId);
            if (idx !== -1) globalReviews[idx] = { ...globalReviews[idx], name, text:message, rating:currentRating, eventType:evType };
          }
          cancelEdit(); loadReviews();
        })
        .catch(() => { alert('Network error.'); reset(); });

      function reset() { submitBtn.disabled = false; submitText.innerText = action === 'create' ? 'Submit Script' : 'Update Review'; }
    });
  }

  function toggleOtherInput(sel) {
    const c = document.getElementById('other-event-container');
    const i = document.getElementById('other-event-input');
    if (sel.value === 'Other') { c.classList.remove('hidden'); i.required = true; i.focus(); }
    else                        { c.classList.add('hidden'); i.required = false; i.value = ''; }
  }

  function editReview(id, name, text, rating, eventType) {
    document.getElementById('form-title').innerText = 'Edit Your Review';
    document.getElementById('form-action').value = 'update';
    document.getElementById('edit-id').value = id;
    document.getElementById('review-name').value = name;
    document.getElementById('review-message').value = text;
    document.getElementById('review-event-type').value = eventType;
    if (eventType === 'Other') toggleOtherInput(document.getElementById('review-event-type'));
    setRating(parseInt(rating), false);
    document.getElementById('submit-text').innerText = 'Update Review';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    document.getElementById('review-form').classList.remove('hidden');
    document.getElementById('review-form').scrollIntoView({ behavior:'smooth' });
  }

  function cancelEdit() {
    reviewForm.reset();
    document.getElementById('form-title').innerText = 'Rate Our Performance';
    document.getElementById('form-action').value = 'create';
    document.getElementById('edit-id').value = '';
    document.getElementById('submit-text').innerText = 'Submit Script';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    document.getElementById('other-event-container').classList.add('hidden');
    document.getElementById('review-form').classList.add('hidden');
    setRating(0, false);
  }

  function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    const params = new URLSearchParams(); params.append('action','delete'); params.append('id',id);
    fetch(GOOGLE_SCRIPT_URL, { method:'POST', body:params, mode:'no-cors' }).then(() => {
      globalReviews = globalReviews.filter(r => r.id !== id);
      myReviews = myReviews.filter(r => r.id !== id);
      localStorage.setItem('my_reviews', JSON.stringify(myReviews));
      loadReviews();
    });
  }

  // Reveal observer
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); else e.target.classList.remove('active'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  fetchReviews();
`;

export default function Reviews() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'reviews-injected-css';
    style.textContent = sectionCSS;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.id = 'reviews-injected-js';
    script.textContent = sectionJS;
    document.body.appendChild(script);

    return () => {
      document.getElementById('reviews-injected-css')?.remove();
      document.getElementById('reviews-injected-js')?.remove();
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: sectionHTML }} />;
}
