import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6.343 17.657l-2.828 2.828M17.657 6.343l2.828-2.828M12 21v-4M21 12h-4M12 3v4M3 12h4m-2.828 5.657l2.828-2.828M17.657 17.657l2.828 2.828" />
    </svg>
);

export default SparklesIcon;