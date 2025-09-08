import { useState, useEffect, useCallback } from 'react';

// NOTE: This file has been repurposed to manage local prompt history
// as the authentication feature was removed.

export interface HistoryItem {
  id: string;
  rawPrompt: string;
  modifiedPrompt: string;
  timestamp: string;
}

const HISTORY_STORAGE_KEY = 'promptEnhancerHistory';

export const useHistory = () => {
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setPromptHistory(JSON.parse(storedHistory) as HistoryItem[]);
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, []);

  const addHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newHistoryItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setPromptHistory(prevHistory => {
      // Prevent adding exact duplicates of the most recent raw prompt
      if (prevHistory.length > 0 && prevHistory[0].rawPrompt === item.rawPrompt) {
          return prevHistory;
      }
      const updatedHistory = [newHistoryItem, ...prevHistory];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
      setPromptHistory([]);
      try {
          localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch (error) {
          console.error("Failed to clear history from localStorage", error);
      }
  }, []);

  return {
    promptHistory,
    addHistory,
    clearHistory,
  };
};
