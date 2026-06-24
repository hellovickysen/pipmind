"use client";

import { useCallback } from 'react';

/**
 * CardGlow — wraps landing cards to add a cursor-reactive border glow.
 * On hover, a radial gradient highlights the card border nearest the cursor.
 */
export default function CardGlow({ children, className = '', style, ...rest }) {
  const onMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--glow-x', `${x}px`);
    e.currentTarget.style.setProperty('--glow-y', `${y}px`);
  }, []);

  return (
    <div className={`card-glow ${className}`} style={style} onMouseMove={onMove} {...rest}>
      {children}
    </div>
  );
}
