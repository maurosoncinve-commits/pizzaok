import React from 'react';

export const TicketIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M3 6h18"></path>
    <path d="M3 18h18"></path>
    <path d="M13 6v12"></path>
    <path d="M3 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path>
  </svg>
);