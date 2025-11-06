import React, { useState } from 'react';
import CropAdvisor from './components/CropAdvisor';
import LivestockManager from './components/LivestockManager';
import BudgetPlanner from './components/BudgetPlanner';
import Weather from './components/Weather';
import AgriChat from './components/AgriChat';
import LeafIcon from './components/icons/LeafIcon';
import CowIcon from './components/icons/CowIcon';
import DollarIcon from './components/icons/DollarIcon';
import WeatherIcon from './components/icons/WeatherIcon';
import ChatIcon from './components/icons/ChatIcon';

type View = 'crop' | 'livestock' | 'budget' | 'weather' | 'agrichat';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('crop');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const renderView = () => {
        switch (activeView) {
            case 'crop': return <CropAdvisor />;
            case 'livestock': return <LivestockManager />;
            case 'budget': return <BudgetPlanner />;
            case 'weather': return <Weather />;
            case 'agrichat': return <AgriChat />;
            default: return <CropAdvisor />;
        }
    };

    const NavButton: React.FC<{ view: View; label: string; icon: React.ReactNode; }> = ({ view, label, icon }) => (
        <button
            onClick={() => {
                setActiveView(view);
                setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === view
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );

    const sidebarContent = (
      <>
        <div className="p-4 mb-6">
            <h1 className="text-2xl font-bold text-white text-center">
                Agri<span className="text-green-400">Mind</span>
            </h1>
            <p className="text-xs text-gray-400 text-center">Your AI Farm Assistant</p>
        </div>
        <nav className="flex-1 px-4 space-y-3">
            <NavButton view="crop" label="Crop Advisor" icon={<LeafIcon />} />
            <NavButton view="livestock" label="Livestock Manager" icon={<CowIcon />} />
            <NavButton view="budget" label="Budget Planner" icon={<DollarIcon />} />
            <NavButton view="weather" label="Weather Forecast" icon={<WeatherIcon />} />
            <NavButton view="agrichat" label="Agri-Chat" icon={<ChatIcon />} />
        </nav>
      </>
    )

    return (
        <div className="min-h-screen flex bg-gray-900 text-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-800 shadow-xl">
                {sidebarContent}
            </aside>
            
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-30 transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'bg-black bg-opacity-50' : 'pointer-events-none opacity-0'}`} onClick={() => setIsSidebarOpen(false)}></div>
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                  {sidebarContent}
                </div>
            </aside>

            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <div className="lg:hidden flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-white">
                        Agri<span className="text-green-400">Mind</span>
                    </h1>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default App;