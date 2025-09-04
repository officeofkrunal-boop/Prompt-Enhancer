import React, { useState } from 'react';
import { HistoryItem } from '../hooks/useAuth';
import { CopyIcon, XMarkIcon } from './Icons';

interface HistorySidebarProps {
  history: HistoryItem[];
  onUseHistoryItem: (item: HistoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryListItem: React.FC<{ item: HistoryItem, onUse: () => void }> = ({ item, onUse }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRawCopied, setIsRawCopied] = useState(false);
    const [isModifiedCopied, setIsModifiedCopied] = useState(false);

    const handleCopy = (text: string, type: 'raw' | 'modified') => {
        navigator.clipboard.writeText(text);
        if (type === 'raw') {
            setIsRawCopied(true);
            setTimeout(() => setIsRawCopied(false), 2000);
        } else {
            setIsModifiedCopied(true);
            setTimeout(() => setIsModifiedCopied(false), 2000);
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-700/50"
                aria-expanded={isExpanded}
            >
                <div>
                    <p className="font-semibold text-cyan-400 truncate max-w-xs">
                        {item.rawPrompt}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                    </p>
                </div>
                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-gray-700 space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-gray-300">Raw Prompt</h4>
                            <button onClick={() => handleCopy(item.rawPrompt, 'raw')} className="text-gray-400 hover:text-white" aria-label="Copy raw prompt">
                                {isRawCopied ? <span className="text-sm text-green-400">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-gray-300 bg-gray-900/50 p-2 rounded text-sm whitespace-pre-wrap">{item.rawPrompt}</p>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-gray-300">Modified Prompt</h4>
                            <button onClick={() => handleCopy(item.modifiedPrompt, 'modified')} className="text-gray-400 hover:text-white" aria-label="Copy modified prompt">
                                {isModifiedCopied ? <span className="text-sm text-green-400">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-gray-300 bg-gray-900/50 p-2 rounded text-sm whitespace-pre-wrap">{item.modifiedPrompt}</p>
                    </div>
                    <div className="text-right">
                         <button
                            onClick={onUse}
                            className="bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors"
                         >
                            Use This Prompt
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onUseHistoryItem, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-heading"
      >
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 id="history-heading" className="text-xl font-bold text-gray-200">Prompt History</h3>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700" aria-label="Close history">
                    <XMarkIcon />
                </button>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>No history yet.</p>
                        <p className="text-sm">Enhance a prompt to save it here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map(item => (
                            <HistoryListItem key={item.id} item={item} onUse={() => onUseHistoryItem(item)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;