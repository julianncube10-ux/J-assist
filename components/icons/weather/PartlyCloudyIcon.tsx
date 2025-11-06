import React from 'react';

const PartlyCloudyIcon: React.FC<{className?: string}> = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5V4M12 8.5V7M9.5 7H8M16 7h-1.5M19.5 10.5h-1M19.5 14.5h-1M16 17h-1.5M9.5 17H8M5 14.5H4M5 10.5H4M7.5 7c.4-.8 1-1.5 1.8-2M14.7 5c.8.5 1.4 1.2 1.8 2M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.002 5.002 0 107.1 9.1a4 4 0 00-4.1 5.9z" />
    </svg>
);

export default PartlyCloudyIcon;
