import React from 'react';
import SunIcon from './icons/weather/SunIcon';
import CloudIcon from './icons/weather/CloudIcon';
import RainIcon from './icons/weather/RainIcon';
import SnowIcon from './icons/weather/SnowIcon';
import PartlyCloudyIcon from './icons/weather/PartlyCloudyIcon';
import ThunderstormIcon from './icons/weather/ThunderstormIcon';

interface WeatherConditionIconProps {
    condition: string;
    className?: string;
}

const WeatherConditionIcon: React.FC<WeatherConditionIconProps> = ({ condition, className = 'h-6 w-6' }) => {
    const normalizedCondition = condition.toLowerCase();

    if (normalizedCondition.includes('sun') || normalizedCondition.includes('clear')) {
        return <SunIcon className={className} />;
    }
    if (normalizedCondition.includes('partly cloudy')) {
        return <PartlyCloudyIcon className={className} />;
    }
    if (normalizedCondition.includes('cloud')) {
        return <CloudIcon className={className} />;
    }
    if (normalizedCondition.includes('rain') || normalizedCondition.includes('drizzle')) {
        return <RainIcon className={className} />;
    }
    if (normalizedCondition.includes('thunder') || normalizedCondition.includes('storm')) {
        return <ThunderstormIcon className={className} />;
    }
    if (normalizedCondition.includes('snow') || normalizedCondition.includes('sleet')) {
        return <SnowIcon className={className} />;
    }

    // Default icon
    return <CloudIcon className={className} />;
};

export default WeatherConditionIcon;
