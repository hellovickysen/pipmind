"use client";

import { useEffect, useRef } from 'react';

/**
 * CursorGlow — renders a large radial gradient that follows the mouse cursor.
 * Creates a subtle ambient light effect across the landing page.
 * Respects prefers-reduced-motion.
 */
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    // Respect reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.style.display = 'none';
      return;
    }

    let raf;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;

    function onMove(e) {
      mx = e.clientX;
      my = e.clientY;
    }

    function tick() {
      // Smooth follow — lerp toward mouse position
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-[2] hidden sm:block"
      style={{
        width: '600px',
        height: '600px',
        borderRadius: '9999px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, rgba(139, 92, 246, 0.03) 30%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
