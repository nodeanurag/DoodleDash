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

export const HeartDoodle = ({ className, style }: DoodleProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21 C12 21 2 14 2 8.5 C2 5.42 4.42 3 7.5 3 C9.28 3 10.87 3.86 11.98 5.21 C13.09 3.86 14.7 3 16.5 3 C19.58 3 22 5.42 22 8.5 C22 14 12 21 12 21 Z" />
  </svg>
);

export const CrownDoodle = ({ className, style }: DoodleProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 2,18 L 4,8 L 9,12 L 12,5 L 15,12 L 20,8 L 22,18 Z" />
  </svg>
);
