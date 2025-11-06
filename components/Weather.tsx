import React, { useState } from 'react';
import { getWeatherData } from '../services/geminiService';
import { WeatherData } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import WeatherIcon from './icons/WeatherIcon';
import WeatherConditionIcon from './WeatherConditionIcon';

const Weather: React.FC = () => {
    const [location, setLocation] = useState('Davis, California');
    const [isLoading, setIsLoading] = useState(false);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location) {
            setError('Please enter a location.');
            return;
        }
        setIsLoading(true);
        setError('');
        setWeatherData(null);
        try {
            const responseText = await getWeatherData(location);
            const parsedData = JSON.parse(responseText) as WeatherData;
            setWeatherData(parsedData);
        } catch (err) {
            setError('Failed to fetch weather data. Please check the location or try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Weather Forecast" icon={<WeatherIcon />}>
                <p className="text-gray-400 mb-6">Enter a location to get the current weather and a 7-day forecast to help plan your farm activities.</p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:flex-grow">
                        <label htmlFor="location" className="sr-only">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., Napa Valley, California"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200">
                        {isLoading ? 'Fetching...' : 'Get Weather'}
                    </button>
                </form>
            </Card>

            {isLoading && <Spinner />}
            {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">{error}</div>}
            
            {weatherData && (
                 <div className="space-y-6">
                    {/* Current Weather Card */}
                    <Card title={`Current Weather in ${weatherData.location}`} icon={<WeatherIcon />}>
                         <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                            <div className="flex items-center gap-4">
                                <div className="text-green-400">
                                    <WeatherConditionIcon condition={weatherData.current.condition} className="w-20 h-20" />
                                </div>
                                <div>
                                    <p className="text-5xl font-bold text-white">{weatherData.current.temperature}°C</p>
                                    <p className="text-gray-300 text-lg">{weatherData.current.condition}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-gray-300">
                                <p><strong>Humidity:</strong> {weatherData.current.humidity}%</p>
                                <p><strong>Wind:</strong> {weatherData.current.windSpeed} km/h</p>
                            </div>
                        </div>
                    </Card>

                    {/* Forecast Card */}
                    <Card title="7-Day Forecast" icon={<WeatherIcon />}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                            {weatherData.forecast.map((day, index) => (
                                <div key={index} className="bg-gray-700 p-4 rounded-lg flex flex-col items-center justify-between">
                                    <p className="font-bold text-white">{day.day.substring(0,3)}</p>
                                    <div className="my-2 text-green-300">
                                        <WeatherConditionIcon condition={day.condition} className="w-10 h-10"/>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-white font-semibold">{day.high}°</p>
                                        <p className="text-gray-400">{day.low}°</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                 </div>
            )}
        </div>
    );
};

export default Weather;
