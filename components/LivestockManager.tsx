
import React, { useState } from 'react';
import { getLivestockSchedule } from '../services/geminiService';
import { LivestockTask } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import CowIcon from './icons/CowIcon';

const LivestockManager: React.FC = () => {
    const [type, setType] = useState('Dairy Cattle');
    const [count, setCount] = useState('50');
    const [stage, setStage] = useState('Lactating');
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState<LivestockTask[]>([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numCount = parseInt(count);
        if (!type || isNaN(numCount) || !stage) {
            setError('Please fill out all fields with valid values.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSchedule([]);
        try {
            const responseText = await getLivestockSchedule(type, numCount, stage);
            const parsedSchedule = JSON.parse(responseText) as LivestockTask[];
            setSchedule(parsedSchedule);
        } catch (err) {
            setError('Failed to generate or parse the schedule. The AI may have returned an unexpected format. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Livestock Manager" icon={<CowIcon />}>
                <p className="text-gray-400 mb-6">Generate a detailed weekly management plan for your livestock to improve productivity and animal welfare.</p>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Livestock Type</label>
                        <input type="text" id="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="count" className="block text-sm font-medium text-gray-300 mb-1">Number of Animals</label>
                        <input type="number" id="count" value={count} onChange={(e) => setCount(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="stage" className="block text-sm font-medium text-gray-300 mb-1">Production Stage</label>
                        <input type="text" id="stage" value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                         <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200">
                            {isLoading ? 'Generating Schedule...' : 'Generate Schedule'}
                        </button>
                    </div>
                </form>
            </Card>

            {isLoading && <Spinner />}
            {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">{error}</div>}
            {schedule.length > 0 && (
                <Card title="Weekly Management Schedule" icon={<CowIcon />}>
                    <div className="space-y-6">
                        {schedule.map((dayPlan) => (
                            <div key={dayPlan.day} className="bg-gray-900/50 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-green-400 mb-3">{dayPlan.day}</h3>
                                <div className="space-y-3">
                                    {dayPlan.tasks.map((task, index) => (
                                        <div key={index} className="p-3 bg-gray-700 rounded-md">
                                            <p className="font-semibold text-white">{task.time} - {task.activity}</p>
                                            <p className="text-gray-300 text-sm mt-1">{task.details}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LivestockManager;
