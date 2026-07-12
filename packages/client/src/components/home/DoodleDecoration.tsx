import React from 'react';

interface DoodleProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ZigzagDoodle = ({ className, style }: DoodleProps) => (
  <svg className={className} style={style} viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 5,15 L 20,5 L 35,25 L 50,5 L 65,25 L 80,5 L 95,15" />
  </svg>
);

export const StarDoodle = ({ className, style }: DoodleProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2" />
  </svg>
);
