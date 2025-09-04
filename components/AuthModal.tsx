import React, { useState } from 'react';
import { GoogleIcon, SparklesIcon, XMarkIcon } from './Icons';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, password?: string) => Promise<any>;
  onSignup: (email: string, password: string) => Promise<any>;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onSignup }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await onLogin(email, password);
      } else {
        await onSignup(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onLogin(email); // Call login with only email for social simulation
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };


  const switchView = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  const switchToGoogleFlow = () => {
    setIsGoogleFlow(true);
    setError(null);
  };
  
  const switchToEmailFlow = () => {
    setIsGoogleFlow(false);
    setError(null);
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 w-full max-w-md relative text-gray-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white" aria-label="Close authentication modal">
          <XMarkIcon />
        </button>
        
        {isGoogleFlow ? (
          <>
            <div className="text-center mb-6">
                <h2 id="auth-modal-title" className="text-2xl font-bold text-cyan-400 flex items-center justify-center space-x-2">
                    <GoogleIcon />
                    <span>Sign In with Google</span>
                </h2>
                <p className="text-gray-400 mt-1">Enter your email to continue</p>
            </div>
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    aria-label="Email Address"
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-600">
                    {isLoading ? <SparklesIcon className="animate-pulse w-6 h-6" /> : 'Sign In'}
                </button>
                <button type="button" onClick={switchToEmailFlow} className="w-full text-center text-sm text-gray-400 hover:text-white mt-2">
                    Back to other sign in options
                </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
                <h2 id="auth-modal-title" className="text-2xl font-bold text-cyan-400">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
                <p className="text-gray-400 mt-1">to sync your prompt history</p>
            </div>

            <div className="flex border-b border-gray-600 mb-6">
                <button 
                    onClick={() => switchView('signin')}
                    className={`flex-1 py-2 font-semibold transition-colors ${mode === 'signin' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => switchView('signup')}
                    className={`flex-1 py-2 font-semibold transition-colors ${mode === 'signup' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                aria-label="Email Address"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                aria-label="Password"
              />
              {mode === 'signup' && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  aria-label="Confirm Password"
                />
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              
              <button type="submit" disabled={isLoading} className="w-full flex justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-600">
                {isLoading ? <SparklesIcon className="animate-pulse w-6 h-6" /> : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-gray-600" />
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <hr className="flex-grow border-t border-gray-600" />
            </div>

            <button onClick={switchToGoogleFlow} disabled={isLoading} className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-600">
                <GoogleIcon />
                <span>Continue with Google</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
