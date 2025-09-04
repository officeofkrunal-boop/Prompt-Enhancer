import { useState, useEffect, useCallback } from 'react';

// NOTE: This is a mock authentication system using localStorage.
// It is NOT secure for production use. Passwords are not properly hashed.

export interface User {
  email: string;
}

export interface HistoryItem {
  id: string;
  rawPrompt: string;
  modifiedPrompt: string;
  timestamp: string;
}

// Simple non-secure "hashing" for demonstration purposes.
const pseudoHash = (password: string) => btoa(password + 'salt');

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [promptHistory, setPromptHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        setCurrentUser(user);
        loadHistory(user.email);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
  }, []);

  const loadHistory = useCallback((email: string) => {
    try {
      const storedHistory = localStorage.getItem(`history_${email}`);
      if (storedHistory) {
        setPromptHistory(JSON.parse(storedHistory) as HistoryItem[]);
      } else {
        setPromptHistory([]);
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate async operation
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[email]) {
          return reject(new Error("User with this email already exists."));
        }
        users[email] = { password: pseudoHash(password) };
        localStorage.setItem('users', JSON.stringify(users));
        
        const newUser: User = { email };
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        setCurrentUser(newUser);
        setPromptHistory([]); // Start with fresh history
        resolve(newUser);
      }, 500);
    });
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<User> => {
     return new Promise((resolve, reject) => {
      setTimeout(() => { // Simulate async operation
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        
        // Google/Social login simulation
        if (!password) {
            if (!users[email]) { // Auto-register for social login
                 users[email] = { password: pseudoHash('social_login_mock_password') };
                 localStorage.setItem('users', JSON.stringify(users));
            }
        } else { // Email/password login
            if (!users[email] || users[email].password !== pseudoHash(password)) {
                return reject(new Error("Invalid email or password."));
            }
        }
        
        const user: User = { email };
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        loadHistory(email);
        resolve(user);
      }, 500);
    });
  }, [loadHistory]);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setPromptHistory([]);
  }, []);

  const addHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (!currentUser) return;

    const newHistoryItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setPromptHistory(prevHistory => {
      const updatedHistory = [newHistoryItem, ...prevHistory];
      try {
        localStorage.setItem(`history_${currentUser.email}`, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  }, [currentUser]);

  return {
    currentUser,
    promptHistory,
    login,
    signup,
    logout,
    addHistory,
  };
};
