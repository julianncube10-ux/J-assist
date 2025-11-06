import React, { useState } from 'react';
import { getBudgetAnalysis } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';
import DollarIcon from './icons/DollarIcon';
import ExportIcon from './icons/ExportIcon';

interface BudgetItem {
    id: number;
    category: string;
    amount: string;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const BudgetPlanner: React.FC = () => {
    const [incomeItems, setIncomeItems] = useState<BudgetItem[]>([
        { id: Date.now() + 1, category: 'Milk sales', amount: '15000' },
        { id: Date.now() + 2, category: 'Crop sales', amount: '5000' },
        { id: Date.now() + 3, category: 'Livestock sales', amount: '3000' },
    ]);
    const [expenseItems, setExpenseItems] = useState<BudgetItem[]>([
        { id: Date.now() + 4, category: 'Animal feed', amount: '8000' },
        { id: Date.now() + 5, category: 'Vet bills', amount: '1500' },
        { id: Date.now() + 6, category: 'Labor', amount: '4000' },
        { id: Date.now() + 7, category: 'Machinery fuel & maintenance', amount: '2000' },
        { id: Date.now() + 8, category: 'Utilities', amount: '1000' },
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleItemChange = (id: number, field: 'category' | 'amount', value: string, type: 'income' | 'expense') => {
        const setItems = type === 'income' ? setIncomeItems : setExpenseItems;
        setItems(prevItems => prevItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleAddItem = (type: 'income' | 'expense') => {
        const newItem = { id: Date.now(), category: '', amount: '' };
        if (type === 'income') {
            setIncomeItems([...incomeItems, newItem]);
        } else {
            setExpenseItems([...expenseItems, newItem]);
        }
    };

    const handleRemoveItem = (id: number, type: 'income' | 'expense') => {
        const setItems = type === 'income' ? setIncomeItems : setExpenseItems;
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formatItemsToString = (items: BudgetItem[]) => {
            return items
                .filter(item => item.category.trim() !== '' && item.amount.trim() !== '' && parseFloat(item.amount) > 0)
                .map(item => `${item.category}: $${item.amount}`)
                .join(', ');
        };

        const incomeString = formatItemsToString(incomeItems);
        const expenseString = formatItemsToString(expenseItems);

        if (!incomeString || !expenseString) {
            setError('Please provide at least one valid income and expense item.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const analysis = await getBudgetAnalysis(incomeString, expenseString);
            setResult(analysis);
        } catch (err) {
            setError('Failed to get budget analysis. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const dataToExport = [
            ...incomeItems
                .filter(item => item.category.trim() && item.amount.trim())
                .map(item => ({ category: item.category, amount: item.amount, type: 'Income' })),
            ...expenseItems
                .filter(item => item.category.trim() && item.amount.trim())
                .map(item => ({ category: item.category, amount: item.amount, type: 'Expense' })),
        ];
    
        if (dataToExport.length === 0) {
            alert("No data to export.");
            return;
        }
    
        const csvHeader = 'Category,Amount,Type\n';
        const csvRows = dataToExport.map(item =>
            `"${item.category.replace(/"/g, '""')}",${item.amount},${item.type}`
        ).join('\n');
    
        const csvContent = csvHeader + csvRows;
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'farm_budget.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const renderBudgetItems = (items: BudgetItem[], type: 'income' | 'expense') => (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 sm:gap-4">
                    <div className="flex-1">
                        <label htmlFor={`${type}-category-${item.id}`} className="sr-only">Category</label>
                        <input
                            type="text"
                            id={`${type}-category-${item.id}`}
                            value={item.category}
                            onChange={(e) => handleItemChange(item.id, 'category', e.target.value, type)}
                            placeholder="Category (e.g., Crop Sales)"
                            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div className="w-32 sm:w-40">
                        <label htmlFor={`${type}-amount-${item.id}`} className="sr-only">Amount</label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                            <input
                                type="number"
                                id={`${type}-amount-${item.id}`}
                                value={item.amount}
                                onChange={(e) => handleItemChange(item.id, 'amount', e.target.value, type)}
                                placeholder="Amount"
                                className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:ring-green-500 focus:border-green-500 pl-7"
                                min="0"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id, type)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Remove item"
                    >
                        <TrashIcon />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => handleAddItem(type)}
                className="w-full sm:w-auto text-sm px-4 py-2 bg-gray-700 text-green-400 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-all duration-200"
            >
                + Add {type === 'income' ? 'Income Item' : 'Expense Item'}
            </button>
        </div>
    );


    return (
        <div className="space-y-6">
            <Card title="Budget Planner" icon={<DollarIcon />}>
                <p className="text-gray-400 mb-6">Detail your monthly income and expenses to receive an AI-powered financial analysis and optimization tips for your farm.</p>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Monthly Income</h3>
                        {renderBudgetItems(incomeItems, 'income')}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-200 mb-4">Monthly Expenses</h3>
                        {renderBudgetItems(expenseItems, 'expense')}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                         <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200">
                            {isLoading ? 'Analyzing Budget...' : 'Analyze Budget'}
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gray-700 text-green-400 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 transition-all duration-200"
                        >
                            <ExportIcon />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </form>
            </Card>

            {isLoading && <Spinner />}
            {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">{error}</div>}
            {result && (
                <Card title="Financial Analysis" icon={<DollarIcon />}>
                    <pre className="whitespace-pre-wrap font-sans text-gray-300">{result}</pre>
                </Card>
            )}
        </div>
    );
};

export default BudgetPlanner;