
import React from 'react';

export const CloudIcon: React.FC<{ className?: string; status?: 'synced' | 'syncing' | 'error' }> = ({ className, status }) => {
    let colorClass = "text-gray-400";
    if (status === 'synced') colorClass = "text-green-500";
    if (status === 'syncing') colorClass = "text-yellow-400 animate-pulse";
    if (status === 'error') colorClass = "text-red-500";

    return (
        <svg 
            className={`${className} ${colorClass}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            {status === 'synced' && <polyline points="9 15 12 17 16 13" strokeWidth="3" className="text-black" />}
        </svg>
    );
};
