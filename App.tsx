import React, { useState, useCallback } from 'react';
import { enhancePrompt } from './services/geminiService';
import { CopyIcon, DownloadIcon, SparklesIcon, UserCircleIcon, HamburgerIcon, XMarkIcon } from './components/Icons';
import AuthModal from './components/AuthModal';
import HistorySidebar from './components/HistorySidebar';
import { useAuth, HistoryItem } from './hooks/useAuth';

interface PromptBoxProps {
    title: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    isReadOnly?: boolean;
    isLoading?: boolean;
    children?: React.ReactNode;
}

const PromptBox: React.FC<PromptBoxProps> = ({ title, value, onChange, placeholder, isReadOnly = false, isLoading = false, children }) => {
    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-cyan-400">{title}</h2>
                <div className="flex items-center space-x-2">
                    {children}
                </div>
            </div>
            <div className="relative flex-grow">
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    readOnly={isReadOnly}
                    className="w-full h-full p-4 bg-transparent text-gray-200 resize-none focus:outline-none placeholder-gray-500 disabled:opacity-50"
                    disabled={isReadOnly || isLoading}
                    aria-label={`${title} text area`}
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-b-lg">
                         <div className="flex items-center space-x-2 text-gray-300">
                            <SparklesIcon className="w-6 h-6 animate-pulse" />
                            <span className="text-lg">Enhancing...</span>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const { currentUser, login, signup, logout, addHistory, promptHistory } = useAuth();
    const [rawPrompt, setRawPrompt] = useState<string>('');
    const [modifiedPrompt, setModifiedPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);

    const handleEnhanceClick = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setModifiedPrompt('');
        try {
            const result = await enhancePrompt(rawPrompt);
            setModifiedPrompt(result);
            if (currentUser) {
                const newHistoryItem: Omit<HistoryItem, 'id' | 'timestamp'> = { rawPrompt, modifiedPrompt: result };
                addHistory(newHistoryItem);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [rawPrompt, currentUser, addHistory]);

    const handleCopy = useCallback(() => {
        if (!modifiedPrompt) return;
        navigator.clipboard.writeText(modifiedPrompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [modifiedPrompt]);

    const handleDownload = useCallback(() => {
        if (!modifiedPrompt) return;
        const blob = new Blob([modifiedPrompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced-prompt.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [modifiedPrompt]);

    const handleUseHistoryItem = useCallback((item: HistoryItem) => {
        setRawPrompt(item.rawPrompt);
        setModifiedPrompt(item.modifiedPrompt);
        setIsHistoryVisible(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <>
            <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
                <header className="flex justify-between items-center mb-8">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-3">
                            <SparklesIcon className="w-10 h-10 text-cyan-400"/>
                            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                                Prompt Enhancer
                            </h1>
                        </div>
                        <p className="mt-2 text-lg text-gray-400 text-left">
                            Refine your ideas into powerful, effective prompts with AI-driven analysis.
                        </p>
                    </div>
                    <div>
                        {currentUser ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <UserCircleIcon className="text-cyan-400" />
                                    <span className="text-gray-300 hidden sm:inline">{currentUser.email}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                                >
                                    Logout
                                </button>
                                <button
                                    onClick={() => setIsHistoryVisible(true)}
                                    className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                    title="Open Prompt History"
                                    aria-label="Open Prompt History"
                                >
                                    <HamburgerIcon />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 flex items-center space-x-2"
                            >
                                <UserCircleIcon />
                                <span>Login / Sign Up</span>
                            </button>
                        )}
                    </div>
                </header>
                
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PromptBox
                        title="Raw Prompt"
                        value={rawPrompt}
                        onChange={(e) => setRawPrompt(e.target.value)}
                        placeholder="Enter your initial prompt here..."
                        isLoading={isLoading}
                    >
                        {rawPrompt && !isLoading && (
                            <button
                                onClick={() => setRawPrompt('')}
                                className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                title="Clear text"
                                aria-label="Clear raw prompt text"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </PromptBox>
                    <PromptBox
                        title="Modified Prompt"
                        value={modifiedPrompt}
                        placeholder="Your enhanced prompt will appear here..."
                        isReadOnly={true}
                        isLoading={isLoading}
                    >
                        <button
                            onClick={handleCopy}
                            disabled={!modifiedPrompt || isLoading}
                            className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
                            title="Copy to clipboard"
                            aria-label="Copy modified prompt"
                        >
                            {isCopied ? <span className="text-sm text-green-400">Copied!</span> : <CopyIcon />}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!modifiedPrompt || isLoading}
                            className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
                            title="Download as .txt"
                            aria-label="Download modified prompt"
                        >
                            <DownloadIcon />
                        </button>
                        {modifiedPrompt && !isLoading && (
                            <button
                                onClick={() => setModifiedPrompt('')}
                                className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                title="Clear text"
                                aria-label="Clear modified prompt text"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </PromptBox>
                </main>
                
                <footer className="text-center mt-8 flex flex-col items-center">
                    {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded-lg mb-4 max-w-2xl">{error}</div>}
                    <button
                        onClick={handleEnhanceClick}
                        disabled={isLoading || !rawPrompt}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-400 to-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-600/50"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        <span>{isLoading ? 'Enhancing...' : 'Modify Prompt'}</span>
                    </button>
                </footer>
            </div>
            {isAuthModalOpen && (
                <AuthModal 
                    onClose={() => setAuthModalOpen(false)} 
                    onLogin={login}
                    onSignup={signup}
                />
            )}
            {currentUser && (
                <HistorySidebar 
                    history={promptHistory} 
                    onUseHistoryItem={handleUseHistoryItem}
                    isOpen={isHistoryVisible}
                    onClose={() => setIsHistoryVisible(false)}
                />
            )}
        </>
    );
};

export default App;