'use client';
import { useEffect, useRef } from 'react';

export default function Cursor() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const ringRef = useRef({ x: 0, y: 0, targetScale: 1, currentScale: 1 });
  const hoverRef = useRef(false);
  const clickRef = useRef(false);

  useEffect(() => {
    // Disable on mobile/tablet devices
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const particles = [];
    const maxParticles = 120;

    // Resize canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse position and add trail particles
    const onMouseMove = (e) => {
      const mouse = mouseRef.current;
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      const dx = mouse.x - mouse.lastX;
      const dy = mouse.y - mouse.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Only spawn particles if the cursor is moving
      if (speed > 1.5) {
        // Spawn more particles if moving fast or if hovering
        const count = hoverRef.current ? Math.min(4, Math.floor(speed * 0.25)) : Math.min(2, Math.floor(speed * 0.15));
        
        for (let i = 0; i < count; i++) {
          if (particles.length < maxParticles) {
            // Particle starts slightly offset from cursor
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 8;
            particles.push({
              x: mouse.x + Math.cos(angle) * dist,
              y: mouse.y + Math.sin(angle) * dist,
              vx: (Math.random() - 0.5) * 1.5 - (dx * 0.15), // drift opposite to movement
              vy: (Math.random() - 0.5) * 1.5 - (dy * 0.15),
              size: Math.random() * 2.2 + 0.8,
              alpha: Math.random() * 0.5 + 0.5,
              decay: Math.random() * 0.015 + 0.01,
              color: Math.random() > 0.35 ? '#C5A059' : '#e2c98a', // mix gold and light gold
              wobbleSpeed: Math.random() * 0.05,
              wobbleVal: Math.random() * 100
            });
          }
        }
      }

      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
    };

    // Detect interactives
    const onMouseOver = (e) => {
      const el = e.target;
      if (!el) return;
      const isInteractive = el.tagName === 'BUTTON' || el.tagName === 'A' ||
                            el.closest('button') || el.closest('a') ||
                            el.dataset?.cursor === 'hover';
      
      hoverRef.current = isInteractive;
      ringRef.current.targetScale = isInteractive ? 1.8 : 1.0;
    };

    const onMouseDown = () => {
      clickRef.current = true;
      ringRef.current.targetScale = hoverRef.current ? 1.2 : 0.6;
    };

    const onMouseUp = () => {
      clickRef.current = false;
      ringRef.current.targetScale = hoverRef.current ? 1.8 : 1.0;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    let animationFrameId;

    // Draw loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const ring = ringRef.current;

      // Update ring position (lagging behind cursor for smooth fluid feel)
      const ease = 0.15;
      ring.x += (mouse.x - ring.x) * ease;
      ring.y += (mouse.y - ring.y) * ease;

      // Smooth scale interpolation
      ring.currentScale += (ring.targetScale - ring.currentScale) * 0.2;

      // ─── 1. DRAW PARTICLES ───
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        // Apply friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Add a bit of natural hover wobble
        p.wobbleVal += p.wobbleSpeed;
        p.x += Math.sin(p.wobbleVal) * 0.2;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.6)';
        ctx.fill();
        ctx.restore();
      }

      // ─── 2. DRAW OUTER RING ───
      ctx.save();
      ctx.beginPath();
      const ringRadius = 18 * ring.currentScale;
      ctx.arc(ring.x, ring.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = hoverRef.current ? 'rgba(197, 160, 89, 0.8)' : 'rgba(197, 160, 89, 0.3)';
      ctx.lineWidth = 1;
      
      if (hoverRef.current) {
        ctx.fillStyle = 'rgba(197, 160, 89, 0.05)';
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.4)';
      }
      ctx.stroke();
      ctx.restore();

      // ─── 3. DRAW CENTER DOT ───
      ctx.save();
      ctx.beginPath();
      // Shrink center dot on click
      const dotRadius = clickRef.current ? 1.5 : (hoverRef.current ? 3 : 4);
      ctx.arc(mouse.x, mouse.y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = hoverRef.current ? '#e2c98a' : '#C5A059';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(197, 160, 89, 0.7)';
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-element"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
}
