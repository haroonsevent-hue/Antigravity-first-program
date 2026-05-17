import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef([]);
  const posRef  = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const hoverRef = useRef(false);
  const stateRef = useRef('default'); // default | hover | click

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const onMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
    };

    const onOver = (e) => {
      const el = e.target;
      const isInteractive = el.tagName === 'BUTTON' || el.tagName === 'A' ||
                            el.closest('button') || el.closest('a') ||
                            el.dataset?.cursor === 'hover';
      hoverRef.current = isInteractive;
    };

    const onDown = () => { stateRef.current = 'click'; };
    const onUp   = () => { stateRef.current = hoverRef.current ? 'hover' : 'default'; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    let frame;
    const loop = () => {
      const p = posRef.current;
      p.rx += (p.x - p.rx) * 0.12;
      p.ry += (p.y - p.ry) * 0.12;

      const isHover = hoverRef.current;
      const isClick = stateRef.current === 'click';

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.x - 4}px, ${p.y - 4}px, 0) scale(${isClick ? 0.4 : 1})`;
      }
      if (ringRef.current) {
        const scale = isClick ? 0.8 : isHover ? 2.2 : 1;
        const bColor = isHover ? 'rgba(197,160,89,0.8)' : 'rgba(197,160,89,0.25)';
        const bg     = isHover ? 'rgba(197,160,89,0.06)' : 'transparent';
        ringRef.current.style.transform = `translate3d(${p.rx - 20}px, ${p.ry - 20}px, 0) scale(${scale})`;
        ringRef.current.style.borderColor = bColor;
        ringRef.current.style.background  = bg;
      }

      frame = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="cursor-element"
        style={{
          position: 'fixed', top: 0, left: 0, width: 8, height: 8,
          background: 'var(--gold)', borderRadius: '50%',
          zIndex: 999999, pointerEvents: 'none', willChange: 'transform',
          transition: 'transform 0.1s ease',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="cursor-element"
        style={{
          position: 'fixed', top: 0, left: 0, width: 40, height: 40,
          border: '1px solid rgba(197,160,89,0.25)', borderRadius: '50%',
          zIndex: 999998, pointerEvents: 'none', willChange: 'transform',
          transition: 'transform 0.15s ease, border-color 0.3s, background 0.3s, transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
      />
    </>
  );
}
