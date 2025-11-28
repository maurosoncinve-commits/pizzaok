import React from 'react';

export const PizzaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v5.93zm2-14.86c1.01.23 1.94.69 2.73 1.32L12 10.27V5.07zM13 15l5.79-3.21c.13.58.21 1.17.21 1.79 0 4.08-3.05 7.44-7 7.93V15z" />
    </svg>
);
