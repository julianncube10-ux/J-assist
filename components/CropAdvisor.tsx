import React, { useState } from 'react';
import { getCropAdvice } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';
import LeafIcon from './icons/LeafIcon';

const CropAdvisor: React.FC = () => {
    const [soil, setSoil] = useState('Loamy');
    const [ph, setPh] = useState('6.5');
    const [location, setLocation] = useState('Central Valley, California');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [groundingChunks, setGroundingChunks] = useState<any[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!soil || !ph || !location) {
            setError('Please fill out all fields.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');
        setGroundingChunks([]);
        try {
            const { text, groundingChunks } = await getCropAdvice(soil, ph, location);
            setResult(text);
            setGroundingChunks(groundingChunks);
        } catch (err) {
            setError('Failed to get advice. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Crop Advisor" icon={<LeafIcon />}>
                <p className="text-gray-400 mb-6">Enter your farm's environmental conditions to get personalized crop recommendations from our AI agronomist, enhanced with real-time web and map data.</p>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="soil" className="block text-sm font-medium text-gray-300 mb-1">Soil Type</label>
                        <input type="text" id="soil" value={soil} onChange={(e) => setSoil(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="ph" className="block text-sm font-medium text-gray-300 mb-1">Soil pH</label>
                        <input type="text" id="ph" value={ph} onChange={(e) => setPh(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                        <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                         <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200">
                            {isLoading ? 'Getting Advice...' : 'Get Crop Advice'}
                        </button>
                    </div>
                </form>
            </Card>

            {isLoading && <Spinner />}
            {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">{error}</div>}
            {result && (
                <Card title="AI Recommendation" icon={<LeafIcon />}>
                     {groundingChunks.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
                            <h3 className="text-md font-semibold text-green-400 mb-2">Sources:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {groundingChunks.map((chunk, index) => {
                                    const source = chunk.web || chunk.maps;
                                    const uri = source?.uri;
                                    const title = source?.title || uri;
                                    if (!uri) return null;
                                    
                                    return (
                                        <li key={index}>
                                            <a href={uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                {title}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans text-gray-300">{result}</pre>
                </Card>
            )}
        </div>
    );
};

export default CropAdvisor;