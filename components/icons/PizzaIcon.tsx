
import React from 'react';

export const PizzaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <img 
        src="/logo.png" 
        alt="Pizza 'N Gooo" 
        className={`object-contain ${className}`} 
        onError={(e) => {
            // Fallback if image not found (prevents broken image icon)
            e.currentTarget.style.display = 'none';
        }}
    />
);
