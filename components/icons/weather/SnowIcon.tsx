import React from 'react';

const SnowIcon: React.FC<{className?: string}> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" transform="rotate(45 12 12)" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" transform="rotate(90 12 12)" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" transform="rotate(135 12 12)" />
    </svg>
);

export default SnowIcon;
