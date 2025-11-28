import React from 'react';

export const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18"></path>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
  </svg>
);