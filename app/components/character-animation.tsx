'use client';

import React, { useEffect, useRef } from 'react';

interface CharacterAnimationProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span';
}

export default function CharacterAnimation({
  text,
  className = '',
  delay = 0,
  staggerDelay = 30,
  tag = 'span',
}: CharacterAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');
    
    // Initial timeout before starting animation
    const initialTimeout = setTimeout(() => {
      chars.forEach((char, index) => {
        setTimeout(() => {
          char.classList.add('visible');
        }, index * staggerDelay);
      });
    }, delay);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [delay, staggerDelay]);

  const renderCharacters = () => {
    return text.split('').map((char, index) => (
      <span key={index} className="char">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  const Tag = tag;
  const CustomTag = ({ ...props }) => React.createElement(Tag, props, renderCharacters());

  return (
    <div ref={containerRef} className={className}>
      <CustomTag />
    </div>
  );
} 