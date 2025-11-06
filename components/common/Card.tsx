
import React from 'react';

interface CardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children }) => (
    <div className="bg-gray-800 rounded-xl shadow-lg w-full">
        <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center space-x-3">
            <div className="text-green-400">{icon}</div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="p-4 sm:p-6">
            {children}
        </div>
    </div>
);

export default Card;
