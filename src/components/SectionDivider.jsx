'use client';
/**
 * SectionDivider – smooth SVG-carved edge between sections.
 *
 * Props:
 *  fromColor  – fill of the "upper" section (used for the wave shape colour)
 *  toColor    – fill of the "lower" section (background behind the wave)
 *  flip       – if true, the wave faces downward instead of upward
 *  height     – height of the divider in px (default 90)
 *  variant    – 'wave' | 'tilt' | 'double' | 'arc'  (default 'wave')
 */
export default function SectionDivider({
  fromColor = '#080f0b',
  toColor   = '#0a1a12',
  flip      = false,
  height    = 90,
  variant   = 'wave',
}) {
  const paths = {
    wave: 'M0,40 C200,90 400,-10 600,45 C800,100 1000,10 1200,50 C1400,90 1600,20 1920,55 L1920,100 L0,100 Z',
    tilt: 'M0,0 L1920,80 L1920,100 L0,100 Z',
    double:
      'M0,60 C320,110 640,10 960,60 C1280,110 1600,10 1920,60 L1920,100 L0,100 Z',
    arc: 'M0,100 Q960,-30 1920,100 Z',
  };

  const d = paths[variant] ?? paths.wave;

  const wrapStyle = {
    position: 'relative',
    width: '100%',
    height,
    overflow: 'hidden',
    background: toColor,
    // kill any 1-px gap between sections
    marginTop: -1,
    display: 'block',
    lineHeight: 0,
  };

  const svgStyle = {
    position: 'absolute',
    bottom: flip ? 'auto' : 0,
    top: flip ? 0 : 'auto',
    left: 0,
    width: '100%',
    height: '100%',
    transform: flip ? 'scaleY(-1)' : 'none',
  };

  return (
    <div style={wrapStyle} aria-hidden="true">
      <svg
        viewBox="0 0 1920 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={svgStyle}
      >
        <path d={d} fill={fromColor} />
      </svg>
    </div>
  );
}
