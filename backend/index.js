'use strict';
const express      = require('express');
const cors         = require('cors');
const multer       = require('multer');
const path         = require('path');
const fs           = require('fs');
const crypto       = require('crypto');
const bcrypt       = require('bcrypt');
const jwt          = require('jsonwebtoken');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Fail-fast: refuse to start without critical secrets ───────────────────
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET          = process.env.JWT_SECRET;
if (!JWT_SECRET || !ADMIN_PASSWORD_HASH) {
  console.error('❌  FATAL: JWT_SECRET and ADMIN_PASSWORD_HASH must be set in .env');
  process.exit(1);
}

// Google Apps Script URL — kept entirely server-side, never sent to the browser
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwhtBle7BrR2Ip8Q_-rQI1Y3tTQ37PDxGdDyBXRnQimAOVFUANHwG7RStXeHJFvY5bHSQ/exec';

// ── In-memory token revocation set ────────────────────────────────────────
// Stores revoked JWT strings until their natural expiry so stolen tokens can't be reused.
const revokedTokens = new Set();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP handled per-route on /admin

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3001')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '350mb' }));
app.use(express.urlencoded({ extended: true, limit: '350mb' }));

// ── Rate limiters ─────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});

// ── Upload directories ────────────────────────────────────────────────────
const galleryDir  = path.join(__dirname, 'uploads', 'gallery');
const heroDir     = path.join(__dirname, 'uploads', 'hero');
const aboutDir    = path.join(__dirname, 'uploads', 'about');
const reviewsFile = path.join(__dirname, 'uploads', 'reviews.json');
[galleryDir, heroDir, aboutDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── JSON metadata helpers ─────────────────────────────────────────────────
const metaFile      = path.join(galleryDir, 'metadata.json');
const aboutMetaFile = path.join(aboutDir,   'metadata.json');
const heroMetaFile  = path.join(heroDir,    'metadata.json');

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const readMeta       = ()  => readJSON(metaFile,      []);
const writeMeta      = d   => writeJSON(metaFile, d);
const readAboutMeta  = ()  => readJSON(aboutMetaFile, []);
const writeAboutMeta = d   => writeJSON(aboutMetaFile, d);
const readHeroMeta   = ()  => readJSON(heroMetaFile,  null);
const writeHeroMeta  = d   => writeJSON(heroMetaFile, d);
const readReviews    = ()  => readJSON(reviewsFile,   []);
const writeReviews   = d   => writeJSON(reviewsFile,  d);

// ── Path traversal guard ──────────────────────────────────────────────────
function safeFilePath(dir, filename) {
  if (!filename || /[/\\<>:"|?*\x00-\x1f]/.test(filename)) return null;
  const resolved = path.resolve(dir, filename);
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) return null;
  return resolved;
}

// ── Multer storage factory ────────────────────────────────────────────────
function makeStorage(dir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename:    (_req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const safe = crypto.randomBytes(16).toString('hex') + ext;
      cb(null, safe);
    },
  });
}

const imageFilter = (_req, file, cb) => {
  cb(null, /\.(jpe?g|png|webp|gif|avif)$/i.test(path.extname(file.originalname)));
};

const heroMediaFilter = (_req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  const ok   = /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|avi|mkv)$/i.test(ext) ||
               mime.startsWith('image/') || mime.startsWith('video/');
  cb(null, ok);
};

const FILE_LIMIT      = { fileSize: 20  * 1024 * 1024 };  // 20 MB for gallery/about
const HERO_FILE_LIMIT = { fileSize: 300 * 1024 * 1024 };  // 300 MB for hero
const uploadGallery = multer({ storage: makeStorage(galleryDir), fileFilter: imageFilter,    limits: FILE_LIMIT      });
const uploadHero    = multer({ storage: makeStorage(heroDir),    fileFilter: heroMediaFilter, limits: HERO_FILE_LIMIT });
const uploadAbout   = multer({ storage: makeStorage(aboutDir),   fileFilter: imageFilter,    limits: FILE_LIMIT      });

// ── Admin auth middleware (JWT cookie) ────────────────────────────────────
function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies.admin_token;
  if (!token)                  return res.status(401).json({ error: 'Unauthorized' });
  if (revokedTokens.has(token)) return res.status(401).json({ error: 'Session expired' });
  try {
    req.adminPayload = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// ── HTML escape helper (used in ADMIN_HTML template) ─────────────────────
function escHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Admin Panel HTML ──────────────────────────────────────────────────────
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Admin Panel · Haroon's Events</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#060f0a;--green2:#091409;--green3:#0d1f0f;
  --gold:#C5A059;--gold2:#e2c98a;--gold-dim:rgba(197,160,89,.15);
  --white:#f5f0e8;--text:rgba(245,240,232,.6);--text-dim:rgba(245,240,232,.35);
  --card:rgba(10,25,12,.85);--border:rgba(197,160,89,.12);
  --err:#e05555;--ok:#4caf7d;
}
html,body{height:100%;background:var(--green);color:var(--white);font-family:'DM Sans',sans-serif;font-weight:300}

/* ── Login ── */
#login-screen{
  position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(ellipse at 50% 0%,rgba(30,60,20,.45),transparent 70%),var(--green);
  z-index:100;
}
.login-card{
  background:rgba(9,20,9,.92);border:1px solid var(--border);border-radius:18px;
  padding:52px 44px;width:100%;max-width:400px;text-align:center;
  box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(197,160,89,.06);
  backdrop-filter:blur(20px);
}
.login-logo{
  width:52px;height:52px;border-radius:50%;
  background:rgba(197,160,89,.08);border:1px solid rgba(197,160,89,.2);
  display:flex;align-items:center;justify-content:center;margin:0 auto 24px;
}
.login-title{
  font-family:'Cinzel',serif;font-size:18px;letter-spacing:.35em;
  color:var(--gold);text-transform:uppercase;margin-bottom:6px;
}
.login-sub{font-size:11px;color:var(--text-dim);letter-spacing:.12em;margin-bottom:36px}
.login-card form{display:flex;flex-direction:column;gap:14px;text-align:left}
.login-card label{font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:var(--text);margin-bottom:2px;display:block}
.login-card input{
  width:100%;padding:13px 16px;background:rgba(255,255,255,.04);
  border:1px solid var(--border);border-radius:8px;color:var(--white);
  font-family:'DM Sans',sans-serif;font-size:13px;outline:none;
  transition:border-color .25s;
}
.login-card input:focus{border-color:rgba(197,160,89,.45)}
.btn-gold{
  width:100%;padding:14px;background:linear-gradient(135deg,#C5A059,#e2c98a);
  border:none;border-radius:8px;color:#060f0a;font-family:'Cinzel',serif;
  font-size:10px;letter-spacing:.3em;text-transform:uppercase;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  transition:opacity .2s,transform .15s;margin-top:8px;
}
.btn-gold:hover{opacity:.9;transform:translateY(-1px)}
.btn-gold:disabled{opacity:.5;cursor:default;transform:none}

/* ── Shared ── */
.hidden{display:none!important}
.err{color:var(--err);font-size:12px;padding:8px 12px;background:rgba(224,85,85,.08);border-radius:6px;border:1px solid rgba(224,85,85,.2)}
.ok{color:var(--ok);font-size:12px;padding:8px 12px;background:rgba(76,175,125,.08);border-radius:6px;border:1px solid rgba(76,175,125,.18)}

/* ── Admin screen ── */
#admin-screen{min-height:100vh;display:flex;flex-direction:column}
.adm-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 32px;background:rgba(9,20,9,.95);
  border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;
}
.adm-hdr-l{display:flex;align-items:center;gap:14px}
.adm-logo{
  width:36px;height:36px;border-radius:50%;
  background:rgba(197,160,89,.08);border:1px solid rgba(197,160,89,.2);
  display:flex;align-items:center;justify-content:center;
}
.adm-brand{font-family:'Cinzel',serif;font-size:13px;letter-spacing:.25em;color:var(--gold)}
.adm-subb{font-size:10px;color:var(--text-dim);letter-spacing:.1em;margin-top:1px}
.signout{
  padding:8px 18px;background:transparent;border:1px solid var(--border);
  border-radius:6px;color:var(--text);font-size:11px;letter-spacing:.15em;
  cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;
}
.signout:hover{border-color:rgba(197,160,89,.4);color:var(--gold)}

.adm-body{flex:1;padding:32px;max-width:1100px;margin:0 auto;width:100%}

/* ── Tabs ── */
.tabs{display:flex;gap:6px;margin-bottom:28px;border-bottom:1px solid var(--border);padding-bottom:0}
.tab-btn{
  padding:10px 22px;background:transparent;border:none;border-bottom:2px solid transparent;
  color:var(--text);font-size:12px;letter-spacing:.12em;cursor:pointer;
  transition:all .2s;font-family:'DM Sans',sans-serif;margin-bottom:-1px;
}
.tab-btn:hover{color:var(--white)}
.tab-btn.active{color:var(--gold);border-bottom-color:var(--gold)}

/* ── Panels ── */
.panel{display:none}.panel.active{display:block}

/* ── Section card ── */
.sec{
  background:rgba(9,20,9,.7);border:1px solid var(--border);border-radius:12px;
  padding:28px;margin-bottom:24px;
}
.sec-title{
  font-family:'Cinzel',serif;font-size:12px;letter-spacing:.25em;
  color:var(--gold);text-transform:uppercase;margin-bottom:20px;
  display:flex;align-items:center;gap:10px;
}
.sec-title::after{content:'';flex:1;height:1px;background:var(--border)}

/* ── Drop zones ── */
.dropzone{
  border:1.5px dashed var(--border);border-radius:10px;padding:48px 24px;
  text-align:center;cursor:pointer;transition:all .25s;position:relative;
  background:rgba(197,160,89,.02);
}
.dropzone:hover,.dropzone.drag{border-color:rgba(197,160,89,.45);background:rgba(197,160,89,.04)}
.dropzone.has-preview{padding:0;border-style:solid;border-color:rgba(197,160,89,.3)}
.dropzone.has-preview img.prev-img{width:100%;max-height:280px;object-fit:cover;border-radius:8px;display:block}
.dz-icon{font-size:28px;margin-bottom:12px}
.dz-title{font-size:13px;color:var(--white);margin-bottom:6px}
.dz-sub{font-size:11px;color:var(--text-dim)}
.prev-ov{
  position:absolute;inset:0;background:rgba(6,15,10,.75);border-radius:8px;
  display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;
}
.prev-name{font-size:13px;color:var(--white)}
.prev-size{font-size:11px;color:var(--text-dim)}

/* ── Fields ── */
.fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:18px}
.field{display:flex;flex-direction:column;gap:6px}
.field label{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--text)}
.field input,.field select{
  padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid var(--border);
  border-radius:7px;color:var(--white);font-size:13px;font-family:'DM Sans',sans-serif;
  outline:none;transition:border-color .2s;
}
.field input:focus,.field select:focus{border-color:rgba(197,160,89,.45)}
.field select option{background:#0d1f0f}

/* ── Category buttons ── */
.cats{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.cat-btn{
  padding:7px 18px;border:1px solid var(--border);border-radius:20px;
  background:transparent;color:var(--text);font-size:11px;letter-spacing:.1em;cursor:pointer;
  transition:all .2s;font-family:'DM Sans',sans-serif;
}
.cat-btn:hover{border-color:rgba(197,160,89,.3);color:var(--white)}
.cat-btn.active{border-color:var(--gold);background:rgba(197,160,89,.1);color:var(--gold)}

/* ── Upload buttons ── */
.btn-upload{
  width:100%;margin-top:18px;padding:13px;
  background:linear-gradient(135deg,#C5A059,#e2c98a);
  border:none;border-radius:8px;color:#060f0a;
  font-family:'Cinzel',serif;font-size:10px;letter-spacing:.25em;text-transform:uppercase;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
  transition:opacity .2s,transform .15s;
}
.btn-upload:hover:not(:disabled){opacity:.9;transform:translateY(-1px)}
.btn-upload:disabled{opacity:.45;cursor:default}
.btn-danger{
  width:100%;margin-top:10px;padding:11px;
  background:transparent;border:1px solid rgba(224,85,85,.35);
  border-radius:8px;color:rgba(224,85,85,.7);
  font-size:11px;letter-spacing:.12em;cursor:pointer;
  transition:all .2s;font-family:'DM Sans',sans-serif;
}
.btn-danger:hover{border-color:var(--err);color:var(--err);background:rgba(224,85,85,.05)}

/* ── Gallery queue ── */
#gal-queue{margin-top:18px;display:none}
.gal-queue-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.gal-queue-hdr span{font-size:11px;color:var(--text)}
.gal-queue-hdr button{
  font-size:10px;color:var(--err);background:none;border:none;cursor:pointer;
  letter-spacing:.1em;font-family:'DM Sans',sans-serif;
}
#gal-thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px}
#gal-progress{margin-top:14px;font-size:11px;color:var(--text);display:none}
.prog-bar-wrap{height:4px;background:rgba(197,160,89,.12);border-radius:2px;margin-top:6px;overflow:hidden}
.prog-bar{height:100%;background:var(--gold);border-radius:2px;width:0%;transition:width .3s}

/* ── Gallery image list ── */
.img-list-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.img-count-badge{
  padding:3px 12px;background:rgba(197,160,89,.08);border:1px solid var(--border);
  border-radius:20px;font-size:10px;color:var(--gold);letter-spacing:.12em;
}
#img-list{display:flex;flex-direction:column;gap:8px}
.img-item{
  display:flex;align-items:center;gap:14px;padding:10px 14px;
  background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;
  transition:background .2s;
}
.img-item:hover{background:rgba(255,255,255,.05)}
.img-thumb{width:52px;height:52px;object-fit:cover;border-radius:6px;flex-shrink:0}
.img-info{flex:1;min-width:0}
.img-title{font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.img-meta{font-size:10px;color:var(--text-dim);margin-top:2px;letter-spacing:.06em}
.del-btn{
  width:28px;height:28px;border-radius:50%;border:1px solid rgba(224,85,85,.3);
  background:transparent;color:rgba(224,85,85,.6);font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;
}
.del-btn:hover{background:rgba(224,85,85,.1);color:var(--err);border-color:var(--err)}

/* ── Hero current ── */
#hero-cur-wrap{margin-bottom:18px;border-radius:10px;overflow:hidden;border:1px solid var(--border);position:relative}
#hero-cur-img{width:100%;max-height:220px;object-fit:cover;display:block}
.hero-cur-lbl{
  position:absolute;top:10px;left:10px;padding:3px 10px;
  background:rgba(197,160,89,.15);border:1px solid rgba(197,160,89,.25);
  border-radius:20px;font-size:9px;color:var(--gold);letter-spacing:.2em;backdrop-filter:blur(6px);
}

/* ── Feedback ── */
.fb-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:18px;flex-wrap:wrap}
.fb-sort-btn{
  padding:6px 14px;border:1px solid var(--border);border-radius:20px;
  background:transparent;color:var(--text);font-size:10px;letter-spacing:.1em;cursor:pointer;
  transition:all .2s;font-family:'DM Sans',sans-serif;
}
.fb-sort-btn:hover{color:var(--white);border-color:rgba(197,160,89,.3)}
.fb-sort-btn.active{border-color:var(--gold);color:var(--gold);background:rgba(197,160,89,.08)}
.fb-count{margin-left:auto;font-size:10px;color:var(--text-dim);letter-spacing:.1em}
#fb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.fb-card{
  background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;
  padding:16px;display:flex;flex-direction:column;gap:10px;
}
.fb-card-top{display:flex;align-items:flex-start;justify-content:space-between}
.fb-card-stars{font-size:13px;color:var(--gold);letter-spacing:2px}
.fb-card-type{font-size:9px;color:var(--text-dim);letter-spacing:.15em;margin-top:3px}
.fb-card-name{font-size:12px;color:var(--white);font-weight:500}
.fb-card-msg{font-size:12px;color:var(--text);line-height:1.6;flex:1}
.fb-card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:4px}
.fb-card-time{font-size:9px;color:var(--text-dim);letter-spacing:.08em}
.fb-del-btn{
  width:24px;height:24px;border-radius:50%;border:1px solid rgba(224,85,85,.25);
  background:transparent;color:rgba(224,85,85,.5);font-size:12px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.fb-del-btn:hover{background:rgba(224,85,85,.1);color:var(--err);border-color:var(--err)}
.fb-empty{text-align:center;padding:48px 24px;color:var(--text-dim);font-size:13px}

/* ── Undo toast ── */
.fb-undo-toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  background:rgba(9,25,10,.96);border:1px solid var(--border);border-radius:10px;
  padding:12px 18px;display:flex;align-items:center;gap:12px;
  box-shadow:0 8px 40px rgba(0,0,0,.5);backdrop-filter:blur(12px);
  z-index:999;animation:slideUp .25s ease;min-width:280px;
}
.fb-undo-toast.hiding{animation:slideDown .28s ease forwards}
@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes slideDown{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(16px)}}
.fb-undo-msg{font-size:12px;color:var(--white);flex:1}
.fb-undo-action{
  padding:6px 14px;border:1px solid rgba(197,160,89,.35);border-radius:6px;
  background:transparent;color:var(--gold);font-size:11px;cursor:pointer;
  font-family:'DM Sans',sans-serif;transition:all .2s;white-space:nowrap;
}
.fb-undo-action:hover{background:rgba(197,160,89,.1)}
.fb-undo-close{
  width:22px;height:22px;border-radius:50%;border:1px solid var(--border);
  background:transparent;color:var(--text);font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;
}
.fb-undo-close:hover{color:var(--white)}

/* ── About gallery (inside feedback tab for now) ── */
.about-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-top:14px}
.about-item{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;border:1px solid var(--border)}
.about-item img{width:100%;height:100%;object-fit:cover;display:block}
.about-del{
  position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;
  background:rgba(224,85,85,.8);border:none;color:#fff;font-size:12px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
}
.about-info{position:absolute;bottom:0;left:0;right:0;background:rgba(6,15,10,.75);padding:4px 6px}
.about-info-name{font-size:9px;color:rgba(255,255,255,.6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

@media(max-width:700px){
  .adm-body{padding:16px}
  .fields{grid-template-columns:1fr}
  #fb-list{grid-template-columns:1fr}
}
</style>
</head>
<body>

<!-- ═══ LOGIN SCREEN ═══ -->
<div id="login-screen">
  <div class="login-card">
    <div class="login-logo">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>
    <div class="login-title">Admin Panel</div>
    <div class="login-sub">Haroon's Events &middot; Secure Access</div>
    <form id="login-form" onsubmit="handleLogin(event)">
      <label for="pw-input">Admin Password</label>
      <input id="pw-input" type="password" placeholder="Enter admin password" autocomplete="current-password" required/>
      <div id="login-err" class="err hidden"></div>
      <button type="submit" class="btn-gold" id="login-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Access Admin Panel
      </button>
    </form>
  </div>
</div>

<!-- ═══ ADMIN SCREEN ═══ -->
<div id="admin-screen" class="hidden">
  <header class="adm-hdr">
    <div class="adm-hdr-l">
      <div class="adm-logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A059" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div>
        <div class="adm-brand">Admin Panel</div>
        <div class="adm-subb">Authenticated &middot; Content Manager</div>
      </div>
    </div>
    <button class="signout" onclick="signOut()">Sign Out</button>
  </header>

  <div class="adm-body">
    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active" id="tab-gallery"  onclick="switchTab('gallery')">&#128248;&nbsp; Gallery Upload</button>
      <button class="tab-btn"        id="tab-hero"     onclick="switchTab('hero')">&#128444;&#65039;&nbsp; Hero Media</button>
      <button class="tab-btn"        id="tab-about"    onclick="switchTab('about')">&#128247;&nbsp; About Photos</button>
      <button class="tab-btn"        id="tab-feedback" onclick="switchTab('feedback')">&#11088;&nbsp; Feedback</button>
    </div>

    <!-- ── Gallery Panel ── -->
    <div id="panel-gallery" class="panel active">
      <div class="sec">
        <div class="sec-title">Upload Images</div>
        <div class="dropzone" id="gal-drop" onclick="document.getElementById('gal-input').click()"
          ondragover="event.preventDefault();this.classList.add('drag')"
          ondragleave="this.classList.remove('drag')"
          ondrop="event.preventDefault();this.classList.remove('drag');addGalFiles(event.dataTransfer.files)">
          <div class="dz-icon">&#128248;</div>
          <div class="dz-title">Drag &amp; drop or click to select images</div>
          <div class="dz-sub">JPG &middot; PNG &middot; WebP &middot; Max 20 MB each</div>
        </div>
        <input type="file" id="gal-input" accept="image/*" multiple style="display:none"
          onchange="addGalFiles(this.files)"/>

        <div id="gal-queue">
          <div class="gal-queue-hdr">
            <span>&#128194; <span id="gal-queue-count">0</span> image(s) queued</span>
            <button onclick="clearGalQueue()">Clear All</button>
          </div>
          <div id="gal-thumbs"></div>
        </div>

        <div class="fields">
          <div class="field"><label>Title</label><input id="gal-title" placeholder="e.g. Royal Wedding"/></div>
          <div class="field"><label>Tag</label><input id="gal-tag" placeholder="e.g. Wedding"/></div>
        </div>
        <div style="margin-top:14px">
          <div class="field"><label>Category</label></div>
          <div class="cats">
            <button class="cat-btn active" data-cat="wedding"   onclick="selectCat(this)">Wedding</button>
            <button class="cat-btn"        data-cat="corporate" onclick="selectCat(this)">Corporate</button>
            <button class="cat-btn"        data-cat="social"    onclick="selectCat(this)">Social</button>
          </div>
        </div>

        <div id="gal-progress">
          <span id="gal-prog-text">Uploading 0 of 0…</span>
          <div class="prog-bar-wrap"><div class="prog-bar" id="gal-prog-bar"></div></div>
        </div>

        <button class="btn-upload" id="gal-btn" disabled onclick="uploadGallery()">Select Images First</button>
        <div id="gal-msg" class="hidden" style="margin-top:10px"></div>
      </div>

      <div class="sec">
        <div class="sec-title">Current Gallery</div>
        <div class="img-list-hdr">
          <span style="font-size:11px;color:var(--text-dim)">Uploaded images appear here</span>
          <span class="img-count-badge">&#128248; <span id="img-count">0</span> images</span>
        </div>
        <div id="img-list"></div>
      </div>
    </div>

    <!-- ── Hero Panel ── -->
    <div id="panel-hero" class="panel">
      <div class="sec">
        <div class="sec-title">Current Hero Background</div>
        <div id="hero-cur-wrap" class="hidden">
          <img  id="hero-cur-img"   src="" alt="Current Hero" style="display:none"/>
          <video id="hero-cur-vid" src="" controls muted loop playsinline style="display:none;width:100%;max-height:280px;border-radius:8px;object-fit:cover"></video>
          <div class="hero-cur-lbl">CURRENT</div>
        </div>
        <p id="hero-none-msg" style="font-size:12px;color:var(--text-dim);margin-bottom:14px">No custom hero set — using the default background.</p>
      </div>
      <div class="sec">
        <div class="sec-title">Upload New Hero Media <span style="font-size:10px;font-family:'DM Sans',sans-serif;color:var(--text-dim);letter-spacing:.05em">(image or video)</span></div>
        <div class="dropzone" id="hero-drop" onclick="document.getElementById('hero-input').click()"
          ondragover="event.preventDefault();this.classList.add('drag')"
          ondragleave="this.classList.remove('drag')"
          ondrop="event.preventDefault();this.classList.remove('drag');setHeroFile(event.dataTransfer.files[0])">
          <div class="dz-icon">&#127916;</div>
          <div class="dz-title">Click to choose hero image or video</div>
          <div class="dz-sub">JPG &middot; PNG &middot; WebP &middot; MP4 &middot; WebM &middot; MOV &middot; Max 300 MB</div>
        </div>
        <input type="file" id="hero-input" accept="image/*,video/*" style="display:none"
          onchange="setHeroFile(this.files[0])"/>
        <button class="btn-upload" id="hero-btn" disabled onclick="uploadHero()">Select a File First</button>
        <button class="btn-danger" id="hero-reset-btn" onclick="resetHero()" style="display:none">&#8617; Reset to Default Background</button>
        <div id="hero-msg" class="hidden" style="margin-top:10px"></div>
      </div>
    </div>

    <!-- ── About Panel ── -->
    <div id="panel-about" class="panel">
      <div class="sec">
        <div class="sec-title">About Gallery Images <span style="font-size:10px;font-family:'DM Sans',sans-serif;color:var(--text-dim);letter-spacing:.05em">(max 10)</span></div>
        <div class="dropzone" id="about-drop" onclick="document.getElementById('about-input').click()"
          ondragover="event.preventDefault();this.classList.add('drag')"
          ondragleave="this.classList.remove('drag')"
          ondrop="event.preventDefault();this.classList.remove('drag');uploadAboutFile(event.dataTransfer.files[0])">
          <div class="dz-icon">&#128247;</div>
          <div class="dz-title">Click or drag to add an about photo</div>
          <div class="dz-sub">JPG &middot; PNG &middot; WebP &middot; Max 20 MB</div>
        </div>
        <input type="file" id="about-input" accept="image/*" style="display:none"
          onchange="uploadAboutFile(this.files[0])"/>
        <div class="fields">
          <div class="field"><label>Title / Caption</label><input id="about-title" placeholder="e.g. Our Story"/></div>
          <div class="field"><label>Tag</label><input id="about-tag" placeholder="e.g. Story"/></div>
        </div>
        <div id="about-msg" class="hidden" style="margin-top:10px"></div>
        <div class="about-grid" id="about-grid"></div>
      </div>
    </div>

    <!-- ── Feedback Panel ── -->
    <div id="panel-feedback" class="panel">
      <div class="sec">
        <div class="sec-title">Customer Reviews</div>
        <div class="fb-toolbar">
          <button class="fb-sort-btn active" id="sort-newest"   onclick="sortFeedback('newest')">Newest</button>
          <button class="fb-sort-btn"        id="sort-oldest"   onclick="sortFeedback('oldest')">Oldest</button>
          <button class="fb-sort-btn"        id="sort-stars-hi" onclick="sortFeedback('stars-hi')">&#11088; High</button>
          <button class="fb-sort-btn"        id="sort-stars-lo" onclick="sortFeedback('stars-lo')">&#11088; Low</button>
          <span class="fb-count" id="fb-count">0 reviews</span>
        </div>
        <div id="fb-list"></div>
      </div>
    </div>
  </div>
</div>

<script>
  'use strict';

  /* ═══ State ═══ */
  let galFiles       = [];
  let selectedCat    = 'wedding';
  let heroFile       = null;
  let allFeedback    = [];
  let fbSortMode     = 'newest';
  let hiddenFeedbackIds = new Set();
  let fbToastEl      = null;
  let fbUndoTimer    = null;

  /* ═══ Utilities ═══ */
  function escapeHTML(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function fmtBytes(b) {
    return b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB';
  }
  function setMsg(id, text, isErr) {
    const el = document.getElementById(id);
    el.className = isErr ? 'err' : 'ok';
    el.textContent = text;
  }
  function clearMsg(id) {
    const el = document.getElementById(id);
    el.className = 'hidden';
    el.textContent = '';
  }

  /* ═══ Auth check on load ═══ */
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const r = await fetch('/api/admin/check-auth', { credentials: 'include' });
      if (r.ok) { enterAdmin(); }
    } catch {}
  });

  /* ═══ Login ═══ */
  async function handleLogin(e) {
    e.preventDefault();
    const pw    = document.getElementById('pw-input').value.trim();
    const btn   = document.getElementById('login-btn');
    const errEl = document.getElementById('login-err');
    btn.disabled = true;
    btn.textContent = 'Verifying\u2026';
    errEl.className = 'hidden';
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
        credentials: 'include',
      });
      if (r.ok) {
        enterAdmin();
      } else {
        const data = await r.json().catch(() => ({}));
        errEl.textContent = data.error || 'Incorrect password. Please try again.';
        errEl.className = 'err';
      }
    } catch {
      errEl.textContent = 'Cannot reach server. Make sure the backend is running on port 3001.';
      errEl.className = 'err';
    }
    btn.disabled = false;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Access Admin Panel';
  }

  function enterAdmin() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-screen').classList.remove('hidden');
    loadGallery();
    loadHeroCurrent();
    loadAboutGallery();
    loadFeedback();
  }

  async function signOut() {
    try { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); } catch {}
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-screen').classList.add('hidden');
    document.getElementById('pw-input').value = '';
    document.getElementById('login-err').className = 'hidden';
    galFiles = []; heroFile = null; allFeedback = [];
  }

  /* ═══ Tabs ═══ */
  function switchTab(name) {
    ['gallery','hero','about','feedback'].forEach(t => {
      document.getElementById('panel-' + t).classList.toggle('active', t === name);
      document.getElementById('panel-' + t).style.display = (t === name) ? 'block' : 'none';
      document.getElementById('tab-' + t).classList.toggle('active', t === name);
    });
  }
  // Initialise display
  ['gallery','hero','about','feedback'].forEach(t => {
    const p = document.getElementById('panel-' + t);
    if (p) p.style.display = t === 'gallery' ? 'block' : 'none';
  });

  /* ═══ Category ═══ */
  function selectCat(btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCat = btn.dataset.cat;
  }

  /* ═══ Gallery multi-file queue ═══ */
  function addGalFiles(fileList) {
    const allowed = /\.(jpe?g|png|webp|gif|avif)$/i;
    Array.from(fileList).forEach(f => {
      if (!f.type.startsWith('image/') && !allowed.test(f.name)) return;
      if (galFiles.find(x => x.name === f.name && x.size === f.size)) return;
      galFiles.push(f);
    });
    renderGalDrop();
    renderGalQueue();
  }

  function renderGalDrop() {
    const drop = document.getElementById('gal-drop');
    if (galFiles.length) {
      drop.classList.add('has-preview');
      drop.innerHTML = '<div class="dz-icon">&#128248;</div><div class="dz-title">' + galFiles.length + ' image' + (galFiles.length > 1 ? 's' : '') + ' queued</div><div class="dz-sub">Click to add more</div>';
    } else {
      drop.classList.remove('has-preview');
      drop.innerHTML = '<div class="dz-icon">&#128248;</div><div class="dz-title">Drag &amp; drop or click to select images</div><div class="dz-sub">JPG &middot; PNG &middot; WebP &middot; Max 20 MB each</div>';
    }
  }

  function renderGalQueue() {
    const queue    = document.getElementById('gal-queue');
    const thumbsEl = document.getElementById('gal-thumbs');
    const countEl  = document.getElementById('gal-queue-count');
    const btn      = document.getElementById('gal-btn');
    if (!galFiles.length) {
      queue.style.display = 'none';
      btn.disabled = true;
      btn.textContent = 'Select Images First';
      return;
    }
    queue.style.display = 'block';
    countEl.textContent = galFiles.length;
    btn.disabled = false;
    btn.textContent = 'Upload ' + galFiles.length + ' Image' + (galFiles.length > 1 ? 's' : '') + ' to Gallery';
    thumbsEl.innerHTML = '';
    galFiles.forEach((f, idx) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;border-radius:7px;overflow:hidden;aspect-ratio:1;background:#0a1f12;border:1px solid rgba(197,160,89,.15);';
        wrap.innerHTML =
          '<img src="' + ev.target.result + '" style="width:100%;height:100%;object-fit:cover;display:block;">' +
          '<button onclick="removeGalFile(' + idx + ')" style="position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(220,80,80,.85);border:none;color:#fff;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;">\u00d7</button>' +
          '<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(6,15,10,.75);font-size:8px;color:rgba(255,255,255,.5);padding:3px 5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHTML(f.name) + '</div>';
        thumbsEl.appendChild(wrap);
      };
      reader.readAsDataURL(f);
    });
  }

  function removeGalFile(idx) {
    galFiles.splice(idx, 1);
    renderGalDrop();
    renderGalQueue();
  }

  function clearGalQueue() {
    galFiles = [];
    document.getElementById('gal-input').value = '';
    renderGalDrop();
    renderGalQueue();
  }

  async function uploadGallery() {
    if (!galFiles.length) return;
    const btn      = document.getElementById('gal-btn');
    const progEl   = document.getElementById('gal-progress');
    const progText = document.getElementById('gal-prog-text');
    const progBar  = document.getElementById('gal-prog-bar');
    btn.disabled   = true;
    progEl.style.display = 'block';
    clearMsg('gal-msg');

    const title = document.getElementById('gal-title').value.trim() || 'Latest Event';
    const tag   = document.getElementById('gal-tag').value.trim()   || 'Event';
    let ok = 0, fail = 0;

    for (let i = 0; i < galFiles.length; i++) {
      progText.textContent = 'Uploading ' + (i + 1) + ' of ' + galFiles.length + '\u2026';
      progBar.style.width  = Math.round(((i) / galFiles.length) * 100) + '%';
      const fd = new FormData();
      fd.append('image', galFiles[i]);
      fd.append('title', title);
      fd.append('tag',   tag);
      fd.append('cat',   selectedCat);
      try {
        const r = await fetch('/api/admin/upload-gallery-image', { method: 'POST', body: fd, credentials: 'include' });
        r.ok ? ok++ : fail++;
      } catch { fail++; }
    }

    progBar.style.width = '100%';
    setTimeout(() => { progEl.style.display = 'none'; progBar.style.width = '0%'; }, 600);

    if (fail === 0) {
      setMsg('gal-msg', '\u2713 ' + ok + ' image' + (ok > 1 ? 's' : '') + ' uploaded successfully!', false);
    } else {
      setMsg('gal-msg', '\u2713 ' + ok + ' uploaded, \u2717 ' + fail + ' failed.', fail > 0 && ok === 0);
    }
    clearGalQueue();
    document.getElementById('gal-title').value = '';
    document.getElementById('gal-tag').value   = '';
    loadGallery();
  }

  async function loadGallery() {
    try {
      const r    = await fetch('/api/gallery-images');
      const imgs = await r.json();
      document.getElementById('img-count').textContent = imgs.length;
      const list = document.getElementById('img-list');
      list.innerHTML = '';
      if (!imgs.length) {
        list.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-dim);font-size:13px;">No images uploaded yet.</div>';
        return;
      }
      imgs.forEach(img => {
        const item = document.createElement('div');
        item.className = 'img-item';
        item.id = 'img-' + img.id;
        item.innerHTML =
          '<img class="img-thumb" src="' + escapeHTML(img.src) + '" alt="' + escapeHTML(img.title) + '">' +
          '<div class="img-info">' +
            '<div class="img-title">' + escapeHTML(img.title) + '</div>' +
            '<div class="img-meta">' + escapeHTML(img.tag) + ' &middot; ' + escapeHTML(img.cat) + '</div>' +
          '</div>' +
          '<button class="del-btn" data-id="' + escapeHTML(img.id) + '" onclick="deleteGalleryImg(this.dataset.id)" title="Delete">\u00d7</button>';
        list.appendChild(item);
      });
    } catch {}
  }

  async function deleteGalleryImg(id) {
    if (!confirm('Delete this image from the gallery?')) return;
    const item = document.getElementById('img-' + id);
    if (item) item.style.opacity = '0.4';
    try {
      await fetch('/api/admin/gallery-image/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' });
    } catch {}
    loadGallery();
  }

  /* ═══ Hero ═══ */
  function setHeroFile(f) {
    if (!f) return;
    const isVideo = f.type.startsWith('video/');
    const isImage = f.type.startsWith('image/');
    if (!isVideo && !isImage) return;
    heroFile = f;
    const drop = document.getElementById('hero-drop');
    drop.classList.add('has-preview');
    if (isVideo) {
      const url = URL.createObjectURL(f);
      drop.innerHTML =
        '<video src="' + url + '" controls muted loop playsinline style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;display:block;"></video>' +
        '<div class="prev-ov"><div class="prev-name">' + escapeHTML(f.name) + '</div><div class="prev-size">' + fmtBytes(f.size) + '</div></div>';
    } else {
      const reader = new FileReader();
      reader.onload = ev => {
        drop.innerHTML =
          '<img class="prev-img" src="' + ev.target.result + '" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;display:block;">' +
          '<div class="prev-ov"><div class="prev-name">' + escapeHTML(f.name) + '</div><div class="prev-size">' + fmtBytes(f.size) + '</div></div>';
      };
      reader.readAsDataURL(f);
    }
    const btn = document.getElementById('hero-btn');
    btn.disabled = false;
    btn.textContent = 'Set as Hero ' + (isVideo ? 'Video' : 'Image');
    clearMsg('hero-msg');
  }

  async function uploadHero() {
    if (!heroFile) return;
    const btn = document.getElementById('hero-btn');
    btn.disabled = true;
    btn.textContent = 'Uploading\u2026';
    const fd = new FormData();
    fd.append('file', heroFile);
    try {
      const r    = await fetch('/api/admin/upload-hero', { method: 'POST', body: fd, credentials: 'include' });
      const data = await r.json();
      if (r.ok && data.url) {
        const kind = heroFile.type.startsWith('video/') ? 'video' : 'image';
        setMsg('hero-msg', '\u2713 Hero ' + kind + ' updated! Refresh the website to see it live.', false);
        heroFile = null;
        document.getElementById('hero-input').value = '';
        const drop = document.getElementById('hero-drop');
        drop.classList.remove('has-preview');
        drop.innerHTML = '<div class="dz-icon">&#127916;</div><div class="dz-title">Click to choose hero image or video</div><div class="dz-sub">JPG &middot; PNG &middot; WebP &middot; MP4 &middot; WebM &middot; MOV &middot; Max 300 MB</div>';
        btn.textContent = 'Select a File First';
        loadHeroCurrent();
      } else {
        setMsg('hero-msg', '\u2717 ' + (data.error || 'Upload failed'), true);
        btn.disabled = false;
        btn.textContent = 'Set as Hero Background';
      }
    } catch {
      setMsg('hero-msg', '\u2717 Network error — is the backend running?', true);
      btn.disabled = false;
      btn.textContent = 'Set as Hero Background';
    }
  }

  async function loadHeroCurrent() {
    try {
      const r    = await fetch('/api/hero-image');
      const data = await r.json();
      const wrap = document.getElementById('hero-cur-wrap');
      const none = document.getElementById('hero-none-msg');
      const rst  = document.getElementById('hero-reset-btn');
      const imgEl = document.getElementById('hero-cur-img');
      const vidEl = document.getElementById('hero-cur-vid');
      if (data.url) {
        const isVid = /\.(mp4|webm|mov|avi|mkv)$/i.test(data.url);
        imgEl.style.display = isVid ? 'none' : 'block';
        vidEl.style.display = isVid ? 'block' : 'none';
        if (isVid) { vidEl.src = data.url; } else { imgEl.src = data.url; }
        wrap.classList.remove('hidden');
        none.style.display = 'none';
        rst.style.display  = '';
      } else {
        imgEl.style.display = 'none';
        vidEl.style.display = 'none';
        wrap.classList.add('hidden');
        none.style.display = '';
        rst.style.display  = 'none';
      }
    } catch {}
  }

  async function resetHero() {
    if (!confirm('Reset hero background to the default?')) return;
    const btn = document.getElementById('hero-reset-btn');
    btn.textContent = 'Resetting\u2026';
    try {
      await fetch('/api/admin/reset-hero', { method: 'DELETE', credentials: 'include' });
      setMsg('hero-msg', '\u2713 Reverted to default background.', false);
      loadHeroCurrent();
    } catch {
      setMsg('hero-msg', '\u2717 Reset failed', true);
    }
    btn.textContent = '\u21a9 Reset to Default Background';
  }

  /* ═══ About Gallery ═══ */
  async function uploadAboutFile(f) {
    if (!f || !f.type.startsWith('image/')) return;
    clearMsg('about-msg');
    const title = document.getElementById('about-title').value.trim() || 'Our Story';
    const tag   = document.getElementById('about-tag').value.trim()   || 'Story';
    const fd    = new FormData();
    fd.append('image', f);
    fd.append('title', title);
    fd.append('tag',   tag);
    try {
      const r    = await fetch('/api/admin/upload-about-image', { method: 'POST', body: fd, credentials: 'include' });
      const data = await r.json();
      if (r.ok) {
        setMsg('about-msg', '\u2713 Photo added to About section.', false);
        document.getElementById('about-input').value = '';
        document.getElementById('about-title').value = '';
        loadAboutGallery();
      } else {
        setMsg('about-msg', '\u2717 ' + (data.error || 'Upload failed'), true);
      }
    } catch {
      setMsg('about-msg', '\u2717 Network error', true);
    }
  }

  async function loadAboutGallery() {
    try {
      const r    = await fetch('/api/about-images');
      const imgs = await r.json();
      const grid = document.getElementById('about-grid');
      grid.innerHTML = '';
      imgs.forEach(img => {
        const wrap = document.createElement('div');
        wrap.className = 'about-item';
        wrap.id = 'about-' + img.id;
        wrap.innerHTML =
          '<img src="' + escapeHTML(img.src) + '" alt="' + escapeHTML(img.title) + '">' +
          '<button class="about-del" data-id="' + escapeHTML(img.id) + '" onclick="deleteAboutImg(this.dataset.id)" title="Delete">\u00d7</button>' +
          '<div class="about-info"><div class="about-info-name">' + escapeHTML(img.title) + '</div></div>';
        grid.appendChild(wrap);
      });
      if (!imgs.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-dim);font-size:12px;">No about photos yet.</div>';
      }
    } catch {}
  }

  async function deleteAboutImg(id) {
    if (!confirm('Remove this photo from the About section?')) return;
    try {
      await fetch('/api/admin/about-image/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' });
    } catch {}
    loadAboutGallery();
  }

  /* ═══ Feedback ═══ */
  async function loadFeedback() {
    try {
      const r = await fetch('/api/admin/reviews', { credentials: 'include' });
      allFeedback = await r.json();
      renderFeedback();
    } catch {}
  }

  function renderFeedback() {
    const list = document.getElementById('fb-list');
    const cnt  = document.getElementById('fb-count');
    let sorted = [...allFeedback].filter(r => !hiddenFeedbackIds.has(r.id));

    if (fbSortMode === 'oldest')   sorted.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (fbSortMode === 'stars-hi') sorted.sort((a,b) => (b.stars||0) - (a.stars||0));
    else if (fbSortMode === 'stars-lo') sorted.sort((a,b) => (a.stars||0) - (b.stars||0));
    else sorted.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    cnt.textContent = sorted.length + ' review' + (sorted.length !== 1 ? 's' : '');
    list.innerHTML  = '';

    if (!sorted.length) {
      list.innerHTML = '<div class="fb-empty">No reviews yet.</div>';
      return;
    }

    sorted.forEach(rv => {
      const safeName = escapeHTML((rv.name || 'Anonymous').slice(0, 60));
      const safeText = escapeHTML((rv.text || '').slice(0, 500));
      const safeType = escapeHTML((rv.type || '').slice(0, 40));
      const stars    = rv.stars ? '\u2605'.repeat(Math.min(5, rv.stars)) : '';
      const timeStr  = rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '';

      const card = document.createElement('div');
      card.className = 'fb-card';
      card.id = 'fb-' + rv.id;
      card.innerHTML =
        '<div class="fb-card-top"><div>' +
          '<div class="fb-card-stars">' + (stars || '\u2014') + '</div>' +
          '<div class="fb-card-type">' + safeType + '</div></div>' +
          '<div class="fb-card-name">' + safeName + '</div></div>' +
        '<div class="fb-card-msg">&ldquo;' + safeText + '&rdquo;</div>' +
        '<div class="fb-card-footer"><span class="fb-card-time">' + escapeHTML(timeStr) + '</span>' +
          '<button class="fb-del-btn" onclick="deleteFeedbackEntry(&quot;' + escapeHTML(rv.id) + '&quot;)" title="Delete">\u2715</button></div>';
      list.appendChild(card);
    });
  }

  function sortFeedback(mode) {
    fbSortMode = mode;
    document.querySelectorAll('.fb-sort-btn').forEach(b => b.classList.remove('active'));
    const map = { newest:'sort-newest', oldest:'sort-oldest', 'stars-hi':'sort-stars-hi', 'stars-lo':'sort-stars-lo' };
    const btn = document.getElementById(map[mode]);
    if (btn) btn.classList.add('active');
    renderFeedback();
  }

  function deleteFeedbackEntry(id) {
    const rv = allFeedback.find(r => r.id === id);
    if (!rv) return;
    hiddenFeedbackIds.add(id);
    renderFeedback();
    showUndoToast(rv);
  }

  function showUndoToast(rv) {
    if (fbToastEl) { fbToastEl.remove(); fbToastEl = null; }
    if (fbUndoTimer) { clearTimeout(fbUndoTimer); fbUndoTimer = null; }
    const toast = document.createElement('div');
    toast.className = 'fb-undo-toast';
    const name = escapeHTML((rv.name || 'Review').substring(0, 28));
    toast.innerHTML =
      '<span class="fb-undo-msg">Hidden: <strong>' + name + '</strong></span>' +
      '<button class="fb-undo-action" onclick="undoHideFeedback(&quot;' + escapeHTML(rv.id) + '&quot;)">&#8617; Undo</button>' +
      '<button class="fb-undo-close" onclick="dismissUndoToast()" title="Dismiss">&times;</button>';
    document.body.appendChild(toast);
    fbToastEl = toast;
    fbUndoTimer = setTimeout(() => { dismissUndoToast(); commitDeleteReview(rv.id); }, 6000);
  }

  function undoHideFeedback(id) {
    hiddenFeedbackIds.delete(id);
    if (fbUndoTimer) { clearTimeout(fbUndoTimer); fbUndoTimer = null; }
    dismissUndoToast();
    renderFeedback();
  }

  function dismissUndoToast() {
    if (!fbToastEl) return;
    fbToastEl.classList.add('hiding');
    setTimeout(() => { if (fbToastEl) { fbToastEl.remove(); fbToastEl = null; } }, 280);
    if (fbUndoTimer) { clearTimeout(fbUndoTimer); fbUndoTimer = null; }
  }

  async function commitDeleteReview(id) {
    try {
      await fetch('/api/admin/reviews/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' });
      allFeedback = allFeedback.filter(r => r.id !== id);
      hiddenFeedbackIds.delete(id);
      renderFeedback();
    } catch {}
  }
</script>
</body>
</html>`;

// ── Routes ────────────────────────────────────────────────────────────────

// Admin HTML page — per-request CSP nonce injected so inline scripts can't be forged
app.get('/admin', (_req, res) => {
  res.setHeader('Content-Security-Policy',
    `default-src 'self'; ` +
    `script-src 'self' 'unsafe-inline'; ` +
    `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; ` +
    `font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; ` +
    `img-src 'self' data: blob:; ` +
    `connect-src 'self'; ` +
    `media-src 'self'; ` +
    `object-src 'none'; ` +
    `frame-ancestors 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self';`
  );
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ADMIN_HTML);
});

// Auth check — used by the admin panel on page load to restore session from cookie
app.get('/api/admin/check-auth', (req, res) => {
  const token = req.cookies && req.cookies.admin_token;
  if (!token || revokedTokens.has(token)) return res.status(401).json({ ok: false });
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ ok: false });
  }
});

// Login — verifies bcrypt hash, issues JWT cookie
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  try {
    const match = await bcrypt.compare(String(password), ADMIN_PASSWORD_HASH);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   8 * 60 * 60 * 1000,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout — revoke token and clear cookie
app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies && req.cookies.admin_token;
  if (token) revokedTokens.add(token);
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

// ── Public gallery endpoints ───────────────────────────────────────────────
app.get('/api/gallery-images', (_req, res) => {
  res.json(readMeta());
});

// ── Admin gallery endpoints ────────────────────────────────────────────────
app.post('/api/admin/upload-gallery-image', requireAdmin, uploadLimiter, (req, res) => {
  uploadGallery.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const title = (req.body.title || '').trim().slice(0, 200) || 'Latest Event';
    const tag   = (req.body.tag   || '').trim().slice(0, 100) || 'Event';
    const cat   = (req.body.cat   || '').trim().slice(0, 50)  || 'wedding';

    const entry = {
      id:         req.file.filename,
      src:        `/uploads/gallery/${req.file.filename}`,
      title,
      tag,
      cat,
      uploadedAt: new Date().toISOString(),
    };

    const meta = readMeta();
    meta.unshift(entry);
    writeMeta(meta);
    res.json({ success: true, image: entry });
  });
});

app.delete('/api/admin/gallery-image/:id', requireAdmin, (req, res) => {
  // safeFilePath rejects any path traversal or invalid characters
  const filePath = safeFilePath(galleryDir, req.params.id);
  if (!filePath) return res.status(400).json({ error: 'Invalid id' });

  const meta = readMeta();
  const idx  = meta.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }
  catch (e) { console.warn('[WARN] Could not delete gallery file:', e.message); }

  meta.splice(idx, 1);
  writeMeta(meta);
  res.json({ success: true });
});

// ── Hero image endpoints ───────────────────────────────────────────────────
app.get('/api/hero-image', (_req, res) => {
  const data = readHeroMeta();
  if (data && data.filename) {
    res.json({ url: `/uploads/hero/${data.filename}` });
  } else {
    res.json({ url: null });
  }
});

app.post('/api/admin/upload-hero', requireAdmin, uploadLimiter, (req, res) => {
  uploadHero.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    // Delete the old hero file to reclaim disk space
    const old = readHeroMeta();
    if (old && old.filename) {
      const oldPath = safeFilePath(heroDir, old.filename);
      if (oldPath) try { fs.unlinkSync(oldPath); } catch {}
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    writeHeroMeta({ filename: req.file.filename, type: isVideo ? 'video' : 'image' });
    res.json({ success: true, url: `/uploads/hero/${req.file.filename}`, type: isVideo ? 'video' : 'image' });
  });
});

app.delete('/api/admin/reset-hero', requireAdmin, (req, res) => {
  const data = readHeroMeta();
  if (data && data.filename) {
    const p = safeFilePath(heroDir, data.filename);
    if (p) try { fs.unlinkSync(p); } catch {}
  }
  writeHeroMeta(null);
  res.json({ success: true });
});

// ── About Gallery routes ───────────────────────────────────────────────────
const ABOUT_LIMIT = 10;

app.get('/api/about-images', (_req, res) => {
  res.json(readAboutMeta());
});

app.post('/api/admin/upload-about-image', requireAdmin, uploadLimiter, (req, res) => {
  const current = readAboutMeta();
  if (current.length >= ABOUT_LIMIT) {
    return res.status(400).json({ error: `About gallery is full (max ${ABOUT_LIMIT} images). Delete some before uploading.` });
  }
  uploadAbout.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const title = (req.body.title || '').trim().slice(0, 200) || 'Our Story';
    const tag   = (req.body.tag   || '').trim().slice(0, 100) || 'Story';

    const entry = {
      id:         req.file.filename,
      src:        `/uploads/about/${req.file.filename}`,
      title,
      tag,
      uploadedAt: new Date().toISOString(),
    };

    const meta = readAboutMeta();
    meta.push(entry);
    writeAboutMeta(meta);
    res.json({ success: true, image: entry });
  });
});

app.delete('/api/admin/about-image/:id', requireAdmin, (req, res) => {
  const filePath = safeFilePath(aboutDir, req.params.id);
  if (!filePath) return res.status(400).json({ error: 'Invalid id' });

  const meta = readAboutMeta();
  const idx  = meta.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); }
  catch (e) { console.warn('[WARN] Could not delete about file:', e.message); }

  meta.splice(idx, 1);
  writeAboutMeta(meta);
  res.json({ success: true });
});

// ── Feedback / Reviews ─────────────────────────────────────────────────────
app.get('/api/feedback', (_req, res) => {
  res.json(readReviews());
});

app.post('/api/feedback', (req, res) => {
  const { name, text, stars, type } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'Name and review text are required.' });

  const entry = {
    id:        crypto.randomBytes(8).toString('hex'),
    name:      String(name).trim().slice(0, 100),
    text:      String(text).trim().slice(0, 1000),
    stars:     Math.min(5, Math.max(0, Number(stars) || 0)),
    type:      String(type || '').trim().slice(0, 50),
    createdAt: new Date().toISOString(),
  };

  const reviews = readReviews();
  reviews.unshift(entry);
  writeReviews(reviews);
  res.json({ success: true, review: entry });
});

app.get('/api/admin/reviews', requireAdmin, async (_req, res) => {
  // Merge reviews from Google Script (same source as the frontend) + any submitted via backend
  const local = readReviews();
  try {
    const r    = await fetch(GOOGLE_SCRIPT_URL);
    const remote = await r.json();
    // Deduplicate: local entries take precedence; remote entries without matching id are appended
    const localIds = new Set(local.map(x => x.id));
    const merged   = [...local, ...remote.filter(x => !localIds.has(x.id))];
    // Normalise field names (remote uses 'message' or 'text', and 'rating' or 'stars')
    const normalised = merged.map(rv => ({
      id:        rv.id        || '',
      name:      rv.name      || 'Anonymous',
      text:      rv.text      || rv.message || '',
      stars:     Number(rv.stars || rv.rating || 0),
      type:      rv.type      || rv.eventType || '',
      createdAt: rv.createdAt || rv.time || rv.date || '',
    }));
    return res.json(normalised);
  } catch {
    // Fallback to local-only if Google Script is unreachable
    return res.json(local.map(rv => ({
      id:        rv.id        || '',
      name:      rv.name      || 'Anonymous',
      text:      rv.text      || rv.message || '',
      stars:     Number(rv.stars || rv.rating || 0),
      type:      rv.type      || rv.eventType || '',
      createdAt: rv.createdAt || rv.time || rv.date || '',
    })));
  }
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  // Remove from local store (Google-script entries can only be hidden, not deleted from there)
  const reviews = readReviews();
  const idx = reviews.findIndex(r => r.id === req.params.id);
  if (idx !== -1) {
    reviews.splice(idx, 1);
    writeReviews(reviews);
  }
  res.json({ success: true });
});

// ── Contact form proxy → Google Apps Script ────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Contact proxy error:', err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// ── Static file serving ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
